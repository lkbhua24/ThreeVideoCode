const express = require('express');
const cors = require('cors');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const { generateThumbnail, getThumbnailPath } = require('./thumbnail');

// Load configuration
const configPath = path.join(__dirname, 'server.config.json');
let config = { mediaRoot: './media', port: 3300 };

try {
  if (fs.existsSync(configPath)) {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    config = { ...config, ...JSON.parse(fileContent) };
  }
} catch (error) {
  console.error('Failed to load config, using defaults:', error);
}

const app = express();
const PORT = config.port || 3300;
const MEDIA_ROOT = path.resolve(config.mediaRoot);

app.use(cors());
app.use(express.json());

// In-memory index
// Map<filePath, { id, name, url, type, date, timestamp, size }>
const memoryIndex = new Map();

// Helper to generate ID (simple hash)
const generateId = (filePath) => {
  let hash = 0;
  for (let i = 0; i < filePath.length; i++) {
    const char = filePath.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
};

// Helper to get file type
const getFileType = (ext) => {
  const videoExts = ['.mp4', '.mov', '.avi'];
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
  const audioExts = ['.mp3', '.wav', '.flac', '.m4a', '.aac', '.ogg'];
  
  ext = ext.toLowerCase();
  if (videoExts.includes(ext)) return 'video';
  if (imageExts.includes(ext)) return 'image';
  if (audioExts.includes(ext)) return 'audio';
  return 'unknown';
};

// Initialize Chokidar watcher
console.log(`Watching for media in: ${MEDIA_ROOT}`);

// Create media root if not exists
if (!fs.existsSync(MEDIA_ROOT)) {
    try {
        fs.mkdirSync(MEDIA_ROOT, { recursive: true });
        console.log(`Created media root directory: ${MEDIA_ROOT}`);
    } catch (err) {
        console.error(`Failed to create media root: ${err.message}`);
    }
}

const watcher = chokidar.watch(MEDIA_ROOT, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

watcher
  .on('add', (filePath) => {
    try {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath);
      const type = getFileType(ext);
      
      if (type !== 'unknown') {
        const relativePath = path.relative(MEDIA_ROOT, filePath);
        const id = generateId(relativePath);
        
        // Generate URL: encode each path segment to handle special chars but keep directory structure
        const urlPath = relativePath.split(path.sep).map(encodeURIComponent).join('/');
        
        const memoryItem = {
          id,
          name: path.basename(filePath),
          url: `/media/${urlPath}`,
          thumbnail: `/api/thumbnail/${id}`,
          type,
          date: stats.mtime.toISOString().split('T')[0], // YYYY-MM-DD
          timestamp: stats.mtime.getTime(),
          size: stats.size,
          relativePath
        };
        
        memoryIndex.set(relativePath, memoryItem);
        console.log(`Added: ${relativePath}`);
        
        // Trigger thumbnail generation
        generateThumbnail(filePath, id, type);
      }
      }
    } catch (err) {
      console.error(`Error processing file ${filePath}:`, err);
    }
  })
  .on('change', (filePath) => {
     // Re-process on change
     watcher.emit('add', filePath);
  })
  .on('unlink', (filePath) => {
    const relativePath = path.relative(MEDIA_ROOT, filePath);
    if (memoryIndex.has(relativePath)) {
      memoryIndex.delete(relativePath);
      console.log(`Removed: ${relativePath}`);
    }
  });

// API: Get all memories
app.get('/api/memories', (req, res) => {
  const memories = Array.from(memoryIndex.values()).sort((a, b) => b.timestamp - a.timestamp);
  res.json(memories);
});

// API: Get thumbnail
app.get('/api/thumbnail/:id', (req, res) => {
  const { id } = req.params;
  const thumbPath = getThumbnailPath(id);
  
  if (fs.existsSync(thumbPath)) {
    res.sendFile(thumbPath);
  } else {
    // Return a placeholder or 404
    // For now, let's return 404, client can show default icon
    res.status(404).send('Thumbnail not found');
  }
});

// API: Stream media
app.get('/media/*', (req, res) => {
  // req.params[0] contains the path after /media/
  // It is automatically decoded by Express
  const relativePath = req.params[0];
  
  if (!relativePath) {
      return res.status(400).send('Invalid path');
  }

  // Security check: ensure path is within MEDIA_ROOT
  const fullPath = path.resolve(MEDIA_ROOT, relativePath);
  
  // Prevent path traversal
  if (!fullPath.startsWith(MEDIA_ROOT)) {
    return res.status(403).send('Access denied');
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).send('File not found');
  }

  const stat = fs.statSync(fullPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  const contentType = mime.lookup(fullPath) || 'application/octet-stream';

  if (range) {
    // Handle Range Request
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;

    // Validate range
    if (start >= fileSize || end >= fileSize) {
        res.status(416).header('Content-Range', `bytes */${fileSize}`).send('Requested Range Not Satisfiable');
        return;
    }

    const file = fs.createReadStream(fullPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // Handle Normal Request
    const head = {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes', // Advertise support for ranges
    };
    res.writeHead(200, head);
    fs.createReadStream(fullPath).pipe(res);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Media Root: ${MEDIA_ROOT}`);
});

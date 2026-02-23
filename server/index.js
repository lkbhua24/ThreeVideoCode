const express = require('express');
const cors = require('cors');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const { generateThumbnail, getThumbnailPath } = require('./thumbnail');

console.log('Starting server initialization...');

// Load configuration
const configPath = path.join(__dirname, 'server.config.json');
let config = { mediaRoot: './media', port: 3300 };

try {
  if (fs.existsSync(configPath)) {
    console.log('Loading config from', configPath);
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    config = { ...config, ...JSON.parse(fileContent) };
  } else {
    console.log('Config file not found, using defaults');
  }
} catch (error) {
  console.error('Failed to load config, using defaults:', error);
}

const app = express();
const PORT = config.port || 3300;
console.log('Using port:', PORT);
const MEDIA_ROOT = path.resolve(config.mediaRoot);
const SELECTED_PHOTOS_ROOT = config.selectedPhotosRoot ? path.resolve(config.selectedPhotosRoot) : null;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

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

// Track last update time for polling
let lastMediaUpdate = Date.now();

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
        lastMediaUpdate = Date.now(); // Update timestamp on file add
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
    } catch (err) {
      console.error(`Error processing file ${filePath}:`, err);
    }
  })
  .on('change', (filePath) => {
     // Re-process on change
     watcher.emit('add', filePath);
  })
  .on('unlink', (filePath) => {
    lastMediaUpdate = Date.now(); // Update timestamp on file remove
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

// API: Get media status (for polling updates)
app.get('/api/media-status', (req, res) => {
  res.json({ lastMediaUpdate });
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

// API: Get selected photos
app.get('/api/selected-photos', (req, res) => {
  if (!SELECTED_PHOTOS_ROOT || !fs.existsSync(SELECTED_PHOTOS_ROOT)) {
    // If directory doesn't exist, create it to avoid 404s
    if (SELECTED_PHOTOS_ROOT) {
        try {
            fs.mkdirSync(SELECTED_PHOTOS_ROOT, { recursive: true });
        } catch (e) {
            console.error('Failed to create selected photos root:', e);
        }
    }
    return res.json([]);
  }

  try {
    const files = fs.readdirSync(SELECTED_PHOTOS_ROOT);
    const photos = files
      .filter(file => {
        const ext = path.extname(file);
        return getFileType(ext) === 'image';
      })
      .map(file => ({
        name: file,
        url: `/selected-media/${encodeURIComponent(file)}`
      }));

    // Fisher-Yates Shuffle
    for (let i = photos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [photos[i], photos[j]] = [photos[j], photos[i]];
    }

    res.json(photos.slice(0, 20)); // Return top 20 random photos
  } catch (err) {
    console.error('Error reading selected photos:', err);
    res.status(500).json({ error: 'Failed to read photos' });
  }
});

// API: Get travel pins (top 4 cities)
app.get('/api/travel-pins', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'travel-pins.json');
  let cities = [];

  // 1. Load metadata
  try {
    if (fs.existsSync(dataPath)) {
      cities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load travel-pins.json:', err);
  }

  // 2. Scan media directories for photos
  const result = cities.map(city => {
    const folderPath = path.join(MEDIA_ROOT, city.folderName || city.cityEN);
    let photos = [];

    if (fs.existsSync(folderPath)) {
      try {
        photos = fs.readdirSync(folderPath)
          .filter(file => {
            const ext = path.extname(file);
            return getFileType(ext) === 'image';
          })
          .map(file => `/media/${encodeURIComponent(city.folderName || city.cityEN)}/${encodeURIComponent(file)}`);
      } catch (e) {
        console.error(`Error reading folder ${folderPath}:`, e);
      }
    }

    return {
      ...city,
      photos
    };
  })
  // Filter out cities with no photos? Or keep them as placeholders?
  // Let's keep them but client should handle empty photos array.
  .sort((a, b) => new Date(a.arrivedAt) - new Date(b.arrivedAt)) // Sort by date ascending
  .slice(0, 4); // Take top 4

  res.json(result);
});

// API: Get media items for a specific city (images and videos)
app.get('/api/city-media/:city', (req, res) => {
  const key = decodeURIComponent(req.params.city);
  const dataPath = path.join(__dirname, 'data', 'travel-pins.json');
  let cities = [];
  try {
    if (fs.existsSync(dataPath)) {
      cities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load travel-pins.json:', err);
    return res.status(500).json({ error: 'Failed to load city metadata' });
  }
  const meta = cities.find(c => c.cityEN === key || c.cityCN === key || c.folderName === key);
  if (!meta) {
    return res.status(404).json({ error: 'City not found' });
  }
  const folderName = meta.folderName || meta.cityEN;
  const folderPath = path.join(MEDIA_ROOT, folderName);
  if (!fs.existsSync(folderPath)) {
    return res.json({ ...meta, items: [] });
  }
  let items = [];
  try {
    const files = fs.readdirSync(folderPath);
    items = files
      .filter(file => {
        const ext = path.extname(file);
        const type = getFileType(ext);
        return type === 'image' || type === 'video';
      })
      .map(file => {
        const relativePath = path.join(folderName, file);
        const id = generateId(relativePath);
        const type = getFileType(path.extname(file));
        const url = `/media/${encodeURIComponent(folderName)}/${encodeURIComponent(file)}`;
        const thumbnail = type === 'image' ? url : `/api/thumbnail/${id}`;
        return { id, type, url, thumbnail, name: file };
      });
  } catch (e) {
    console.error(`Error reading folder ${folderPath}:`, e);
  }
  res.json({ ...meta, items });
});
// API: Get all travel pins (no limit)
app.get('/api/travel-pins-all', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'travel-pins.json');
  let cities = [];
  try {
    if (fs.existsSync(dataPath)) {
      cities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load travel-pins.json:', err);
  }
  const result = cities.map(city => {
    const folderPath = path.join(MEDIA_ROOT, city.folderName || city.cityEN);
    let photos = [];
    if (fs.existsSync(folderPath)) {
      try {
        photos = fs.readdirSync(folderPath)
          .filter(file => {
            const ext = path.extname(file);
            return getFileType(ext) === 'image';
          })
          .map(file => `/media/${encodeURIComponent(city.folderName || city.cityEN)}/${encodeURIComponent(file)}`);
      } catch (e) {
        console.error(`Error reading folder ${folderPath}:`, e);
      }
    }
    return { ...city, photos };
  }).sort((a, b) => new Date(a.arrivedAt) - new Date(b.arrivedAt));
  res.json(result);
});

// API: Get all stories
app.get('/api/stories', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'stories.json');
  try {
    if (!fs.existsSync(dataPath)) {
      return res.json([]);
    }
    const stories = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    res.json(stories.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (err) {
    console.error('Failed to load stories.json:', err);
    res.status(500).json({ error: 'Failed to load stories' });
  }
});

// API: Create new story
app.post('/api/stories', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'stories.json');
  try {
    let stories = [];
    if (fs.existsSync(dataPath)) {
      stories = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
    
    const newStory = {
      id: generateId(Date.now().toString()),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    stories.push(newStory);
    fs.writeFileSync(dataPath, JSON.stringify(stories, null, 2), 'utf-8');
    res.status(201).json(newStory);
  } catch (err) {
    console.error('Failed to save story:', err);
    res.status(500).json({ error: 'Failed to save story' });
  }
});

// API: Update story
app.put('/api/stories/:id', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'stories.json');
  try {
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: 'No stories found' });
    }
    
    let stories = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const index = stories.findIndex(s => s.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    stories[index] = { ...stories[index], ...req.body };
    fs.writeFileSync(dataPath, JSON.stringify(stories, null, 2), 'utf-8');
    res.json(stories[index]);
  } catch (err) {
    console.error('Failed to update story:', err);
    res.status(500).json({ error: 'Failed to update story' });
  }
});

// API: Delete story
app.delete('/api/stories/:id', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'stories.json');
  try {
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: 'No stories found' });
    }
    
    let stories = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const filteredStories = stories.filter(s => s.id !== req.params.id);
    
    fs.writeFileSync(dataPath, JSON.stringify(filteredStories, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error('Failed to delete story:', err);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

// API: Stream selected media
app.get('/selected-media/:filename', (req, res) => {
  if (!SELECTED_PHOTOS_ROOT) {
    return res.status(404).send('Not configured');
  }

  const filename = decodeURIComponent(req.params.filename);
  const fullPath = path.join(SELECTED_PHOTOS_ROOT, filename);

  // Security check: ensure path is within SELECTED_PHOTOS_ROOT
  if (!fullPath.startsWith(SELECTED_PHOTOS_ROOT)) {
    return res.status(403).send('Access denied');
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).send('File not found');
  }

  res.sendFile(fullPath);
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

const { exec } = require('child_process');

// API: Add new travel pin
app.post('/api/travel-pins', (req, res) => {
  const dataPath = path.join(__dirname, 'data', 'travel-pins.json');
  const { cityCN, cityEN, arrivedAt, emojiType, emojiVariant, folderName } = req.body;

  if (!cityCN || !cityEN) {
    return res.status(400).json({ error: 'City name is required' });
  }

  // Use provided folderName or default to cityEN, sanitize it
  // Simple sanitization: remove illegal chars for windows/unix paths
  const safeFolderName = (folderName || cityEN).replace(/[<>:"/\\|?*]/g, '_');

  try {
    let cities = [];
    if (fs.existsSync(dataPath)) {
      cities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    // Check for duplicates
    if (cities.find(c => c.cityEN === cityEN)) {
      return res.status(409).json({ error: 'City already exists' });
    }

    const newCity = {
      cityEN,
      cityCN,
      arrivedAt: arrivedAt || new Date().toISOString().split('T')[0],
      emojiType: emojiType || 'flower',
      emojiVariant: emojiVariant || 1,
      folderName: safeFolderName
    };

    cities.push(newCity);
    fs.writeFileSync(dataPath, JSON.stringify(cities, null, 2));

    // Create folder
    const folderPath = path.join(MEDIA_ROOT, safeFolderName);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    res.json(newCity);
  } catch (err) {
    console.error('Failed to add travel pin:', err);
    res.status(500).json({ error: 'Failed to add travel pin' });
  }
});

// API: Open folder in explorer
app.post('/api/open-folder', (req, res) => {
  const { path: folderPath } = req.body;
  // Security check
  // For now, allow opening subfolders of MEDIA_ROOT
  // But strictly speaking, the user might want to open MEDIA_ROOT itself if they want to create a folder manually.
  
  // Let's default to MEDIA_ROOT if no path provided, or join path
  let targetPath = MEDIA_ROOT;
  if (folderPath) {
    targetPath = path.join(MEDIA_ROOT, folderPath);
  }

  // Normalize path for Windows
  targetPath = path.resolve(targetPath);

  // Simple security check
  if (!targetPath.startsWith(path.resolve(MEDIA_ROOT))) {
     return res.status(403).json({ error: 'Access denied' });
  }

  console.log('Opening folder:', targetPath);
  
  // Windows specific command
  exec(`explorer "${targetPath}"`, (err) => {
    if (err) {
      console.error('Failed to open folder:', err);
      return res.status(500).json({ error: 'Failed to open folder' });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Media Root: ${MEDIA_ROOT}`);
});

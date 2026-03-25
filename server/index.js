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
const EXTRA_MEDIA_ROOT = path.resolve('D:/trea/sucai/caifang'); // Additional media root
const SELECTED_PHOTOS_ROOT = config.selectedPhotosRoot ? path.resolve(config.selectedPhotosRoot) : null;

console.log('Media Root:', MEDIA_ROOT);
console.log('Extra Media Root:', EXTRA_MEDIA_ROOT);

app.use(cors());
app.use(express.json());

const staticOptions = {
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  etag: true,
  acceptRanges: true,
  setHeaders: (res, path, stat) => {
    res.set('Cache-Control', 'public, max-age=2592000, immutable');
  }
};

// Serve static files from both roots
app.use('/media', express.static(MEDIA_ROOT, staticOptions));
app.use('/media/sucai/caifang', express.static(EXTRA_MEDIA_ROOT, staticOptions));


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

// Helper to extract date from path
const extractDateFromPath = (relativePath) => {
  const segments = relativePath.split(/[/\\]/); // Handle both slash types
  
  // Normalize a single segment string (filename or folder name) and try to parse leading date
  const parseDateFromSegment = (seg, isLast) => {
    let name = seg;
    if (isLast) {
      name = path.parse(seg).name; // strip extension for filenames
    }
    // Allow prefix date with extra text after it:
    // e.g. "2023-10-01 上海外滩" or "20231001_trip"
    const patterns = [
      /^(\d{4})[-._](\d{1,2})[-._](\d{1,2})(?:\D.*)?$/,               // 2023-10-01 / 2023.10.01 / 2023_10_01
      /^(\d{4})(\d{2})(\d{2})(?:\D.*)?$/,                              // 20231001
      /^(\d{4})年(\d{1,2})月(\d{1,2})日?(?:\D.*)?$/                    // 2023年10月1日 / 2023年10月1
    ];
    for (const re of patterns) {
      const m = name.match(re);
      if (m) {
        const year = parseInt(m[1], 10);
        const month = parseInt(m[2], 10);
        const day = parseInt(m[3], 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          return new Date(Date.UTC(year, month - 1, day));
        }
      }
    }
    return null;
  };

  // Try to parse full date contained in a single segment, preferring deeper (closer to file)
  for (let i = segments.length - 1; i >= 0; i--) {
    const d = parseDateFromSegment(segments[i], i === segments.length - 1);
    if (d) return d;
  }

  // Try hierarchical patterns such as YYYY/MM/DD or YYYY\\MM\\DD (numeric prefixes allowed)
  const parseNumericPrefix = (seg) => {
    const m = seg.match(/^(\d{1,4})/);
    return m ? parseInt(m[1], 10) : NaN;
  };

  for (let i = segments.length - 3; i >= 0; i--) {
    const y = parseNumericPrefix(segments[i]);
    const m = parseNumericPrefix(segments[i + 1]);
    const d = parseNumericPrefix(segments[i + 2]);
    if (
      !isNaN(y) && y >= 1900 && y <= 2100 &&
      !isNaN(m) && m >= 1 && m <= 12 &&
      !isNaN(d) && d >= 1 && d <= 31
    ) {
      return new Date(Date.UTC(y, m - 1, d));
    }
  }

  return null;
};

// Helper to detect date-like folder names (standalone dates only)
const isDateLikeFolderName = (name) => {
  if (!name) return false;
  const n = String(name).trim();
  const patterns = [
    /^\d{4}[-._]\d{1,2}[-._]\d{1,2}$/, // 2023-10-01 / 2023.10.01 / 2023_10_01
    /^\d{8}$/,                         // 20231001
    /^\d{4}年\d{1,2}月\d{1,2}日?$/      // 2023年10月1日
  ];
  return patterns.some(re => re.test(n));
};

// Helper to find all city folders (handling both direct and nested structure)
const findCityFolders = (targetFolderName) => {
  const folders = [];
  
  // 1. Check direct child
  const directPath = path.join(MEDIA_ROOT, targetFolderName);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isDirectory()) {
    folders.push({
      fullPath: directPath,
      relativePath: targetFolderName
    });
  }
  
  // 2. Check first-level subdirectories (e.g. dates)
  try {
    const entries = fs.readdirSync(MEDIA_ROOT);
    for (const entry of entries) {
      const entryPath = path.join(MEDIA_ROOT, entry);
      if (fs.statSync(entryPath).isDirectory() && entry !== targetFolderName) {
        const nestedPath = path.join(entryPath, targetFolderName);
        if (fs.existsSync(nestedPath) && fs.statSync(nestedPath).isDirectory()) {
          folders.push({
            fullPath: nestedPath,
            relativePath: path.join(entry, targetFolderName)
          });
        }
      }
    }
  } catch (err) {
    console.error('Error scanning media root:', err);
  }
  
  return folders.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
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

const processFile = (filePath, rootDir, urlPrefix = '/media') => {
    try {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath);
      const type = getFileType(ext);
      
      if (type !== 'unknown') {
        lastMediaUpdate = Date.now(); // Update timestamp on file add
        // Normalize to forward slashes for consistent ID generation across platforms
        let relativePath = path.relative(rootDir, filePath).split(path.sep).join('/');
        
        // If processing from EXTRA_MEDIA_ROOT, we want to simulate it being under 'sucai/caifang'
        if (rootDir === EXTRA_MEDIA_ROOT) {
            relativePath = 'sucai/caifang/' + relativePath;
        }

        const id = generateId(relativePath);
        
        // Generate URL
        let urlPath = relativePath.split('/').map(encodeURIComponent).join('/');
        let fileUrl;
        
        if (rootDir === EXTRA_MEDIA_ROOT) {
             // For extra root, the relativePath already includes 'sucai/caifang', 
             // but our static middleware mounts EXTRA_MEDIA_ROOT at '/media/sucai/caifang'
             // so we need to construct the URL carefully.
             // Actually, since we mounted EXTRA_MEDIA_ROOT to '/media/sucai/caifang',
             // and relativePath includes 'sucai/caifang', we can just use /media/relativePath?
             // Wait, path.relative(EXTRA, file) gives just filename.
             // We prepended 'sucai/caifang/'.
             // So /media/sucai/caifang/filename is correct.
             fileUrl = `/media/${urlPath}`;
        } else {
             fileUrl = `/media/${urlPath}`;
        }

        // Try to extract date from path
        let dateStr, timestamp;
        const dateObj = extractDateFromPath(relativePath);
        
        if (dateObj) {
            dateStr = dateObj.toISOString().split('T')[0];
            timestamp = dateObj.getTime();
        } else {
            dateStr = stats.mtime.toISOString().split('T')[0];
            timestamp = stats.mtime.getTime();
        }

        const memoryItem = {
          id,
          name: path.basename(filePath),
          url: fileUrl,
          thumbnail: `/api/thumbnail/${id}`,
          type,
          date: dateStr, // YYYY-MM-DD
          timestamp: timestamp,
          size: stats.size,
          relativePath
        };
        
        memoryIndex.set(relativePath, memoryItem);
        console.log(`Added: ${relativePath}`);
        
        // Trigger thumbnail generation
        generateThumbnail(filePath, id, type).catch(err => {
          console.error(`Thumbnail generation failed for ${relativePath}:`, err);
        });
      }
    } catch (err) {
      console.error(`Error processing file ${filePath}:`, err);
    }
};

const watcher = chokidar.watch(MEDIA_ROOT, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

const extraWatcher = chokidar.watch(EXTRA_MEDIA_ROOT, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

watcher
  .on('add', (filePath) => processFile(filePath, MEDIA_ROOT))
  .on('change', (filePath) => processFile(filePath, MEDIA_ROOT))
  .on('unlink', (filePath) => {
    lastMediaUpdate = Date.now();
    const relativePath = path.relative(MEDIA_ROOT, filePath).split(path.sep).join('/');
    if (memoryIndex.has(relativePath)) {
      memoryIndex.delete(relativePath);
      console.log(`Removed: ${relativePath}`);
    }
  })
  .on('error', error => console.error('Watcher error:', error));

extraWatcher
  .on('add', (filePath) => processFile(filePath, EXTRA_MEDIA_ROOT))
  .on('change', (filePath) => processFile(filePath, EXTRA_MEDIA_ROOT))
  .on('unlink', (filePath) => {
    lastMediaUpdate = Date.now();
    // Simulate relative path logic
    const rel = path.relative(EXTRA_MEDIA_ROOT, filePath).split(path.sep).join('/');
    const relativePath = 'sucai/caifang/' + rel;
    if (memoryIndex.has(relativePath)) {
      memoryIndex.delete(relativePath);
      console.log(`Removed: ${relativePath}`);
    }
  })
  .on('error', error => console.error('Extra Watcher error:', error));


// API: Get all memories
app.get('/api/memories', (req, res) => {
  const memories = Array.from(memoryIndex.values()).sort((a, b) => {
    const timeDiff = b.timestamp - a.timestamp;
    if (timeDiff !== 0) return timeDiff;
    // Tie-breaker: sort by name if timestamps are equal (e.g. same date folder)
    return a.name.localeCompare(b.name);
  });
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
  try {
    // Get all images from the memory index
    const allImages = Array.from(memoryIndex.values())
      .filter(item => item.type === 'image');

    if (allImages.length === 0) {
      return res.json([]);
    }

    // Fisher-Yates Shuffle
    const photos = [...allImages];
    for (let i = photos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [photos[i], photos[j]] = [photos[j], photos[i]];
    }

    // Return top 10 random photos as requested
    res.json(photos.slice(0, 10)); 
  } catch (err) {
    console.error('Error getting selected photos:', err);
    res.status(500).json({ error: 'Failed to get photos' });
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

  // 2. Filter out standalone date-named folders
  const filtered = cities.filter(city => !isDateLikeFolderName(city.folderName || city.cityEN));

  // 3. Scan media directories for photos
  const result = filtered.map(city => {
    const targetFolder = city.folderName || city.cityEN;
    const folders = findCityFolders(targetFolder);
    let allItems = [];

    folders.forEach(folder => {
      try {
        const items = fs.readdirSync(folder.fullPath)
          .map(file => {
             const ext = path.extname(file);
             const type = getFileType(ext);
             // Ensure forward slashes for URL
             const relativePath = path.join(folder.relativePath, file).split(path.sep).join('/');
             const id = generateId(relativePath);
             // URL encode path segments
             const urlPath = relativePath.split('/').map(encodeURIComponent).join('/');
             const url = `/media/${urlPath}`;
             const thumbnail = type === 'video' ? `/api/thumbnail/${id}` : url;
             return { name: file, url, thumbnail, type, id, relativePath };
          })
          .filter(item => item.type === 'image' || item.type === 'video');
        
        allItems = allItems.concat(items);
      } catch (e) {
        console.error(`Error reading folder ${folder.fullPath}:`, e);
      }
    });

    // Sort items by relativePath to maintain folder order (chronological if named by date)
    allItems.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

    // Determine cover (customCover or first item's thumbnail)
    let cover = city.customCover;
    
    // Verify custom cover still exists (optional but good practice)
    // Since customCover is a URL path, we can't easily check file existence without parsing it back to file path.
    // However, if it's a thumbnail URL (/api/thumbnail/id), the thumbnail file check is done in the thumbnail endpoint.
    // If it's a direct image URL (/media/...), we could check.
    // For simplicity, we trust customCover if present. If the file is deleted, it might be broken image, but user can re-set it.
    
    if (!cover && allItems.length > 0) {
      cover = allItems[0].thumbnail;
    }

    // Photos array (images only) for backward compatibility
    const photos = allItems.filter(item => item.type === 'image').map(item => item.url);

    return {
      ...city,
      photos,
      cover,
      mediaCount: allItems.length
    };
  })
  // Filter out cities with no photos? Or keep them as placeholders?
  // Let's keep them but client should handle empty photos array.
  .sort((a, b) => new Date(a.arrivedAt) - new Date(b.arrivedAt)) // Sort by date ascending
  .slice(0, 4); // Take top 4

  res.json(result);
});

// API: Set custom cover for a city
app.post('/api/set-cover/:city', (req, res) => {
  const cityKey = decodeURIComponent(req.params.city);
  const { coverUrl } = req.body; // Expects the thumbnail URL

  const dataPath = path.join(__dirname, 'data', 'travel-pins.json');
  try {
    let cities = [];
    if (fs.existsSync(dataPath)) {
      cities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    const index = cities.findIndex(c => c.cityEN === cityKey || c.cityCN === cityKey || c.folderName === cityKey);
    
    if (index === -1) {
      return res.status(404).json({ error: 'City not found' });
    }

    // Update the customCover field
    cities[index] = { ...cities[index], customCover: coverUrl };
    
    fs.writeFileSync(dataPath, JSON.stringify(cities, null, 2), 'utf-8');
    
    res.json({ success: true, city: cities[index] });
  } catch (err) {
    console.error('Failed to set cover:', err);
    res.status(500).json({ error: 'Failed to set cover' });
  }
});

// API: Update city metadata (e.g. arrivedAt)
app.put('/api/travel-pins/:city', (req, res) => {
  const cityKey = decodeURIComponent(req.params.city);
  const updates = req.body; // { arrivedAt: 'YYYY-MM-DD', ... }

  const dataPath = path.join(__dirname, 'data', 'travel-pins.json');
  try {
    let cities = [];
    if (fs.existsSync(dataPath)) {
      cities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    const index = cities.findIndex(c => c.cityEN === cityKey || c.cityCN === cityKey || c.folderName === cityKey);
    
    if (index === -1) {
      return res.status(404).json({ error: 'City not found' });
    }

    // Update fields (whitelist allowed fields to protect integrity if needed, but for now allow all)
    // Exclude id-like fields from updates if necessary, but client should be careful.
    cities[index] = { ...cities[index], ...updates };
    
    fs.writeFileSync(dataPath, JSON.stringify(cities, null, 2), 'utf-8');
    
    res.json({ success: true, city: cities[index] });
  } catch (err) {
    console.error('Failed to update city:', err);
    res.status(500).json({ error: 'Failed to update city' });
  }
});

// API: Delete a city album
app.delete('/api/travel-pins/:city', (req, res) => {
  const cityKey = decodeURIComponent(req.params.city);
  const dataPath = path.join(__dirname, 'data', 'travel-pins.json');
  
  try {
    let cities = [];
    if (fs.existsSync(dataPath)) {
      cities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }

    const index = cities.findIndex(c => c.cityEN === cityKey || c.cityCN === cityKey || c.folderName === cityKey);
    
    if (index === -1) {
      return res.status(404).json({ error: 'City not found' });
    }

    const cityToDelete = cities[index];
    
    // 1. Remove from JSON
    cities.splice(index, 1);
    fs.writeFileSync(dataPath, JSON.stringify(cities, null, 2), 'utf-8');
    
    // We'll try to delete all associated folders if they are empty.
    const folderName = cityToDelete.folderName || cityToDelete.cityEN;
    const folders = findCityFolders(folderName);
    
    let deletedFolders = [];
    let keptFolders = [];

    folders.forEach(folder => {
      try {
        const files = fs.readdirSync(folder.fullPath);
        if (files.length === 0) {
          fs.rmdirSync(folder.fullPath);
          deletedFolders.push(folder.relativePath);
          console.log(`Deleted empty folder: ${folder.fullPath}`);
        } else {
          keptFolders.push(folder.relativePath);
          console.log(`Kept non-empty folder: ${folder.fullPath}`);
        }
      } catch (e) {
        console.error(`Error checking/deleting folder ${folder.fullPath}:`, e);
      }
    });

    res.json({ 
      success: true, 
      message: 'Album deleted from list', 
      deletedFolders, 
      keptFolders 
    });

  } catch (err) {
    console.error('Failed to delete album:', err);
    res.status(500).json({ error: 'Failed to delete album' });
  }
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
  if (isDateLikeFolderName(folderName)) {
    return res.status(404).json({ error: 'City not found' });
  }
  const folders = findCityFolders(folderName);
  let items = [];
  
  folders.forEach(folder => {
    try {
      const folderItems = fs.readdirSync(folder.fullPath)
        .filter(file => {
          const ext = path.extname(file);
          const type = getFileType(ext);
          return type === 'image' || type === 'video';
        })
        .map(file => {
          const relativePath = path.join(folder.relativePath, file).split(path.sep).join('/');
          const id = generateId(relativePath);
          const type = getFileType(path.extname(file));
          const urlPath = relativePath.split('/').map(encodeURIComponent).join('/');
          const url = `/media/${urlPath}`;
          const thumbnail = type === 'image' ? url : `/api/thumbnail/${id}`;
          return { id, type, url, thumbnail, name: file, relativePath };
        });
        
      items = items.concat(folderItems);
    } catch (e) {
      console.error(`Error reading folder ${folder.fullPath}:`, e);
    }
  });

  items.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  
  // Use customCover if available
  let cover = meta.customCover;
  if (!cover && items.length > 0) {
      cover = items[0].thumbnail;
  }
  
  res.json({ ...meta, items, cover });
});
// API: Upload media (Raw binary)
app.post('/api/upload/:city', (req, res) => {
  const city = decodeURIComponent(req.params.city);
  const fileName = req.headers['x-file-name'];
  
  if (!fileName) {
    return res.status(400).json({ error: 'Missing X-File-Name header' });
  }

  // Find city folder
  const dataPath = path.join(__dirname, 'data', 'travel-pins.json');
  let cities = [];
  try {
    if (fs.existsSync(dataPath)) {
      cities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load travel-pins.json:', err);
  }

  const meta = cities.find(c => c.cityEN === city || c.cityCN === city || c.folderName === city);
  const folderName = meta ? (meta.folderName || meta.cityEN) : city; // Fallback to city name if not found in meta
  const folderPath = path.join(MEDIA_ROOT, folderName);

  if (!fs.existsSync(folderPath)) {
    try {
      fs.mkdirSync(folderPath, { recursive: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create directory' });
    }
  }

  // Sanitize filename to prevent directory traversal
  const safeFileName = path.basename(fileName);
  const filePath = path.join(folderPath, safeFileName);

  console.log(`Uploading to: ${filePath}`);

  const writeStream = fs.createWriteStream(filePath);
  
  req.pipe(writeStream);

  writeStream.on('finish', () => {
    res.json({ success: true, path: `/media/${encodeURIComponent(folderName)}/${encodeURIComponent(safeFileName)}` });
  });

  writeStream.on('error', (err) => {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'File upload failed' });
  });
});

// API: Delete media
app.delete('/api/delete/:city', (req, res) => {
  const city = decodeURIComponent(req.params.city);
  const { fileName, relativePath } = req.query;

  if (!fileName && !relativePath) {
    return res.status(400).json({ error: 'Missing fileName or relativePath query parameter' });
  }

  let filePath;
  let id;

  if (relativePath) {
    // New logic: delete specific file by relative path
    // Ensure path is safe
    const safeRelativePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
    filePath = path.join(MEDIA_ROOT, safeRelativePath);
    
    // Verify it's within MEDIA_ROOT
    if (!filePath.startsWith(MEDIA_ROOT)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    id = generateId(safeRelativePath.split(path.sep).join('/'));
  } else {
    // Legacy logic: find city folder and delete file
    const dataPath = path.join(__dirname, 'data', 'travel-pins.json');
    let cities = [];
    try {
      if (fs.existsSync(dataPath)) {
        cities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      }
    } catch (err) {
      console.error('Failed to load travel-pins.json:', err);
    }
  
    const meta = cities.find(c => c.cityEN === city || c.cityCN === city || c.folderName === city);
    const folderName = meta ? (meta.folderName || meta.cityEN) : city;
    
    // Sanitize filename
    const safeFileName = path.basename(fileName);
    filePath = path.join(MEDIA_ROOT, folderName, safeFileName);
    
    const relPath = path.join(folderName, safeFileName).split(path.sep).join('/');
    id = generateId(relPath);
  }

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      
      // Delete thumbnail
      const thumbPath = getThumbnailPath(id);
      if (fs.existsSync(thumbPath)) {
        fs.unlinkSync(thumbPath);
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error('Delete error:', err);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  } else {
    res.status(404).json({ error: 'File not found' });
  }
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
  // Filter out standalone date-named folders
  const filtered = cities.filter(city => !isDateLikeFolderName(city.folderName || city.cityEN));

  const result = filtered.map(city => {
    const targetFolder = city.folderName || city.cityEN;
    const folders = findCityFolders(targetFolder);
    let allItems = [];

    folders.forEach(folder => {
      try {
        const items = fs.readdirSync(folder.fullPath)
          .map(file => {
             const ext = path.extname(file);
             const type = getFileType(ext);
             const relativePath = path.join(folder.relativePath, file).split(path.sep).join('/');
             const id = generateId(relativePath);
             const urlPath = relativePath.split('/').map(encodeURIComponent).join('/');
             const url = `/media/${urlPath}`;
             const thumbnail = type === 'video' ? `/api/thumbnail/${id}` : url;
             
             // Get file stats for last update time
             let mtimeMs = 0;
             try {
               const stat = fs.statSync(path.join(folder.fullPath, file));
               mtimeMs = stat.mtimeMs;
             } catch (e) {
               console.error(`Error stat file ${file}:`, e);
             }

             return { name: file, url, thumbnail, type, id, relativePath, mtimeMs };
          })
          .filter(item => item.type === 'image' || item.type === 'video');
        
        allItems = allItems.concat(items);
      } catch (e) {
        console.error(`Error reading folder ${folder.fullPath}:`, e);
      }
    });

    // Sort items by relativePath to maintain folder order (chronological if named by date)
    allItems.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
    
    // Determine cover (customCover or first item's thumbnail)
    let cover = city.customCover;
    
    if (!cover && allItems.length > 0) {
      cover = allItems[0].thumbnail;
    }
    
    const photos = allItems.filter(item => item.type === 'image').map(item => item.url);

    // Calculate last update time (max mtime of files)
    const lastUpdate = allItems.reduce((max, item) => Math.max(max, item.mtimeMs || 0), 0);

    // Generate tags
    const tags = [];
    // Date tag
    if (city.arrivedAt) {
      const year = city.arrivedAt.substring(0, 4);
      if (year) tags.push(year);
    }
    // Content tags
    const hasVideo = allItems.some(item => item.type === 'video');
    const hasPhoto = allItems.some(item => item.type === 'image');
    if (hasVideo) tags.push('Video');
    if (hasPhoto && !hasVideo) tags.push('Photo'); // Only show Photo if no video, or maybe just 'Photo'
    // Size tag
    if (allItems.length > 100) tags.push('Huge');
    else if (allItems.length > 20) tags.push('Big');

    return { 
      ...city, 
      photos, 
      cover, 
      mediaCount: allItems.length,
      lastUpdate,
      tags
    };
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

// API: Add comment to story
app.post('/api/stories/:id/comments', (req, res) => {
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
    
    const newComment = {
      id: generateId(Date.now().toString()),
      content: req.body.content,
      author: req.body.author || 'Anonymous',
      createdAt: new Date().toISOString()
    };
    
    if (!stories[index].comments) {
      stories[index].comments = [];
    }
    
    stories[index].comments.push(newComment);
    fs.writeFileSync(dataPath, JSON.stringify(stories, null, 2), 'utf-8');
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Failed to add comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
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
  const { cityCN, cityEN, arrivedAt, emojiType, emojiVariant, folderName, country } = req.body;

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
      country: country || '',
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

// API: Open folder
app.post('/api/open-folder', (req, res) => {
  const { path: folderKey } = req.body;
  if (!folderKey) {
    return res.status(400).json({ error: 'Path is required' });
  }

  // Resolve folder name from travel-pins metadata
  const dataPath = path.join(__dirname, 'data', 'travel-pins.json');
  let cities = [];
  try {
    if (fs.existsSync(dataPath)) {
      cities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load travel-pins.json:', err);
  }

  const meta = cities.find(
    c => c.cityEN === folderKey || c.cityCN === folderKey || c.folderName === folderKey
  );
  const folderName = meta ? (meta.folderName || meta.cityEN) : folderKey;

  // Use findCityFolders to get all valid folders
  const folders = findCityFolders(folderName);
  let fullPath;

  if (folders.length > 0) {
    // Open the last one (usually most recent if date folders are used)
    fullPath = folders[folders.length - 1].fullPath;
  } else {
    // Default to MEDIA_ROOT/folderName if no existing folder found
    fullPath = path.join(MEDIA_ROOT, folderName);
    if (!fs.existsSync(fullPath)) {
      try {
        fs.mkdirSync(fullPath, { recursive: true });
      } catch (err) {
        return res.status(500).json({ error: 'Failed to create folder' , details: err.message});
      }
    }
  }

  console.log(`Opening folder: ${fullPath}`);
  
  let command;
  if (process.platform === 'win32') {
    // Use 'explorer' which is more reliable for opening folders in Windows
    command = `explorer "${fullPath}"`;
  } else if (process.platform === 'darwin') {
    command = `open "${fullPath}"`;
  } else {
    command = `xdg-open "${fullPath}"`;
  }

  require('child_process').exec(command, (err) => {
    if (err) {
      console.error('Failed to open folder:', err);
      return res.status(500).json({ error: 'Failed to open folder', details: err.message });
    }
    res.json({ success: true, folderName, fullPath });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

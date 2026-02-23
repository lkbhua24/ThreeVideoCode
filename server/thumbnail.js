const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

let ffmpegStatic;
try {
  ffmpegStatic = require('ffmpeg-static');
  ffmpeg.setFfmpegPath(ffmpegStatic);
} catch (e) {
  console.warn('ffmpeg-static not found, video thumbnails disabled');
}

// Ensure thumbnail directory exists
const THUMB_DIR = path.join(__dirname, '../thumbnails');
if (!fs.existsSync(THUMB_DIR)) {
  fs.mkdirSync(THUMB_DIR, { recursive: true });
}

// Helper to get thumbnail path
const getThumbnailPath = (id) => path.join(THUMB_DIR, `${id}.jpg`);

// Generate thumbnail for image
const generateImageThumbnail = async (filePath, id) => {
  const thumbPath = getThumbnailPath(id);
  if (fs.existsSync(thumbPath)) return true; // Already exists

  try {
    await sharp(filePath)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);
    console.log(`Thumbnail generated for image: ${id}`);
    return true;
  } catch (err) {
    console.error(`Failed to generate image thumbnail for ${id}:`, err);
    return false;
  }
};

// Generate thumbnail for video
const generateVideoThumbnail = (filePath, id) => {
  if (!ffmpegStatic) {
    console.warn(`Skipping video thumbnail for ${id}: ffmpeg-static missing`);
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const thumbPath = getThumbnailPath(id);
    if (fs.existsSync(thumbPath)) return resolve(true);

    // Basic ffmpeg screenshot
    ffmpeg(filePath)
      .on('end', () => {
        console.log(`Thumbnail generated for video: ${id}`);
        resolve(true);
      })
      .on('error', (err) => {
        console.error(`Failed to generate video thumbnail for ${id}:`, err);
        // Resolve anyway so we don't block
        resolve(false);
      })
      .screenshots({
        timestamps: ['10%'], // Capture at 10% duration
        filename: `${id}.jpg`,
        folder: THUMB_DIR,
        size: '200x200'
      });
  });
};

// Main function to handle thumbnail generation
const generateThumbnail = async (filePath, id, type) => {
  if (type === 'image') {
    return generateImageThumbnail(filePath, id);
  } else if (type === 'video') {
    return generateVideoThumbnail(filePath, id);
  }
  // Audio thumbnails not supported yet (could use album art or default icon)
  return false;
};

module.exports = {
  generateThumbnail,
  getThumbnailPath
};

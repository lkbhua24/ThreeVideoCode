const fs = require('fs');
const path = require('path');

const mediaRoot = 'D:\\trea\\3\\media';
const selectRoot = 'D:\\trea\\3\\media\\Select';

if (!fs.existsSync(selectRoot)) {
  fs.mkdirSync(selectRoot, { recursive: true });
}

const files = fs.readdirSync(selectRoot);
console.log(`Files in Select: ${files.length}`);

if (files.length === 0) {
  console.log('Select is empty. Copying files...');
  if (fs.existsSync(mediaRoot)) {
    const mediaFiles = fs.readdirSync(mediaRoot).filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
    console.log(`Found ${mediaFiles.length} media files.`);
    
    const toCopy = mediaFiles.slice(0, 5);
    toCopy.forEach(f => {
      fs.copyFileSync(path.join(mediaRoot, f), path.join(selectRoot, f));
      console.log(`Copied ${f}`);
    });
  } else {
    console.log('Media root not found!');
  }
} else {
  console.log('Select has files:');
  files.forEach(f => console.log(`- ${f}`));
}

const fs = require('fs');
let content = fs.readFileSync('src/components/InterviewMode.jsx', 'utf8');
content = content.replace(/borderRadius: isFullscreen \? 0 : '20px'/g, "borderRadius: isFullscreen ? 0 : 'var(--radius-xl)'");
content = content.replace(/borderRadius: '6px'/g, "borderRadius: 'var(--radius-sm)'");
fs.writeFileSync('src/components/InterviewMode.jsx', content, 'utf8');
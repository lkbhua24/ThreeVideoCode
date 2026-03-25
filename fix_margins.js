const fs = require('fs');
let content = fs.readFileSync('src/components/InterviewMode.jsx', 'utf8');

content = content.replace(/marginBottom: '30px'/g, "marginBottom: 'var(--spacing-xxl)'");
content = content.replace(/marginBottom: '20px'/g, "marginBottom: 'var(--spacing-xl)'");
content = content.replace(/marginBottom: '15px'/g, "marginBottom: 'var(--spacing-lg)'");
content = content.replace(/marginBottom: '10px'/g, "marginBottom: 'var(--spacing-md)'");
content = content.replace(/marginBottom: '8px'/g, "marginBottom: 'var(--spacing-sm)'");
content = content.replace(/marginBottom: '4px'/g, "marginBottom: 'var(--spacing-sm)'");

content = content.replace(/marginTop: '5px'/g, "marginTop: 'var(--spacing-sm)'");
content = content.replace(/marginTop: '2px'/g, "marginTop: 'var(--spacing-sm)'");

content = content.replace(/margin: '20px 0'/g, "margin: 'var(--spacing-xl) 0'");
content = content.replace(/margin: '5px 0 0'/g, "margin: 'var(--spacing-sm) 0 0'");
content = content.replace(/padding: '40px 0'/g, "padding: 'var(--spacing-xxl) 0'");
content = content.replace(/paddingBottom: '10px'/g, "paddingBottom: 'var(--spacing-md)'");

fs.writeFileSync('src/components/InterviewMode.jsx', content, 'utf8');
console.log('done margins');

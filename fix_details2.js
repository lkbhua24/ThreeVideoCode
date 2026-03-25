const fs = require('fs');
let content = fs.readFileSync('src/components/InterviewMode.jsx', 'utf8');

// Replace gaps
content = content.replace(/gap: '30px'/g, "gap: 'var(--spacing-xxl)'");
content = content.replace(/gap: '20px'/g, "gap: 'var(--spacing-xl)'");
content = content.replace(/gap: '12px'/g, "gap: 'var(--spacing-md)'");
content = content.replace(/gap: '5px'/g, "gap: 'var(--spacing-sm)'");

// Replace paddings
content = content.replace(/padding: '20px 20px 30px'/g, "padding: 'var(--spacing-xl) var(--spacing-xl) var(--spacing-xxl)'");
content = content.replace(/padding: '15px 10px'/g, "padding: 'var(--spacing-lg) var(--spacing-md)'");
content = content.replace(/padding: '30px'/g, "padding: 'var(--spacing-xxl)'");
content = content.replace(/padding: '10px 15px'/g, "padding: 'var(--spacing-md) var(--spacing-lg)'");
content = content.replace(/padding: '10px 20px'/g, "padding: 'var(--spacing-md) var(--spacing-xl)'");
content = content.replace(/padding: '15px'/g, "padding: 'var(--spacing-lg)'");
content = content.replace(/padding: '10px'/g, "padding: 'var(--spacing-md)'");
content = content.replace(/padding: '12px'/g, "padding: 'var(--spacing-md)'");
content = content.replace(/padding: '8px'/g, "padding: 'var(--spacing-sm)'");
content = content.replace(/padding: '4px'/g, "padding: 'var(--spacing-sm)'");
content = content.replace(/padding: '6px 12px'/g, "padding: 'var(--spacing-sm) var(--spacing-md)'");
content = content.replace(/padding: '10px 10px 10px 38px'/g, "padding: 'var(--spacing-md) var(--spacing-md) var(--spacing-md) 38px'");

// Replace box shadows
content = content.replace(/boxShadow: '0 20px 50px rgba\(0,0,0,0\.2\)'/g, "boxShadow: 'var(--shadow-xl)'");
content = content.replace(/boxShadow: libraryFilter === cat \? '0 2px 4px rgba\(0,0,0,0\.05\)' : 'none'/g, "boxShadow: libraryFilter === cat ? 'var(--shadow-sm)' : 'none'");

// Font weights
content = content.replace(/fontWeight: index === currentNodeIndex \? 'bold' : 'normal'/g, "fontWeight: index === currentNodeIndex ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)'");
content = content.replace(/fontWeight: isActive \? 'bold' : 'normal'/g, "fontWeight: isActive ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)'");

// Remaining border radius
content = content.replace(/borderRadius: '3px'/g, "borderRadius: 'var(--radius-sm)'"); // or sm

fs.writeFileSync('src/components/InterviewMode.jsx', content, 'utf8');
console.log('done');

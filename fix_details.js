const fs = require('fs');
const path = require('path');
const file = path.join('d:', 'trea', '3', 'src', 'components', 'InterviewMode.jsx');
let content = fs.readFileSync(file, 'utf8');

// Unify button border radius to var(--radius-xl)
content = content.replace(/borderRadius: '30px'/g, "borderRadius: 'var(--radius-xl)'");
content = content.replace(/borderRadius: '20px'/g, "borderRadius: 'var(--radius-xl)'");
content = content.replace(/borderRadius: '24px'/g, "borderRadius: 'var(--radius-xl)'");

// Title font weight & shadow
// The title uses fontWeight: 400 or something similar. Let's find the title block.
content = content.replace(/fontWeight: 400,\s*letterSpacing: '2px'/g, "fontWeight: 'var(--font-weight-normal)', letterSpacing: '2px'");
content = content.replace(/textShadow: '2px 2px 4px rgba\(0,0,0,0.1\)'/g, "textShadow: 'var(--shadow-sm)'");

// Spacing (gap, padding, margin)
// We will replace common gap values
content = content.replace(/gap: '10px'/g, "gap: 'var(--spacing-md)'");
content = content.replace(/gap: '15px'/g, "gap: 'var(--spacing-lg)'");
content = content.replace(/gap: '8px'/g, "gap: 'var(--spacing-sm)'");
content = content.replace(/gap: '6px'/g, "gap: 'var(--spacing-sm)'");

// specific padding values for buttons
content = content.replace(/padding: '8px 16px'/g, "padding: 'var(--spacing-sm) var(--spacing-lg)'");
content = content.replace(/padding: '12px 28px'/g, "padding: 'var(--spacing-md) var(--spacing-xl)'");

// Adaptive Background Atmosphere:
// Find backgroundMemories logic and window size logic.
// We'll write a block to inject a custom hook or effect for window size/performance.

fs.writeFileSync(file, content, 'utf8');

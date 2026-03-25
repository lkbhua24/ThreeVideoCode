const fs = require('fs');

const filePath = 'd:/trea/3/src/components/InterviewMode.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add touchStartX state
if (!content.includes('const [touchStartX')) {
    content = content.replace(
        'const [showNextHint, setShowNextHint] = useState(false);',
        `const [showNextHint, setShowNextHint] = useState(false);\n  const [touchStartX, setTouchStartX] = useState(null);`
    );
}

// 2. Add handleTouch handlers
if (!content.includes('const handleTouchEnd')) {
    content = content.replace(
        'const handleNodeClick = (index) => {',
        `const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    revealControls();
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) { // Swipe threshold
      if (diff > 0 && currentNodeIndex < timeline.length - 1) {
        handleNext();
        setIsPlaying(true);
      } else if (diff < 0 && currentNodeIndex > 0) {
        handlePrev();
        setIsPlaying(true);
      }
    }
    setTouchStartX(null);
  };

  const handleNodeClick = (index) => {`
    );
}

// 3. Update video container props
content = content.replace(
    /onTouchStart=\{revealControls\}/,
    `onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={() => setIsFullscreen(!isFullscreen)}`
);

// 4. Safe Area Support for Controls Overlay
content = content.replace(
    /padding:\s*'var\(--spacing-xl\) var\(--spacing-xl\) var\(--spacing-xxl\)'/,
    `paddingTop: 'var(--spacing-xl)',
            paddingBottom: 'calc(var(--spacing-xxl) + env(safe-area-inset-bottom))',
            paddingLeft: 'calc(var(--spacing-xl) + env(safe-area-inset-left))',
            paddingRight: 'calc(var(--spacing-xl) + env(safe-area-inset-right))'`
);

// 5. Safe Area Support for Timeline Area
content = content.replace(
    /padding:\s*'var\(--spacing-lg\) var\(--spacing-xxl\)'/,
    `paddingTop: 'var(--spacing-lg)',
        paddingBottom: 'calc(var(--spacing-lg) + env(safe-area-inset-bottom))',
        paddingLeft: 'calc(var(--spacing-xxl) + env(safe-area-inset-left))',
        paddingRight: 'calc(var(--spacing-xxl) + env(safe-area-inset-right))'`
);

// 6. Add aria-labels, titles, onFocus, and hit area to buttons

// Prev button
content = content.replace(
    /<button \s*onClick=\{handlePrev\} \s*disabled=\{currentNodeIndex === 0\}/,
    `<button 
              onClick={handlePrev} 
              disabled={currentNodeIndex === 0}
              aria-label="上一题"
              title="上一题 (←)"
              onFocus={revealControls}`
);
content = content.replace(
    /color: '#fff', opacity: currentNodeIndex === 0 \? 0\.5 : 1,\s*display: 'flex', alignItems: 'center', justifyContent: 'center',/g,
    `color: '#fff', opacity: currentNodeIndex === 0 ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '48px', minHeight: '48px',`
);

// Play button
content = content.replace(
    /<button onClick=\{togglePlay\} style=\{\{/,
    `<button onClick={togglePlay} 
            aria-label={isPlaying ? "暂停" : "播放"} 
            title={isPlaying ? "暂停 (空格)" : "播放 (空格)"}
            onFocus={revealControls}
            style={{`
);
content = content.replace(
    /color: '#fff', transform: 'scale\(1\.2\)',\s*display: 'flex', alignItems: 'center', justifyContent: 'center',/,
    `color: '#fff', transform: 'scale(1.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '48px', minHeight: '48px',`
);

// Next button
content = content.replace(
    /<button \s*onClick=\{handleNext\} \s*disabled=\{currentNodeIndex === timeline\.length - 1\}/,
    `<button 
              onClick={handleNext} 
              disabled={currentNodeIndex === timeline.length - 1}
              aria-label="下一题"
              title="下一题 (→)"
              onFocus={revealControls}`
);
content = content.replace(
    /color: '#fff', opacity: currentNodeIndex === timeline\.length - 1 \? 0\.5 : 1,\s*display: 'flex', alignItems: 'center', justifyContent: 'center',/g,
    `color: '#fff', opacity: currentNodeIndex === timeline.length - 1 ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '48px', minHeight: '48px',`
);

// Volume button
content = content.replace(
    /<button \s*onClick=\{\(\) => setIsMuted\(!isMuted\)\} \s*style=\{\{/,
    `<button 
                  onClick={() => setIsMuted(!isMuted)} 
                  aria-label={isMuted ? "取消静音" : "静音"}
                  title="音量"
                  onFocus={revealControls}
                  style={{`
);
content = content.replace(
    /background: 'none', border: 'none', cursor: 'pointer', color: isMuted \? 'var\(--color-primary\)' : '#fff',\s*display: 'flex', alignItems: 'center', justifyContent: 'center',/,
    `background: 'none', border: 'none', cursor: 'pointer', color: isMuted ? 'var(--color-primary)' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: '48px', minHeight: '48px',`
);

// Fullscreen button
content = content.replace(
    /<button \s*onClick=\{\(\) => setIsFullscreen\(!isFullscreen\)\} \s*style=\{\{/,
    `<button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                aria-label={isFullscreen ? "退出全屏" : "全屏播放"}
                onFocus={revealControls}
                style={{`
);
content = content.replace(
    /background: 'none', border: 'none', cursor: 'pointer', color: '#fff',\s*display: 'flex', alignItems: 'center', justifyContent: 'center',/,
    `background: 'none', border: 'none', cursor: 'pointer', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: '48px', minHeight: '48px',`
);

// 7. Replay & Next large buttons in End overlay
content = content.replace(
    /<button \s*onClick=\{\(\) => \{ setIsEnded\(false\); if\(videoRef\.current\) videoRef\.current\.currentTime = 0; setIsPlaying\(true\); \}\} /,
    `<button 
                  aria-label="重播"
                  onClick={() => { setIsEnded(false); if(videoRef.current) videoRef.current.currentTime = 0; setIsPlaying(true); }} `
);

content = content.replace(
    /<button \s*onClick=\{\(\) => \{ handleNext\(\); setIsPlaying\(true\); \}\} /,
    `<button 
                    aria-label="下一题"
                    onClick={() => { handleNext(); setIsPlaying(true); }} `
);


// 8. Shape distinctions in Timeline Nodes
content = content.replace(
    /\{node\.nodeType === 'heart' \? <Heart size=\{18\} fill="#fff" color="#fff"\/> : <Star size=\{18\} fill="#fff" color="#fff"\/>\}/,
    `{node.isCompleted ? <CheckCircle size={24} fill="#fff" color={node.color || 'var(--color-primary)'}/> : 
                   (node.nodeType === 'heart' ? <Heart size={18} fill="#fff" color="#fff"/> : <Star size={18} fill="#fff" color="#fff"/>)}`
);

// Make the border of timeline node distinct for starred
content = content.replace(
    /border: node\.isStarred \? '2px solid #fbbf24' : '2px solid transparent'/,
    `border: node.isStarred ? '3px dashed #fbbf24' : '2px solid transparent'`
);

// 9. Back button
content = content.replace(
    /<button onClick=\{onExit\} style=\{\{/,
    `<button onClick={onExit} aria-label="返回" title="返回" style={{
          minWidth: '48px', minHeight: '48px',`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('A11y fixes applied!');

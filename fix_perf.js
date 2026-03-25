const fs = require('fs');

let content = fs.readFileSync('src/components/InterviewMode.jsx', 'utf8');

// 1. Add useFPS and LazyBackgroundTile before InterviewMode component
const customComponents = `
const useFPS = () => {
  const [fps, setFps] = useState(60);
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId;
    
    const loop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      animationId = requestAnimationFrame(loop);
    };
    
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, []);
  return fps;
};

const LazyBackgroundTile = ({ memory, isCurrent, isNext, reducedMotion, windowWidth }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' }); // Load a bit before it enters viewport
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const shouldLoad = isVisible || isCurrent || isNext;

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0 }}
      animate={reducedMotion ? { opacity: 0.2 } : { 
        opacity: [0.1, 0.3, 0.1],
        scale: windowWidth < 768 ? 1 : [0.98, 1.02, 0.98]
      }}
      transition={reducedMotion ? { duration: 1 } : { 
        duration: 10 + Math.random() * 5, 
        repeat: Infinity, 
        delay: Math.random() * 5 
      }}
      style={{
        backgroundImage: shouldLoad ? \`url(\${memory.thumbnail})\` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 'var(--radius-md)',
        filter: isCurrent ? 'none' : 'grayscale(80%) blur(1px)',
        opacity: isCurrent ? 1 : undefined,
        transition: 'all 0.5s ease',
        willChange: 'opacity, transform'
      }}
    />
  );
};

`;

content = content.replace('const InterviewMode = ({ memories, onExit }) => {', customComponents + 'const InterviewMode = ({ memories, onExit }) => {');

// 2. Add performance degradation logic inside InterviewMode
const perfLogic = `
  const [missingLogs, setMissingLogs] = useState([]);
  const [showMissingLogs, setShowMissingLogs] = useState(false);
  const currentFps = useFPS();
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    if (currentFps < 30) {
      setIsLowPerformance(true);
    } else if (currentFps > 45) {
      setIsLowPerformance(false);
    }
  }, [currentFps]);

  const effectiveReducedMotion = reducedMotion || isLowPerformance;
`;

content = content.replace('const hideControlsTimerRef = useRef(null);', perfLogic + '\n  const hideControlsTimerRef = useRef(null);');

// 3. Update backgroundMemories logic to use isLowPerformance
content = content.replace(
  'let maxTiles = 48; // default for large screens',
  'let maxTiles = isLowPerformance ? 12 : 48; // default for large screens'
);
content = content.replace(
  '[interviewMemories, windowWidth]',
  '[interviewMemories, windowWidth, isLowPerformance]'
);

// 4. Update missing logs logic
// Find where currentVideo is matched
const logLogic = `
  useEffect(() => {
    const node = timeline[currentNodeIndex];
    if (node && node.videoKeyword && !currentVideo) {
      setMissingLogs(prev => {
        if (!prev.includes(node.videoKeyword)) {
          console.warn(\`[素材匹配日志] 找不到关键字为 "\${node.videoKeyword}" 的视频\`);
          return [...prev, node.videoKeyword];
        }
        return prev;
      });
    }
  }, [currentNodeIndex, currentVideo, timeline]);
`;

content = content.replace('const videoRef = useRef(null);', logLogic + '\n  const videoRef = useRef(null);');

// 5. Use LazyBackgroundTile instead of direct motion.div
const oldBackgroundDiv = /{backgroundMemories\.map\(\(m, idx\) => \([\s\S]*?willChange: 'opacity, transform'\s*}}\s*\/>\s*\)\)}/;

const newBackgroundDiv = `{backgroundMemories.map((m, idx) => (
          <LazyBackgroundTile 
            key={m.id}
            memory={m}
            isCurrent={currentVideo && m.id === currentVideo.id}
            isNext={nextVideo && m.id === nextVideo.id}
            reducedMotion={effectiveReducedMotion}
            windowWidth={windowWidth}
          />
        ))}`;

content = content.replace(oldBackgroundDiv, newBackgroundDiv);

// 6. Update Error UI to show Logs
const oldErrorUI = `<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <p>等待视频素材...</p>
            <small style={{opacity: 0.7}}>请将视频放入 media/sucai/caifang 目录</small>
            <small style={{opacity: 0.5}}>关键词: {timeline[currentNodeIndex]?.videoKeyword || 'unknown'}</small>
          </div>`;

const newErrorUI = `<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <p>等待视频素材...</p>
            <small style={{opacity: 0.7}}>请将视频放入 media/sucai/caifang 目录</small>
            <small style={{opacity: 0.5}}>关键词: {timeline[currentNodeIndex]?.videoKeyword || 'unknown'}</small>
            {missingLogs.length > 0 && (
              <button 
                onClick={() => setShowMissingLogs(true)}
                style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                查看缺失素材日志 ({missingLogs.length})
              </button>
            )}
          </div>`;

content = content.replace(oldErrorUI, newErrorUI);

// 7. Add Missing Logs Modal
const missingLogsModal = `
      {/* Missing Logs Modal */}
      <AnimatePresence>
        {showMissingLogs && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowMissingLogs(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ width: 'min(90vw, 400px)', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-xl)', color: 'var(--color-text)' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ margin: 0, color: 'var(--color-danger)' }}>素材匹配日志</h3>
                <button onClick={() => setShowMissingLogs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }}>
                以下关键字未在 \`media/sucai/caifang\` 目录中匹配到视频文件，请检查文件名：
              </p>
              <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'var(--color-bg)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}>
                {missingLogs.map((log, i) => (
                  <div key={i} style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)', fontSize: '14px', fontFamily: 'monospace' }}>
                    {log}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

content = content.replace('    </div>\n  );\n};', missingLogsModal + '\n    </div>\n  );\n};');

// Also import X from lucide-react if not already imported? It is already imported.

fs.writeFileSync('src/components/InterviewMode.jsx', content, 'utf8');
console.log('Done perf updates');

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import Bubble from './components/Bubble';
import Menu from './components/Menu';
import TimelineView from './components/TimelineView';

function App() {
  const [memories, setMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [currentMode, setCurrentMode] = useState('view'); // Default to view (bubbles)
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [clickPosition, setClickPosition] = useState(null); // {x, y} for ripple origin
  
  // Initialize container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Fetch memories periodically
  useEffect(() => {
    // Pause polling when modal is open
    if (selectedMemory) return;

    const fetchMemories = async () => {
      try {
        const response = await fetch('/api/memories');
        if (response.ok) {
          const data = await response.json();
          // Simple diff check could be added here to avoid unnecessary re-renders
          // For now, React's reconciliation handles it well enough for small lists
          setMemories(data);
        }
      } catch (error) {
        console.error('Failed to fetch memories:', error);
      }
    };

    fetchMemories();
    const interval = setInterval(fetchMemories, 3000);

    return () => clearInterval(interval);
  }, [selectedMemory]); // Re-subscribe when modal closes

  const handleBubbleClick = (memory, position) => {
    if (position) {
      setClickPosition(position);
    } else {
      // Fallback center if no position (e.g. from timeline)
      setClickPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
    
    // Slight delay to let ripple start before opening modal? 
    // Or open immediately with animation origin
    setSelectedMemory(memory);
  };

  return (
    <div className="bubble-container" ref={containerRef}>
      <Menu currentMode={currentMode} onModeChange={setCurrentMode} />

      {/* Background Glow Elements */}
      <div className="glow-effect glow-1"></div>
      <div className="glow-effect glow-2"></div>
      <div className="glow-effect glow-3"></div>

      {/* Mode-specific content */}
      {currentMode === 'interview' && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.8)', padding: '20px 40px', borderRadius: 20, textAlign: 'center' }}>
          <h2>🎤 采访模式</h2>
          <p>录音功能开发中...</p>
        </div>
      )}

      {currentMode === 'memory' && (
         <TimelineView memories={memories} onSelect={setSelectedMemory} />
      )}

      {currentMode === 'view' && memories.map((memory) => (
        <Bubble
          key={memory.id}
          memory={memory}
          onClick={(m, pos) => handleBubbleClick(m, pos)}
          containerSize={containerSize}
        />
      ))}

      <AnimatePresence>
      {selectedMemory && (
        <motion.div 
          className="modal-overlay" 
          onClick={() => setSelectedMemory(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Ripple / Expansion Effect */}
          {clickPosition && (
            <motion.div
              initial={{ 
                position: 'absolute',
                top: clickPosition.y, 
                left: clickPosition.x, 
                width: 0, 
                height: 0, 
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.8)',
                zIndex: 0
              }}
              animate={{ 
                scale: 50, // Expand to cover screen
                opacity: 0
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ pointerEvents: 'none' }}
            />
          )}

          <motion.div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button className="close-btn" onClick={() => setSelectedMemory(null)}>×</button>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>{selectedMemory.name}</h3>
            {renderPreview(selectedMemory)}
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

function renderPreview(memory) {
  const url = memory.url; 
  switch (memory.type) {
    case 'video':
      return <video src={url} controls autoPlay />;
    case 'image':
      return <img src={url} alt={memory.name} />;
    case 'audio':
      return <audio src={url} controls autoPlay />;
    default:
      return <p>Unsupported format</p>;
  }
}

export default App;

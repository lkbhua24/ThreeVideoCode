import React, { useEffect, useMemo, useState } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

const Bubble = ({ memory, onClick, containerSize, targetPosition }) => {
  const controls = useAnimation();
  const [thumbError, setThumbError] = useState(false);
  const [isRippling, setIsRippling] = useState(false);
  
  // Stable color based on file name
  const color = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < memory.name.length; i++) {
      hash = memory.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase().padStart(6, '0');
    return '#' + c;
  }, [memory.name]);

  // File type icon
  const icon = useMemo(() => {
    switch (memory.type) {
      case 'video': return '🎥';
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      default: return '📄';
    }
  }, [memory.type]);

  // Floating animation logic
  useEffect(() => {
    let isMounted = true;
    
    const float = async () => {
      while (isMounted) {
        if (targetPosition) {
          // If target position is set, move there and stay
          await controls.start({
            x: targetPosition.x,
            y: targetPosition.y,
            transition: { 
              duration: 2, // Smooth transition to heart shape
              ease: "easeInOut" 
            }
          });
          // Wait a bit to avoid busy loop if targetPosition doesn't change
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          // Random floating behavior
          const padding = 60;
          const x = Math.random() * (containerSize.width - padding * 2) + padding;
          const y = Math.random() * (containerSize.height - padding * 2) + padding;
          
          const duration = 8 + Math.random() * 4;
          
          await controls.start({
            x,
            y,
            transition: { 
              duration, 
              ease: "easeInOut" 
            }
          });
        }
      }
    };

    if (containerSize.width > 0 && containerSize.height > 0) {
      // Set initial random position if not already set (conceptually)
      // We use a ref or just rely on controls.set
      // If we have a targetPosition on mount, we might want to start there or animate there.
      // But typically bubbles start random.
      
      // Only set random start if we don't have a target yet, or even if we do, starting random then moving is fine.
      if (!targetPosition) {
        const initialX = Math.random() * (containerSize.width - 60);
        const initialY = Math.random() * (containerSize.height - 60);
        controls.set({ x: initialX, y: initialY });
      }
      
      float();
    }

    return () => { isMounted = false; controls.stop(); };
  }, [containerSize, controls, targetPosition]);

  const handleClick = (e) => {
    // Trigger ripple
    setIsRippling(true);
    
    // Call parent onClick after a small delay or immediately
    // Here we might want to delay slightly to show the ripple start
    // or just let the ripple expand while the modal opens.
    // Let's pass the memory immediately.
    onClick(memory, { x: e.clientX, y: e.clientY });

    // Reset ripple state after animation
    setTimeout(() => setIsRippling(false), 1000);
  };

  return (
    <>
    {/* Ripple Effect (Rendered outside to avoid being clipped by bubble overflow) */}
    {/* Ideally this should be in a portal or handled by parent, but for now we can try absolute positioning if bubble container allows */}
    
    <motion.div
      className="bubble"
      animate={controls}
      onClick={handleClick}
      whileHover={{ scale: 1.1, zIndex: 100 }}
      whileTap={{ scale: 0.95 }}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Transparent with slight tint
        backdropFilter: 'blur(4px)',
        width: '80px',
        height: '80px',
        position: 'absolute',
        top: 0,
        left: 0,
        boxShadow: `0 0 15px rgba(255, 255, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2)`, // Subtle glow
        overflow: 'hidden',
        border: '2px solid rgba(255, 255, 255, 0.6)',
        borderRadius: '50%'
      }}
      title={memory.name}
    >
      {memory.type === 'video' ? (
        <video 
          src={`${memory.url}#t=0.001`} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            pointerEvents: 'none',
            opacity: 0.85
          }} 
          preload="metadata"
          muted
          playsInline
        />
      ) : memory.thumbnail && !thumbError ? (
        <img 
          src={memory.thumbnail} 
          alt={memory.name} 
          onError={() => setThumbError(true)}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            pointerEvents: 'none',
            opacity: 0.85 // Slightly transparent image
          }} 
        />
      ) : (
        <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>{icon}</span>
      )}
    </motion.div>
    </>
  );
};

export default Bubble;

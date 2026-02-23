import React from 'react';
import { motion } from 'framer-motion';

const RomanticFooter = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: -430 }}
      animate={{ opacity: 1, y: 0, x: -430 }}
      transition={{ delay: 0.5, duration: 1 }}
      style={{
        position: 'fixed',
        bottom: 'clamp(20px, 4vh, 40px)', // Adaptive bottom spacing
        left: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'baseline',
        gap: '15px',
        pointerEvents: 'none',
        zIndex: 10,
        padding: '0 20px',
        flexWrap: 'wrap'
      }}
    >
      <div style={{
        fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
        fontSize: 'clamp(20px, 3.5vw, 42px)',
        fontWeight: '700',
        fontStyle: 'italic',
        background: 'linear-gradient(45deg, #FF6B9C, #83728D, #46579D)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        textShadow: '2px 2px 4px rgba(255,255,255,0.4)',
        letterSpacing: '1px'
      }}>
        Everything related to you is romantic
      </div>
      
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: 'clamp(12px, 1.8vw, 16px)',
        color: 'rgba(100, 100, 100, 0.6)',
        fontWeight: '500',
        letterSpacing: '2px',
        whiteSpace: 'nowrap'
      }}>
        —— LkbHua
      </div>
    </motion.div>
  );
};

export default RomanticFooter;

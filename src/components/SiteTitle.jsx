import React from 'react';
import { motion } from 'framer-motion';

const SiteTitle = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5 }}
      style={{
        position: 'fixed',
        top: '24px',
        left: 'calc(50% - 160px)', // Moved another 60px left (total 160px from center)
        transform: 'translateX(-50%)',
        zIndex: 50,
        textAlign: 'center',
        pointerEvents: 'none', // Let clicks pass through
        userSelect: 'none',
        width: 'max-content' // Ensure width fits content
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300&display=swap');
        `}
      </style>
      
      {/* Main Title */}
      <h1 style={{
        fontFamily: "'Dancing Script', cursive",
        fontSize: '3.8rem', // Adjusted size
        margin: 0,
        fontWeight: 700,
        letterSpacing: '1px',
        color: 'rgba(255, 255, 255, 1)', // Full opacity
        textShadow: '0 0 10px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.1)', // Enhanced glow
        lineHeight: 1.2
      }}>
        Echoes of Us
      </h1>
      
      {/* Subtitle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 1, delay: 1 }}
        style={{
          fontFamily: "'Noto Serif SC', serif",
          fontSize: '1.1rem',
          marginTop: '0px',
          letterSpacing: '6px', // Wide spacing for elegance
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: 300,
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        我们的回响
      </motion.div>
      
      {/* Decorative Glow/Sparkles */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
        zIndex: -1,
        filter: 'blur(30px)',
        borderRadius: '50%'
      }} />
      
      {/* Optional: Tiny floating particles/dots */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: '-10px',
          right: '-20px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.4)',
          filter: 'blur(1px)'
        }}
      />
       <motion.div
        animate={{
          y: [0, 10, 0],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        style={{
          position: 'absolute',
          bottom: '0px',
          left: '-15px',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.4)',
          filter: 'blur(1px)'
        }}
      />
    </motion.div>
  );
};

export default SiteTitle;

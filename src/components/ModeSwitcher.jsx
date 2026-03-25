import React from 'react';
import { motion } from 'framer-motion';
import { Home, Eye, Clock, Mic } from 'lucide-react';

const ModeSwitcher = ({ currentMode, onModeChange }) => {
  const modes = [
    { 
      id: 'home', 
      label: '首页', 
      icon: Home,
      activeColor: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', // Soft white/grey
      iconColor: '#83728D'
    },
    { 
      id: 'view', 
      label: '查看', 
      icon: Eye,
      activeColor: 'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)', // Soft purple-blue
      iconColor: '#4A90E2'
    },
    { 
      id: 'memory', 
      label: '回忆', 
      icon: Clock,
      activeColor: 'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)', // Peach/Orange
      iconColor: '#FF6B9C'
    },
    { 
      id: 'interview', 
      label: '采访', 
      icon: Mic,
      activeColor: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)', // Light Blue
      iconColor: '#5B73E8'
    },
  ];

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'fixed',
        top: '24px',
        left: '90px',
        zIndex: 100,
        display: 'flex',
        background: 'rgba(255, 255, 255, 0.25)', // Lighter, glassier
        backdropFilter: 'blur(16px)',
        borderRadius: '24px', // More compact radius
        padding: '4px', // Reduced padding
        boxShadow: '0 4px 15px rgba(31, 38, 135, 0.07)', // Softer shadow
        height: '40px', // Reduced height (was 50px)
        alignItems: 'center',
        gap: '4px',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}
    >
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        const Icon = mode.icon;
        
        return (
          <motion.button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            style={{
              background: isActive ? mode.activeColor : 'transparent',
              border: 'none',
              borderRadius: '20px',
              padding: isActive ? '6px 14px' : '6px 10px', // Smaller padding
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isActive ? '#fff' : '#555', // Darker text for inactive on light bg
              position: 'relative',
              outline: 'none',
              fontFamily: "'Noto Serif SC', serif",
              fontSize: '12px', // Smaller font
              whiteSpace: 'nowrap',
              transition: 'all 0.3s ease',
              boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
            }}
            whileHover={{ scale: 1.05, backgroundColor: isActive ? undefined : 'rgba(255,255,255,0.4)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon 
              size={15} // Smaller icon
              strokeWidth={2} 
              color={isActive ? '#fff' : mode.iconColor} 
            />
            {isActive && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                style={{ fontWeight: 500, overflow: 'hidden', color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
              >
                {mode.label}
              </motion.span>
            )}
            {!isActive && (
               <span style={{ fontWeight: 400, opacity: 0.8 }}>{mode.label}</span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default ModeSwitcher;

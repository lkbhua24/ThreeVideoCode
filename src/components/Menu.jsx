import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, LayoutGrid, Menu as MenuIcon, X } from 'lucide-react';

const MODES = [
  { id: 'view', label: '查看模式', icon: LayoutGrid, color: '#35BC68', bgColor: '#E8F7ED' },
  { id: 'memory', label: '回忆模式', icon: Sparkles, color: '#FF6B9C', bgColor: '#FFF0F5' },
  { id: 'interview', label: '采访模式', icon: Mic, color: '#46579D', bgColor: '#E6E9FF' }
];

const Menu = ({ currentMode, onModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get current active icon for closed state
  const ActiveIcon = MODES.find(m => m.id === currentMode)?.icon || MenuIcon;

  return (
    <div style={{ position: 'fixed', top: '24px', left: '24px', zIndex: 1000 }}>
      <motion.div
        layout
        initial={{ width: '48px', height: '48px', borderRadius: '24px' }}
        animate={{
          width: isOpen ? 'auto' : '48px',
          height: '48px',
          borderRadius: '24px'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          padding: 0
        }}
      >
        {/* Toggle Button */}
        <motion.button
          layout
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '48px',
            height: '48px',
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            color: '#333'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen ? <X size={24} /> : <ActiveIcon size={24} color={MODES.find(m => m.id === currentMode)?.color} />}
        </motion.button>

        {/* Menu Items */}
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                display: 'flex',
                gap: '8px',
                paddingRight: '8px',
                alignItems: 'center'
              }}
            >
              {MODES.map((mode) => {
                const isActive = currentMode === mode.id;
                const Icon = mode.icon;
                
                return (
                  <motion.button
                    key={mode.id}
                    onClick={() => {
                      onModeChange(mode.id);
                      setIsOpen(false);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      border: 'none',
                      background: isActive ? mode.color : mode.bgColor,
                      color: isActive ? '#fff' : mode.color,
                      padding: '8px 16px',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      transition: 'background-color 0.2s, color 0.2s',
                      boxShadow: isActive ? `0 4px 12px ${mode.color}66` : 'none'
                    }}
                  >
                    <Icon size={16} strokeWidth={2.5} />
                    {mode.label}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Menu;

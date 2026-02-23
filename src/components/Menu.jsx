import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mic, LayoutGrid, Menu as MenuIcon, X, Home, ChevronRight, ChevronLeft, Settings, Image as ImageIcon, Video, Map, Clock, Globe } from 'lucide-react';

const MODES = [
  { 
    id: 'home', 
    label: '首页模式', 
    icon: Home, 
    color: '#83728D', 
    bgColor: '#F2EEF4',
    subOptions: [
      { id: 'default', label: '默认视图', icon: Settings }
    ]
  },
  { 
    id: 'view', 
    label: '查看模式', 
    icon: LayoutGrid, 
    color: '#35BC68', 
    bgColor: '#E8F7ED',
    subOptions: [
      { id: 'photos', label: '照片墙', icon: ImageIcon },
      { id: 'videos', label: '视频流', icon: Video }
    ]
  },
  { 
    id: 'memory', 
    label: '回忆模式', 
    icon: Sparkles, 
    color: '#FF6B9C', 
    bgColor: '#FFF0F5',
    subOptions: [
      { id: 'timeline', label: '时间轴', icon: Clock },
      { id: 'map', label: '足迹地图', icon: Map }
    ]
  },
  { 
    id: 'interview', 
    label: '采访模式', 
    icon: Mic, 
    color: '#46579D', 
    bgColor: '#E6E9FF',
    subOptions: [
      { id: 'record', label: '开始录音', icon: Mic },
      { id: 'history', label: '历史记录', icon: Clock }
    ]
  }
];

const MAIN_MENU = [
  { id: 'mode_selection', label: '模式选择', icon: LayoutGrid, color: '#333' },
  { id: 'morning_dusk', label: '我们的故事', icon: Sparkles, color: '#DE7AD6' },
  { id: 'travel_album', label: '旅行相册', icon: Globe, color: '#333' }
];

const Menu = ({ currentMode, onModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMain, setExpandedMain] = useState(null);

  // Reset expansion when menu closes
  React.useEffect(() => {
    if (!isOpen) setExpandedMain(null);
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Dynamic background based on current mode
  const getMenuBackground = (mode) => {
    switch (mode) {
      case 'home':
        return `
          radial-gradient(circle at 10% 20%, rgba(255, 182, 193, 0.25) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(255, 105, 180, 0.2) 0%, transparent 40%),
          linear-gradient(135deg, rgba(255, 240, 245, 0.85) 0%, rgba(255, 228, 225, 0.85) 100%)
        `;
      case 'travel':
        return `
          radial-gradient(circle at 10% 20%, rgba(135, 206, 235, 0.25) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(144, 238, 144, 0.2) 0%, transparent 40%),
          linear-gradient(135deg, rgba(224, 255, 255, 0.85) 0%, rgba(240, 255, 240, 0.85) 100%)
        `;
      case 'morning_dusk':
        return `
          radial-gradient(circle at 10% 20%, rgba(222, 122, 214, 0.25) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(230, 230, 250, 0.2) 0%, transparent 40%),
          linear-gradient(135deg, rgba(245, 230, 250, 0.85) 0%, rgba(230, 230, 250, 0.85) 100%)
        `;
      case 'view':
        return `
          radial-gradient(circle at 10% 20%, rgba(176, 196, 222, 0.25) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(173, 216, 230, 0.2) 0%, transparent 40%),
          linear-gradient(135deg, rgba(240, 248, 255, 0.85) 0%, rgba(230, 240, 250, 0.85) 100%)
        `;
      case 'memory':
        return `
          radial-gradient(circle at 10% 20%, rgba(255, 160, 122, 0.25) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(255, 218, 185, 0.2) 0%, transparent 40%),
          linear-gradient(135deg, rgba(255, 245, 238, 0.85) 0%, rgba(255, 240, 230, 0.85) 100%)
        `;
      case 'interview':
        return `
          radial-gradient(circle at 10% 20%, rgba(147, 112, 219, 0.25) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(138, 43, 226, 0.2) 0%, transparent 40%),
          linear-gradient(135deg, rgba(240, 240, 255, 0.85) 0%, rgba(230, 230, 250, 0.85) 100%)
        `;
      default:
        return `
          radial-gradient(circle at 10% 20%, rgba(216, 191, 216, 0.25) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(255, 182, 193, 0.2) 0%, transparent 40%),
          linear-gradient(135deg, rgba(255, 250, 250, 0.85) 0%, rgba(255, 245, 255, 0.85) 100%)
        `;
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={toggleMenu}
            style={{
              position: 'fixed',
              top: '24px',
              left: '24px',
              zIndex: 1001, // Above drawer
              width: '48px',
              height: '48px',
              borderRadius: '24px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#333'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Home size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.2)',
              zIndex: 999,
              backdropFilter: 'blur(4px)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              width: '280px', // Base width
              backgroundImage: getMenuBackground(currentMode),
              backdropFilter: 'blur(20px)',
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.05)',
              zIndex: 1000,
              padding: '130px 20px 20px 20px', // Increased top padding
              display: 'flex',
              flexDirection: 'column',
              gap: '12px' // Reduced gap for more compact feel
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Close Button (<) */}
            <motion.div
              initial={{ y: '-50%' }}
              animate={{ y: '-50%' }}
              whileHover={{ scale: 1.2, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                right: '0px',
                top: '50%',
                width: '24px',
                height: '48px',
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(4px)',
                borderTopLeftRadius: '12px',
                borderBottomLeftRadius: '12px',
                boxShadow: '-2px 0 8px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1002,
                color: '#666'
              }}
            >
              <ChevronLeft size={20} />
            </motion.div>

            {/* Header: Couple Bears & Explore Surprise */}
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '20px',
              right: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* Couple Bears Logo */}
              <div style={{ width: '80px', height: '60px', position: 'relative' }}>
                <svg width="80" height="60" viewBox="0 0 80 60">
                   {/* Bear 1 (Left, Brown) */}
                   <g transform="translate(10, 10)">
                      <circle cx="15" cy="15" r="14" fill="#D7CCC8" /> {/* Head */}
                      <circle cx="6" cy="6" r="5" fill="#D7CCC8" />  {/* L Ear */}
                      <circle cx="24" cy="6" r="5" fill="#D7CCC8" />  {/* R Ear */}
                      <circle cx="11" cy="12" r="1.5" fill="#333" /> {/* L Eye */}
                      <circle cx="19" cy="12" r="1.5" fill="#333" /> {/* R Eye */}
                      <ellipse cx="15" cy="18" rx="5" ry="4" fill="#FFE0B2" /> {/* Muzzle */}
                      <circle cx="15" cy="17" r="1.5" fill="#5D4037" /> {/* Nose */}
                   </g>
                   {/* Bear 2 (Right, Pinkish, Leaning left) */}
                   <g transform="translate(45, 12) rotate(-15)">
                      <circle cx="15" cy="15" r="13" fill="#F8BBD0" /> {/* Head */}
                      <circle cx="6" cy="6" r="4.5" fill="#F8BBD0" />  {/* L Ear */}
                      <circle cx="24" cy="6" r="4.5" fill="#F8BBD0" />  {/* R Ear */}
                      <circle cx="11" cy="12" r="1.5" fill="#333" /> {/* L Eye */}
                      <circle cx="19" cy="12" r="1.5" fill="#333" /> {/* R Eye */}
                      <ellipse cx="15" cy="18" rx="5" ry="4" fill="#FFE0B2" /> {/* Muzzle */}
                      <circle cx="15" cy="17" r="1.5" fill="#5D4037" /> {/* Nose */}
                      <path d="M 15 22 Q 18 24 21 22" fill="none" stroke="#E91E63" strokeWidth="1" /> {/* Smile */}
                   </g>
                   {/* Heart between them */}
                   <path d="M 36 8 Q 40 4 44 8 Q 40 14 36 8" fill="#FF4081" transform="scale(1.2)" />
                </svg>
              </div>

              {/* Text */}
              <div style={{
                fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif',
                fontSize: '1.2rem',
                color: '#666', // Softer color
                fontWeight: '400', // Reduced weight
                letterSpacing: '0.5px',
                fontStyle: 'italic'
              }}>
                Explore Surprise
              </div>
            </div>

            {MAIN_MENU.map((item, index) => {
              const isExpanded = expandedMain === item.id;
              const Icon = item.icon;
              const isModeSelection = item.id === 'mode_selection';
              
              return (
                <div key={item.id} style={{ position: 'relative' }}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      padding: '8px 16px', // More compact padding
                      borderRadius: '50px', // Capsule style
                      background: 'rgba(255, 255, 255, 0.05)', // 5% transparency
                      backdropFilter: 'blur(12px)', // Enhanced blur for fluid glass
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '10px', // Compact gap
                      border: '0.5px solid rgba(255, 255, 255, 0.1)', // Finer border
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)', // Very subtle shadow
                      marginBottom: '2px' // More compact spacing
                    }}
                    whileHover={{ 
                      scale: 1.01, 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                    }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}
                      onClick={() => {
                        if (isModeSelection) {
                          onModeChange('home');
                          setIsOpen(false);
                        } else if (item.id === 'travel_album') {
                          onModeChange('travel');
                          setIsOpen(false);
                        } else if (item.id === 'morning_dusk') {
                          onModeChange('morning_dusk');
                          setIsOpen(false);
                        }
                      }}
                      onContextMenu={(e) => {
                        if (isModeSelection) {
                          e.preventDefault();
                          e.stopPropagation();
                          setExpandedMain(isExpanded ? null : item.id);
                        }
                      }}
                    >
                      <Icon size={18} strokeWidth={1.5} style={{ opacity: 0.6, color: '#555' }} />
                      <span style={{ fontSize: '13px', fontWeight: '400', color: '#666', letterSpacing: '0.5px' }}>{item.label}</span>
                      
                      {isModeSelection && (
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedMain(isExpanded ? null : item.id);
                            }}
                            style={{ opacity: 0.4 }}
                          >
                            <ChevronRight size={14} color="#666" />
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Expanded Area - Modes (Only for Mode Selection) */}
                  <AnimatePresence>
                    {isExpanded && isModeSelection && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 8, scale: 1 }}
                        exit={{ opacity: 0, x: -5, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={{
                          position: 'absolute',
                          left: '100%',
                          top: 0,
                          background: 'rgba(255, 255, 255, 0.2)', // More transparent
                          backdropFilter: 'blur(16px)', // Stronger blur
                          borderRadius: '24px', // More rounded
                          padding: '8px', // Compact
                          boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                          display: 'flex',
                          flexDirection: 'row', // Horizontal expansion
                          gap: '8px',
                          zIndex: 10,
                          minWidth: 'max-content',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        {MODES.map((mode) => {
                          const isActive = currentMode === mode.id;
                          return (
                            <motion.button
                              key={mode.id}
                              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                              whileTap={{ scale: 0.95 }}
                              style={{
                                border: 'none',
                                background: isActive ? 'rgba(255, 255, 255, 0.4)' : 'transparent',
                                color: isActive ? mode.color : '#555',
                                padding: '8px 12px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                minWidth: '70px',
                                transition: 'all 0.2s',
                                boxShadow: isActive ? `0 2px 8px ${mode.color}20` : 'none'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onModeChange(mode.id);
                              }}
                            >
                              <mode.icon size={20} color={isActive ? mode.color : '#666'} strokeWidth={1.5} />
                              <span>{mode.label}</span>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Menu;
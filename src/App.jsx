import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import Bubble from './components/Bubble';
import Menu from './components/Menu';
import ModeSwitcher from './components/ModeSwitcher';
import TimelineView from './components/TimelineView';
import BackgroundMedia from './components/BackgroundMedia';
import LoveClock from './components/LoveClock';
import RomanticFooter from './components/RomanticFooter';
import MessageBoard from './components/MessageBoard';
import SiteTitle from './components/SiteTitle';
import PhotoCarousel from './components/PhotoCarousel';
import BearCyclists from './components/BearCyclists';
import TravelAlbum from './components/TravelAlbum';
import TravelPin from './components/TravelPin';
import MorningDusk from './components/MorningDusk';
import AboutUs from './components/AboutUs';
import GamePage from './components/GamePage';
import InterviewMode from './components/InterviewMode';
import DebugPanel from './components/DebugPanel';
import { Heart, Mail, Send, Plane, Dice5, Shuffle } from 'lucide-react';

function App() {
  const [memories, setMemories] = useState([]);
  const [displayMemories, setDisplayMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [currentMode, setCurrentMode] = useState('home');
  const [selectedCity, setSelectedCity] = useState(null);
  const [totalHours, setTotalHours] = useState(0); // Track accumulated hours for hearts
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [clickPosition, setClickPosition] = useState(null); // {x, y} for ripple origin
  const [isHeartMode, setIsHeartMode] = useState(false);
  const [heartCenterMemory, setHeartCenterMemory] = useState(null);
  const [heartFitMode, setHeartFitMode] = useState('cover'); // 'cover', 'contain', 'pan'
  const [heartPan, setHeartPan] = useState({ x: 50, y: 50 });

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

  function getDisplayTitle(m) {
    const name = m?.name || '';
    if (m?.date) {
      return `${m.date} ${name}`.trim();
    }
    const rel = m?.relativePath || '';
    const parts = rel.split(/[\/\\]/);
    if (parts.length >= 2) {
      const parent = parts[parts.length - 2];
      return `${parent} ${name}`.trim();
    }
    return name;
  }

  // Fetch memories periodically
  useEffect(() => {
    // Pause polling when modal is open
    if (selectedMemory) return;

    const fetchMemories = async () => {
      try {
        const response = await fetch('/api/memories');
        if (response.ok) {
          const data = await response.json();
          setMemories(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(data)) {
              return data;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Failed to fetch memories:', error);
      }
    };

    fetchMemories();
    const interval = setInterval(fetchMemories, 3000);

    return () => clearInterval(interval);
  }, [selectedMemory]); // Re-subscribe when modal closes

  // Update displayMemories when memories change
  useEffect(() => {
    if (isHeartMode) return;
    
    if (memories.length > 0) {
      // Randomly select up to 100 items
      const shuffled = [...memories].sort(() => 0.5 - Math.random());
      setDisplayMemories(shuffled.slice(0, 100));
    } else {
      setDisplayMemories([]);
    }
  }, [memories]);

  const homeFloatItems = useMemo(() => {
    // 6 types of items
    const baseItems = [
      { kind: 'icon', icon: 'heart', color: 'rgba(255,105,180,0.8)' }, // HotPink
      { kind: 'icon', icon: 'mail',  color: 'rgba(255,182,193,0.8)' }, // LightPink
      { kind: 'icon', icon: 'send',  color: 'rgba(135,206,250,0.8)' }, // LightSkyBlue
      { kind: 'icon', icon: 'plane', color: 'rgba(176,196,222,0.8)' }, // LightSteelBlue
      { kind: 'emoji', text: '🕊️' },
      { kind: 'emoji', text: '🚂' }
    ];

    // Generate 24 items with random positions across the entire page
    // Simulating free-floating bubbles with larger movement range
    const items = [];
    
    for (let i = 0; i < 24; i++) {
      const typeIndex = i % 6;
      const base = baseItems[typeIndex];
      
      // Random position 0-100%
      const left = Math.random() * 95; 
      const top = Math.random() * 95;
      
      items.push({
        ...base,
        id: i,
        top: `${top}%`,
        left: `${left}%`,
        size: Math.floor(Math.random() * 20) + 24, // 24-44px
        rot: Math.random() * 60 - 30, // -30 to 30 deg initial rotation
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 10, // 10-20s very slow float
        xRange: Math.random() * 60 + 30, // 30-90px horizontal sway
        yRange: Math.random() * 100 + 50, // 50-150px vertical float
        rotRange: Math.random() * 40 + 20, // 20-60 deg rotation sway
      });
    }
    return items;
  }, []);

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

  // Calculate heart position for bubbles
  const getHeartPosition = (index, total) => {
    if (!containerSize.width || !containerSize.height) return null;

    const { width, height } = containerSize;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Scale factor - adjust based on screen size (approx 35% of min dimension)
    // Reduce scale slightly to fit the wider heart
    const minDim = Math.min(width, height);
    const scale = minDim / 50;  
    
    // Distribute points along the heart curve
    const t = (index / total) * 2 * Math.PI;
    
    // Parametric heart equation
    // x = 16 * sin(t)^3
    // y = 13 * cos(t) - 5 * cos(2*t) - 2 * cos(3*t) - cos(4*t)
    // Multiply x by 1.8 to widen the heart significantly
    // Modified to make bottom rounder (reduce power from 3 to 2.6) and top V flatter (reduce cos(2t) from 5 to 4)
    const x = 16 * Math.sign(Math.sin(t)) * Math.pow(Math.abs(Math.sin(t)), 2.6) * 1.8;
    // Multiply y by 1.4 to elongate downwards while keeping top roughly in place (when offset is removed)
    const y = (13 * Math.cos(t) - 4 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * 1.4;
    
    // Invert Y because screen coordinates go down, and shift to center
    // Subtract 30 to center the bubble (assuming ~60px size)
    // Removed vertical offset to keep top lobes at approx same screen position (Top: ~13*1.4 = ~18 units up)
    return {
      x: centerX + x * scale - 30, 
      y: centerY - (y * scale) - 30 
    };
  };

  const computeHeartPath = () => {
    const w = containerSize.width;
    const h = containerSize.height;
    if (!w || !h) return '';
    const cx = w / 2;
    const cy = h / 2;
    const minDim = Math.min(w, h);
    const scale = minDim / 50;
    const kx = 1.8;
    const ky = 1.4;
    const N = 240;
    let d = '';
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * 2 * Math.PI;
      const x = cx + (16 * Math.sign(Math.sin(t)) * Math.pow(Math.abs(Math.sin(t)), 2.6)) * kx * scale;
      const y = cy - (13 * Math.cos(t) - 4 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * ky * scale;
      d += (i === 0 ? 'M ' : ' L ') + x + ' ' + y;
    }
    return d + ' Z';
  };

  const handleHeartModeToggle = () => {
    if (isHeartMode) {
      setIsHeartMode(false);
      setHeartCenterMemory(null);
    } else {
      setIsHeartMode(true);
      if (displayMemories.length > 0) {
        const randomIndex = Math.floor(Math.random() * displayMemories.length);
        setHeartCenterMemory(displayMemories[randomIndex]);
      }
    }
  };

  const handleRandomView = () => {
    if (memories.length > 0) {
      const randomIndex = Math.floor(Math.random() * memories.length);
      const randomMemory = memories[randomIndex];
      // Set click position to center for the "explosion" effect
      setClickPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      setSelectedMemory(randomMemory);
    }
  };

  return (
    <div className="bubble-container" ref={containerRef}>
      {currentMode === 'view' && (
        <BackgroundMedia 
          src="/Nice.png" 
          kind="image" 
          opacity={0.4} 
          blendMode="soft-light" 
        />
      )}

      <Menu currentMode={currentMode} onModeChange={(mode) => {
        // If switching to travel mode from menu, clear selected city to show overview
        if (mode === 'travel') {
          setSelectedCity(null);
        }
        setCurrentMode(mode);
      }} />

      {['home', 'view', 'memory', 'interview'].includes(currentMode) && (
        <ModeSwitcher currentMode={currentMode} onModeChange={setCurrentMode} />
      )}

      <SiteTitle />

      {/* Global Debug & Health Check Panel */}
      <DebugPanel currentMode={currentMode} />

      {/* Random View Button (Serendipity) */}
      <AnimatePresence>
        {currentMode === 'view' && (
          <>
            {/* Random Presentation Button */}
            <motion.button
              key="random-presentation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleHeartModeToggle}
              style={{
                position: 'fixed',
                top: '50px',
                left: 'calc(50% + 280px)', // Left of Serendipity (430 - 150)
                zIndex: 60,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '30px',
                padding: '10px 20px',
                color: 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05), inset 0 0 10px rgba(255, 255, 255, 0.1)',
                outline: 'none',
                fontFamily: "'Noto Serif SC', serif",
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Shuffle size={20} strokeWidth={1.5} style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' }} />
              <span style={{ fontSize: '15px', fontWeight: 300, letterSpacing: '2px' }}>随机呈现</span>
            </motion.button>

            {/* Existing Serendipity Button */}
            <motion.button
              key="serendipity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRandomView}
              style={{
                position: 'fixed',
                top: '50px', 
                left: 'calc(50% + 430px)', 
                zIndex: 60,
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))', 
                backdropFilter: 'blur(12px)', 
                border: '1px solid rgba(255, 255, 255, 0.15)', 
                borderRadius: '30px', 
                padding: '10px 20px',
                color: 'rgba(255, 255, 255, 0.9)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05), inset 0 0 10px rgba(255, 255, 255, 0.1)', 
                outline: 'none',
                fontFamily: "'Noto Serif SC', serif", 
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Dice5 size={20} strokeWidth={1.5} style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' }} />
              <span style={{ fontSize: '15px', fontWeight: 300, letterSpacing: '2px' }}>随缘偶遇</span>
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Background Glow Elements */}
      <div className="glow-effect glow-1"></div>
      <div className="glow-effect glow-2"></div>
      <div className="glow-effect glow-3"></div>

      {currentMode === 'home' && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 15, pointerEvents: 'none' }}>
          {homeFloatItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ y: 0, x: 0 }}
              animate={{ 
                y: [0, -item.yRange, 0],
                x: [0, item.xRange, 0],
                rotate: [item.rot, item.rot + item.rotRange, item.rot]
              }}
              transition={{ 
                duration: item.duration, 
                repeat: Infinity, 
                ease: 'easeInOut', 
                delay: item.delay,
                times: [0, 0.5, 1] // Ensure smooth loop
              }}
              style={{ 
                position: 'absolute', 
                top: item.top, 
                left: item.left, 
                fontSize: `${item.size}px`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' // Subtle shadow instead of blur for clarity
              }}
            >
              {item.kind === 'emoji' ? (
                <span style={{ opacity: 0.8 }}>{item.text}</span>
              ) : item.icon === 'heart' ? (
                <Heart size={item.size} color={item.color} fill={item.color} style={{ opacity: 0.8 }} />
              ) : item.icon === 'mail' ? (
                <Mail size={item.size} color={item.color} style={{ opacity: 0.8 }} />
              ) : item.icon === 'send' ? (
                <Send size={item.size} color={item.color} style={{ opacity: 0.8 }} />
              ) : (
                <Plane size={item.size} color={item.color} style={{ opacity: 0.8 }} />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Mode-specific content */}
      {currentMode === 'home' && (
        <>
          <PhotoCarousel />
          
          {/* Travel Pin Component - Positioned in the gap */}
          <div style={{
            position: 'absolute',
            top: '120px',
            left: '1068px', // 24px (margin) + 950px (Carousel) + 26px (gap) + 68px (adjustment)
            width: '240px',
            height: '750px', // Spans height of Clock + MessageBoard roughly
            zIndex: 5
          }}>
            <TravelPin onNavigate={(city) => {
              setSelectedCity(city);
              setCurrentMode('travel');
            }} />
          </div>

          <LoveClock onHourComplete={() => setTotalHours(prev => prev + 1)} />
          <MessageBoard />
          <RomanticFooter />
        </>
      )}

      {currentMode === 'interview' && (
        <InterviewMode 
          memories={memories} 
          onExit={() => setCurrentMode('home')} 
        />
      )}

      {currentMode === 'travel' && (
        <TravelAlbum city={selectedCity} onBack={() => setCurrentMode('home')} />
      )}

      {currentMode === 'morning_dusk' && (
        <MorningDusk onReturnToMemory={() => {
          localStorage.removeItem('fromMemoryMode');
          setCurrentMode('memory');
        }} />
      )}

      {currentMode === 'about_us' && (
        <AboutUs />
      )}

      {currentMode === 'fun_games' && (
        <GamePage />
      )}

      {currentMode === 'memory' && (
          <TimelineView 
            memories={memories} 
            onSelect={setSelectedMemory} 
            onOpenStories={(date) => {
              localStorage.setItem('selectedStoryDate', date);
              localStorage.setItem('fromMemoryMode', '1');
              setCurrentMode('morning_dusk');
            }}
          />
      )}

      {currentMode === 'view' && displayMemories.map((memory, index) => (
        <Bubble
          key={memory.id}
          memory={memory}
          onClick={(m, pos) => handleBubbleClick(m, pos)}
          containerSize={containerSize}
          targetPosition={isHeartMode ? getHeartPosition(index, displayMemories.length) : null}
        />
      ))}

      {/* Heart Mode Center Display */}
      <AnimatePresence>
        {isHeartMode && heartCenterMemory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.8, delay: 0.5, type: 'spring' }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              transform: 'none',
              width: containerSize.width ? `${containerSize.width}px` : '100vw',
              height: containerSize.height ? `${containerSize.height}px` : '100vh',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'auto'
            }}
          >
            {(() => {
              const content = renderPreview(heartCenterMemory);
              const isMedia = React.isValidElement(content) && (heartCenterMemory.type === 'image' || heartCenterMemory.type === 'video');

              // Compute Heart Path string for SVG
              const heartPathString = computeHeartPath();
              
              // Prepare content variants
              const baseProps = isMedia ? {
                autoPlay: heartCenterMemory.type === 'video' ? true : undefined,
                muted: heartCenterMemory.type === 'video' ? true : undefined,
                loop: heartCenterMemory.type === 'video' ? true : undefined,
                playsInline: heartCenterMemory.type === 'video' ? true : undefined,
                controls: false
              } : {};

              const renderContent = () => {
                if (!isMedia) return content;
                
                // Original content without any cropping (contain)
                // We use a drop-shadow or mask to give it the heart "feeling" without physical cropping
                return React.cloneElement(content, {
                  ...baseProps,
                  style: { 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain', 
                    display: 'block',
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
                  }
                });
              };

              return (
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  
                  {/* 1. Background Blur Fill (Masked to Heart Shape) */}
                  <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${containerSize.width || 100} ${containerSize.height || 100}`} preserveAspectRatio="none">
                      <defs>
                        <clipPath id="bgHeartClip" clipPathUnits="userSpaceOnUse">
                          <path d={heartPathString} />
                        </clipPath>
                      </defs>
                      <foreignObject x="0" y="0" width="100%" height="100%" clipPath="url(#bgHeartClip)">
                         <div style={{ width: '100%', height: '100%', background: '#000' }}>
                           {isMedia && React.cloneElement(content, {
                              ...baseProps,
                              style: { 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover', 
                                filter: 'blur(30px) brightness(0.6)',
                                transform: 'scale(1.2)'
                              }
                           })}
                         </div>
                      </foreignObject>
                    </svg>
                  </div>

                  {/* 2. Main Content (Floating above, NOT cropped, contained within heart bounds visually) */}
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    style={{ 
                      position: 'relative', 
                      zIndex: 1,
                      // Adjusted size to 55% of the minimum dimension to fit nicely inside the heart shape
                      // This ensures the photo is fully visible (contain) and the blurred background fills the gaps
                      width: containerSize.width && containerSize.height ? Math.min(containerSize.width, containerSize.height) * 0.55 : '50%',
                      height: containerSize.width && containerSize.height ? Math.min(containerSize.width, containerSize.height) * 0.55 : '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {renderContent()}
                  </motion.div>

                  {/* 3. Heart Outline Overlay (Floating on top) */}
                  <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${containerSize.width || 100} ${containerSize.height || 100}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                       <defs>
                        <linearGradient id="heartGradientOverlay" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ff9a9e" />
                          <stop offset="50%" stopColor="#fad0c4" />
                          <stop offset="100%" stopColor="#ffd1ff" />
                        </linearGradient>
                      </defs>
                      <motion.path
                        d={heartPathString}
                        fill="none"
                        stroke="url(#heartGradientOverlay)"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ strokeWidth: 2, opacity: 0.6 }}
                        animate={{ 
                          strokeWidth: [2, 4, 2],
                          opacity: [0.6, 1, 0.6],
                          filter: ["drop-shadow(0 0 2px rgba(255,105,180,0.3))", "drop-shadow(0 0 8px rgba(255,105,180,0.6))", "drop-shadow(0 0 2px rgba(255,105,180,0.3))"]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                      />
                    </svg>
                  </div>

                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

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
            <h3 style={{ marginBottom: '20px', color: '#333' }}>{getDisplayTitle(selectedMemory)}</h3>
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

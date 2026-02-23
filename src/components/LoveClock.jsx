import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoveClock = ({ onHourComplete }) => {
  const [displayMode, setDisplayMode] = useState(0); // 0: Time Duration (H:M:S), 1: Days, 2: YMD Duration, 3: Weeks
  const [currentTime, setCurrentTime] = useState(new Date());
  const [plusOnes, setPlusOnes] = useState([]);
  const prevMinuteRef = React.useRef(new Date().getMinutes());
  
  // Generate stable random colors for flowers
  const flowerColors = React.useMemo(() => {
    const palette = ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F8C8DC'];
    return Array.from({ length: 60 }, () => palette[Math.floor(Math.random() * palette.length)]);
  }, []);
  
  const startDate = new Date('2023-03-03T00:00:00');

  useEffect(() => {
    // Initial check for hour completion on mount/reload if minutes just rolled over?
    // Not strictly needed unless we want to catch missed events, but state is ephemeral.
    
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check for minute change
      const currentMinute = now.getMinutes();
      if (currentMinute !== prevMinuteRef.current) {
        // Trigger hour complete if minute wraps from 59 to 0
        if (prevMinuteRef.current === 59 && currentMinute === 0) {
          console.log('Hour complete triggered!');
          onHourComplete && onHourComplete();
        }
        prevMinuteRef.current = currentMinute;
      }

      if (now.getSeconds() === 0) {
        const id = Date.now();
        setPlusOnes(prev => [...prev, id]);
        
        // Auto-switch to Days mode (Mode 1) for 3 seconds if currently in Time mode (Mode 0)
        // Using functional update to access current displayMode if needed, 
        // but here we just check if we are conceptually in "default" viewing
        setDisplayMode(prev => {
          if (prev === 0) {
            setTimeout(() => {
              setDisplayMode(0);
            }, 3000);
            return 1; // Switch to Days
          }
          return prev;
        });

        // Remove animation after 2 seconds
        setTimeout(() => {
          setPlusOnes(prev => prev.filter(p => p !== id));
        }, 2000);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => {
    if (num >= 10000) {
      const val = (num / 10000).toFixed(1).replace('.0', '');
      return (
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ 
            fontSize: '0.4em', 
            position: 'absolute', 
            top: '-0.2em', 
            left: '-0.8em',
            fontWeight: '600'
          }}>w</span>
          <span style={{ visibility: 'hidden', fontSize: '0.4em', marginRight: '0.2em' }}>w</span>
          {val}
        </span>
      );
    }
    if (num >= 1000) {
      const val = (num / 1000).toFixed(1).replace('.0', '');
      return (
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ 
            fontSize: '0.4em', 
            position: 'absolute', 
            top: '-0.2em', 
            left: '-0.8em',
            fontWeight: '600'
          }}>k</span>
          <span style={{ visibility: 'hidden', fontSize: '0.4em', marginRight: '0.2em' }}>k</span>
          {val}
        </span>
      );
    }
    return num;
  };

  const getDisplayContent = () => {
    switch (displayMode) {
      case 0: // Time Duration (H:M:S) - NEW DEFAULT
        const diffMs = Math.abs(currentTime - startDate);
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        return { 
          main: (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span>{formatNumber(hours)}</span>
              <span style={{ fontSize: '0.5em', opacity: 0.7 }}>:</span>
              <span>{minutes.toString().padStart(2, '0')}</span>
              <span style={{ fontSize: '0.5em', opacity: 0.7 }}>:</span>
              <span>{seconds.toString().padStart(2, '0')}</span>
            </div>
          ),
          sub: 'SINCE 2023.03.03',
          color: '#83728D',
          fontSize: '56px'
        };
      case 1: // Total Days (Previous default)
        const diffTime = Math.abs(currentTime - startDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return { 
          main: `${diffDays}`, 
          sub: 'DAYS',
          color: '#FF6B9C' 
        };
      case 2: // Date Duration (Years, Months, Days)
        let years = currentTime.getFullYear() - startDate.getFullYear();
        let months = currentTime.getMonth() - startDate.getMonth();
        let days = currentTime.getDate() - startDate.getDate();
        
        if (days < 0) {
          months -= 1;
          const prevMonth = new Date(currentTime.getFullYear(), currentTime.getMonth(), 0);
          days += prevMonth.getDate();
        }
        if (months < 0) {
          years -= 1;
          months += 12;
        }

        const durationStr = `${years}Y ${months}M ${days}D`;
        
        return { 
          main: durationStr, 
          sub: 'SINCE 2023.03.03',
          color: '#46579D',
          fontSize: '48px' // Slightly smaller for long text
        };
      case 3: // Total Weeks
        const diffTimeWeeks = Math.abs(currentTime - startDate);
        const diffWeeks = Math.floor(diffTimeWeeks / (1000 * 60 * 60 * 24 * 7));
        return { 
          main: `${diffWeeks}`, 
          sub: 'WEEKS',
          color: '#35BC68'
        };
      default:
        return { main: 'ERROR', sub: 'Err' };
    }
  };

  const content = getDisplayContent();

  // Helper to get flower position based on minute (0-59)
  const getFlowerPosition = (index) => {
    // Clock dimensions: 400x300 (Width x Height)
    // To distribute 60 flowers evenly along the perimeter:
    // We want 15 flowers on each of the 4 "sides" (Top, Right, Bottom, Left)?
    // Or strictly proportional to perimeter length?
    // User requested "evenly distributed 15 per side" -> "每边均匀分布15个".
    // 60 flowers / 4 sides = 15 per side.
    // 0-14: Top
    // 15-29: Right
    // 30-44: Bottom
    // 45-59: Left
    
    // Adjust indices to start from Top-Center?
    // User usually expects clock-like behavior, 0 at top.
    // Let's assume:
    // 0-7: Top Right half
    // 8-22: Right Side
    // 23-37: Bottom Side
    // 38-52: Left Side
    // 53-59: Top Left half
    // But user said "15 per side".
    // Let's map 0-14 to Top, 15-29 to Right, etc. for simplicity of "per side" logic,
    // but visually 0 should probably be at Top-Center?
    // Or 0 at Top-Right corner?
    // Let's stick to "Clockwise starting from Top Center" logic but enforce even distribution counts.
    // But rectangle isn't a square. 400 vs 300.
    // If we force 15 per side, spacing will be different on X vs Y.
    // X side (400px) has 15 items -> gap ~26px
    // Y side (300px) has 15 items -> gap ~20px
    // This satisfies "15 per side".

    // Let's define the 4 sides:
    // Top: index 0-14. From Left(ish) to Right(ish)? Or Center to Right then...
    // Let's align with clock minutes:
    // Minute 0 is Top Center.
    // Minute 15 is Right Middle.
    // Minute 30 is Bottom Center.
    // Minute 45 is Left Middle.
    
    // To achieve strict "15 per side" (which implies corners are transitions):
    // Let's define ranges relative to corners.
    // Top Side: (-Width/2, -Height/2) to (Width/2, -Height/2)
    // But for 60 minutes, mapping to rectangle perimeter:
    // Top Edge: minutes 53 to 7 (15 minutes centered at 0)
    // Right Edge: minutes 8 to 22 (15 minutes centered at 15)
    // Bottom Edge: minutes 23 to 37 (15 minutes centered at 30)
    // Left Edge: minutes 38 to 52 (15 minutes centered at 45)
    
    // Wait, 60 / 4 = 15.
    // 0 is Top Center.
    // Range for Top: roughly -7.5 to +7.5 minutes around 0.
    // Let's make it strict indices:
    // Top: 53,54,55,56,57,58,59, 0, 1,2,3,4,5,6,7 (15 ticks)
    // Right: 8 to 22 (15 ticks)
    // Bottom: 23 to 37 (15 ticks)
    // Left: 38 to 52 (15 ticks)

    const w = 400;
    const h = 300;
    const padding = 10; // Inset from edge
    
    // Coordinates relative to Top-Left (0,0) of the container
    // Top Left Corner: (0,0), Top Right: (400,0), etc.
    // Center: (200, 150)
    
    // Top Edge (y=padding): x goes from Left to Right
    // But wait, 0 is Top Center (200, padding).
    // Indices 0-7 go Right. Indices 53-59 go Left from center?
    // Let's simplify linear interpolation on edges.

    // Normalized Index for calculation:
    // We want a continuous path: TopCenter -> TopRight -> RightBottom -> BottomLeft -> LeftTop -> TopCenter
    
    let sideIndex, t, x, y, rotate;

    // Right Side (Minutes 8 to 22) -> 15 items
    if (index >= 8 && index <= 22) {
        sideIndex = index - 8;
        t = sideIndex / 14; // 0 to 1
        // From Top-Right (w-p, p) to Bottom-Right (w-p, h-p)
        // Actually, let's include corners in the "side" range logic more gracefully.
        // Let's say Minute 7.5 is exactly Top-Right Corner.
        // Minute 22.5 is Bottom-Right Corner.
        // Minute 37.5 is Bottom-Left Corner.
        // Minute 52.5 is Top-Left Corner.
        
        // Let's use exact segments.
        // Segment 1: Top Half-Right (Minute 0 to 7.5)
        // Segment 2: Right Side (Minute 7.5 to 22.5)
        // Segment 3: Bottom Side (Minute 22.5 to 37.5)
        // Segment 4: Left Side (Minute 37.5 to 52.5)
        // Segment 5: Top Half-Left (Minute 52.5 to 60)
        
        // Wait, user said "15 per side".
        // Let's force strict 15 counts per cardinal direction.
        // Top: 53-7 (15 items)
        // Right: 8-22 (15 items)
        // Bottom: 23-37 (15 items)
        // Left: 38-52 (15 items)
        
        // We need to map these to positions.
        
    }
    
    // Re-evaluating based on "Clockwise from Top" standard
    
    // Top Side (Minutes 53-59 and 0-7) -> x varies, y = fixed top
    // Range: x from padding to w-padding.
    // Center is 200.
    // 0 is at 200. 
    // 7 is at (approx) 400.
    // 53 is at (approx) 0.
    // Let's linear interpolate.
    
    if (index >= 53 || index <= 7) {
        // Top Side
        // Normalize index to -7 to +7 range (centered at 0)
        let normalizedIdx = index <= 7 ? index : (index - 60);
        // Map -7.5 to +7.5 to width range? 
        // Or simply map indices.
        // -7 (index 53) -> Leftish
        // +7 (index 7) -> Rightish
        // Total 15 steps.
        // Let's say range is from x=padding+cornerOffset to w-padding-cornerOffset?
        // Let's just use full width minus padding.
        // x goes from 20 (Left) to 380 (Right).
        // normalizedIdx -7.5 -> 20
        // normalizedIdx +7.5 -> 380
        // t = (normalizedIdx + 7.5) / 15
        
        const offset = 7.5;
        const steps = 15;
        const startX = 20;
        const endX = 380;
        
        let val = normalizedIdx; 
        // Need to handle the half-step offset to center them?
        // Let's distribute 15 items evenly.
        // Item -7, -6, ... 0 ... 6, 7.
        // Fraction = (val - (-7)) / (7 - (-7)) = (val + 7) / 14 ?
        // If we want them to span the full width:
        // t = (val + 7.5) / 15? No, that's range.
        // Let's just place them evenly.
        // Center (0) is at 200.
        // Step size = (380 - 20) / 14 = 360 / 14 ≈ 25.7px
        // x = 200 + val * 25.7
        
        x = 200 + val * (360/14);
        y = 10;
        rotate = 0;
    } 
    else if (index >= 8 && index <= 22) {
        // Right Side
        // Center is 15 (Middle Right).
        // Range 8 to 22. 15 is center.
        // y goes from Top to Bottom.
        // 8 is Top-ish. 22 is Bottom-ish.
        // normalized: index - 15. Range -7 to +7.
        // y centered at 150.
        // y range: 20 to 280.
        
        let val = index - 15;
        y = 150 + val * (260/14);
        x = 390;
        rotate = 90;
    }
    else if (index >= 23 && index <= 37) {
        // Bottom Side
        // Center is 30.
        // Range 23 to 37.
        // x goes from Right to Left (Clockwise).
        // 30 is Center (200).
        // 23 is Right-ish. 37 is Left-ish.
        // normalized: index - 30.
        // if index increases, we move Left? 
        // Yes, 30->31 moves left.
        // val = index - 30.
        // x = 200 - val * step
        
        let val = index - 30;
        x = 200 - val * (360/14);
        y = 290;
        rotate = 180;
    }
    else { // 38 to 52
        // Left Side
        // Center is 45.
        // Range 38 to 52.
        // y goes from Bottom to Top.
        // 45 is Center (150).
        // 38 is Bottom-ish. 52 is Top-ish.
        // val = index - 45.
        // y = 150 - val * step
        
        let val = index - 45;
        y = 150 - val * (260/14);
        x = 10;
        rotate = 270;
    }

    return { x, y, rotate };
  };

  const BearIcon = () => (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
      {/* Ears */}
      <circle cx="25" cy="30" r="12" fill="#D4A373" />
      <circle cx="75" cy="30" r="12" fill="#D4A373" />
      <circle cx="25" cy="30" r="6" fill="#FFE5D9" />
      <circle cx="75" cy="30" r="6" fill="#FFE5D9" />
      
      {/* Head */}
      <circle cx="50" cy="55" r="35" fill="#D4A373" />
      
      {/* Snout */}
      <ellipse cx="50" cy="65" rx="14" ry="10" fill="#FFE5D9" />
      <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#4A3B32" />
      
      {/* Eyes */}
      <circle cx="40" cy="50" r="3" fill="#4A3B32" />
      <circle cx="60" cy="50" r="3" fill="#4A3B32" />
      
      {/* Blush */}
      <circle cx="32" cy="62" r="4" fill="#FFB5B5" opacity="0.6" />
      <circle cx="68" cy="62" r="4" fill="#FFB5B5" opacity="0.6" />
    </svg>
  );

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{
        position: 'absolute',
        top: '130px',
        right: '24px',
        width: '400px',
        height: '300px',
        background: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1), inset 0 0 0 2px rgba(255,255,255,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        textAlign: 'center'
      }}
      onClick={() => setDisplayMode((prev) => (prev + 1) % 4)}
    >
      {/* Minute Flowers */}
      {Array.from({ length: 60 }).map((_, i) => {
        // Only show flowers up to current minute
        if (i >= currentTime.getMinutes()) return null;

        const pos = getFlowerPosition(i);
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              transform: 'translate(-50%, -50%)',
              fontSize: '12px',
              color: flowerColors[i],
              zIndex: 5,
              pointerEvents: 'none'
            }}
          >
            ✿
          </motion.div>
        );
      })}

      {/* Title */}
      <motion.div 
        style={{ 
          fontSize: '14px', 
          fontWeight: '700', 
          letterSpacing: '2px', 
          color: '#666',
          marginBottom: '10px',
          fontFamily: 'Verdana, sans-serif'
        }}
      >
        WE HAVE BEEN TOGETHER
      </motion.div>

      {/* Bear Decoration */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ marginBottom: '5px' }}
      >
        <BearIcon />
      </motion.div>

      {/* +1 Floating Animation - Moved outside AnimatePresence */}
      {plusOnes.map(id => (
        <motion.div
          key={id}
          initial={{ opacity: 1, y: 0, x: 140, scale: 0.5 }}
          animate={{ opacity: 0, y: -60, scale: 1.5 }}
          transition={{ duration: 2, ease: "easeOut" }}
          style={{
            position: 'absolute',
            top: '40%',
            right: '50%',
            fontSize: '32px',
            fontWeight: '800',
            color: '#FF6B9C',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          +1
        </motion.div>
      ))}

      {/* Dynamic Content */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={displayMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            height: '100px',
            justifyContent: 'center',
            position: 'relative',
            width: '100%'
          }}
        >
          <div style={{ 
            fontSize: content.fontSize || '72px', 
            fontWeight: '800', 
            color: content.color,
            lineHeight: 1,
            textShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {content.main}
          </div>

          <div style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#888',
            marginTop: '8px',
            letterSpacing: '1px'
          }}>
            {content.sub}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Signature */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        right: '25px',
        fontSize: '12px',
        fontFamily: "'Brush Script MT', cursive",
        color: 'rgba(0,0,0,0.3)',
        transform: 'rotate(-5deg)'
      }}>
        LkbHua%ZengQ
      </div>
    </motion.div>
  );
};

export default LoveClock;

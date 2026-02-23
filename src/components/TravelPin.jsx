import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, MoreHorizontal, Flower, Utensils, PawPrint } from 'lucide-react';

const TravelPin = (props) => {
  const { onNavigate } = props;
  const [pins, setPins] = useState([]);
  const [activePhotoIndices, setActivePhotoIndices] = useState({});
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 240, height: 600 });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    // Fetch pin data
    const fetchPins = () => {
      fetch('/api/travel-pins')
        .then(res => res.json())
        .then(data => {
          // Apply local storage order and visibility
          const savedOrder = localStorage.getItem('cityOrder');
          const savedVisibility = localStorage.getItem('cityVisibility');
          
          let sortedData = [...data];

          if (savedOrder) {
            const orderMap = JSON.parse(savedOrder);
            sortedData.sort((a, b) => {
              const indexA = orderMap.indexOf(a.cityEN);
              const indexB = orderMap.indexOf(b.cityEN);
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
            });
          }

          if (savedVisibility) {
            const visibilityMap = JSON.parse(savedVisibility);
            sortedData = sortedData.filter(city => visibilityMap[city.cityEN] !== false);
          }
          
          // Only take top 4 after filtering
          sortedData = sortedData.slice(0, 4);

          setPins(sortedData);
          
          // Initialize photo indices
          const indices = {};
          sortedData.forEach((pin, index) => {
            indices[index] = 0;
          });
          setActivePhotoIndices(indices);
        })
        .catch(err => console.error('Failed to load travel pins:', err));
    };

    fetchPins();

    // Listen for order updates
    const handleOrderUpdate = () => {
      fetchPins();
    };
    window.addEventListener('cityOrderUpdated', handleOrderUpdate);

    // Update dimensions on resize
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
        setWindowWidth(window.innerWidth);
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('cityOrderUpdated', handleOrderUpdate);
    };
  }, []);

  const switchPhoto = (index, pin) => {
    if (!pin.photos || pin.photos.length <= 1) return;
    
    setActivePhotoIndices(prev => {
      let nextIndex = Math.floor(Math.random() * pin.photos.length);
      // Ensure we pick a different photo if possible
      if (nextIndex === prev[index] && pin.photos.length > 1) {
        nextIndex = (nextIndex + 1) % pin.photos.length;
      }
      return { ...prev, [index]: nextIndex };
    });
  };

  const navigateToAlbum = (city) => {
    if (onNavigate) {
      onNavigate(city);
    }
  };

  // Generate SVG Path for curved road
  // Simple S-curve or multi-curve down the center
  const getRoadStart = () => {
    // Right Edge X relative to TravelPin
    const rightEdgeX = windowWidth - 1068;
    // Adjusted 50px higher as requested (-30px)
    const startY = -30;
    return { x: rightEdgeX, y: startY };
  };

  const generateRoadPath = () => {
    const w = dimensions.width;
    const h = dimensions.height;
    
    const { x: rightEdgeX, y: startY } = getRoadStart();
    
    // Calculate the turn point:
    // Clock width is approx 400px + margins.
    // User wants to start curving after passing the Clock width (400px) + extra distance (150px).
    // The path starts at rightEdgeX.
    // So the turn point should be around rightEdgeX - 550.
    const turnX = rightEdgeX - 550;

    // We want a nice wavy path from top to bottom
    // Start at Right Edge -> Pass through Bear Position -> P0(w/2, 20) -> P_end(w/2, h-20)
    // Control points to create S-shapes
    
    // Path segments:
    // 1. Start from Right Edge (near top of Clock)
    // 2. Curve slightly ruggedly towards TravelPin
    // 3. Connect to TravelPin Top center (smooth)
    // 4. TravelPin list S-curve

    const d = [
      `M ${rightEdgeX},${startY}`, // Start at Right Edge, lower position
      
      // Part 1: Horizontal-ish path over the Clock area
      // Ends at turnX with a slight downward curve for natural feel
      // Adjusted control point for longer span
      `Q ${rightEdgeX - 250},${startY + 8} ${turnX},${startY}`,
      
      // Part 2: Smooth connection from Turn Point to Center Top
      // From turnX to w/2.
      // Control points ensure smooth transition from horizontal(ish) to vertical(ish)
      // Adjusted control points for new turn position
      `C ${turnX - 80},${startY} ${w/2 + 60},${-10} ${w/2},${20}`,
      
      // 4 Bends (Left -> Right -> Left -> Right)
      // Bend 1 (Left): Ends at 25%
      `C ${w/2 - 120},${30} ${w/2 - 120},${h * 0.15} ${w/2},${h * 0.25}`, 
      
      // Bend 2 (Right): Ends at 50%
      `C ${w/2 + 120},${h * 0.35} ${w/2 + 120},${h * 0.40} ${w/2},${h * 0.50}`, 
      
      // Bend 3 (Left): Ends at 75%
      `C ${w/2 - 120},${h * 0.60} ${w/2 - 120},${h * 0.65} ${w/2},${h * 0.75}`,

      // Bend 4 (Right): Ends at 100% (Bottom)
      `C ${w/2 + 120},${h * 0.85} ${w/2 + 120},${h * 0.90} ${w/2},${h - 20}`
    ].join(' ');
    
    return d;
  };

  // Decoration positions (static based on index)
  const getDecoration = (index) => {
    const types = ['tree', 'flower', 'lake', 'kite', 'train', 'bike', 'car'];
    const type = types[index % types.length];
    // Position: alternate left/right of the curve
    const isLeft = index % 2 === 0; 
    // Randomize slightly
    const x = isLeft ? 20 + (index * 5) % 20 : dimensions.width - 40 - (index * 5) % 20;
    const y = (index + 0.5) * (dimensions.height / 8); // Distribute along height
    
    return { type, x, y };
  };

  // Helper to render emoji icon
  const renderEmojiIcon = (type, variant) => {
    // variant 1-5
    const size = 16;
    switch (type) {
      case 'flower': return <Flower size={size} color="#FF69B4" />;
      case 'food': return <Utensils size={size} color="#FFA500" />;
      case 'animal': return <PawPrint size={size} color="#8B4513" />;
      default: return <Flower size={size} color="#FF69B4" />;
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute', // Positioned by parent
        top: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Allow clicks to pass through empty areas
        overflow: 'visible'
      }}
    >
      {/* Road SVG */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible' }}>
        {/* Road Stroke */}
        <path 
          d={generateRoadPath()} 
          fill="none" 
          stroke="#FFF" 
          strokeWidth="16" 
          strokeLinecap="round"
          strokeDasharray="15, 10" // Longer dash
          opacity="0.7"
        />

        {/* Couple Bears on Bike */}
        {(() => {
          const { x: rightEdgeX, y: startY } = getRoadStart();
          // Position them a bit to the left of the start point
          const bearX = rightEdgeX - 60;
          const bearY = startY - 45; 
          
          return (
            <g transform={`translate(${bearX}, ${bearY}) scale(0.6)`}>
              {/* Bike Frame & Wheels */}
              <circle cx="20" cy="50" r="14" stroke="#555" strokeWidth="2.5" fill="none" /> {/* Front Wheel */}
              <circle cx="80" cy="50" r="14" stroke="#555" strokeWidth="2.5" fill="none" /> {/* Rear Wheel */}
              <path d="M 20 50 L 40 25 L 70 25 L 80 50" stroke="#777" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" /> {/* Frame */}
              <path d="M 40 25 L 35 10" stroke="#777" strokeWidth="3" strokeLinecap="round" /> {/* Handlebar stem */}
              <path d="M 28 10 L 42 10" stroke="#555" strokeWidth="3" strokeLinecap="round" /> {/* Handlebar */}
              <circle cx="40" cy="50" r="6" fill="none" stroke="#777" strokeWidth="2" /> {/* Pedals area */}

              {/* Bear 1 (Front - Driver, Brown) */}
              <g transform="translate(30, -5)">
                <circle cx="15" cy="15" r="13" fill="#D7CCC8" /> {/* Head */}
                <circle cx="6" cy="6" r="4.5" fill="#D7CCC8" />  {/* L Ear */}
                <circle cx="24" cy="6" r="4.5" fill="#D7CCC8" />  {/* R Ear */}
                <circle cx="11" cy="12" r="1.5" fill="#333" /> {/* L Eye */}
                <circle cx="19" cy="12" r="1.5" fill="#333" /> {/* R Eye */}
                <ellipse cx="15" cy="18" rx="5" ry="4" fill="#FFE0B2" /> {/* Muzzle */}
                <circle cx="15" cy="17" r="1.5" fill="#5D4037" /> {/* Nose */}
                {/* Body/Arms reaching for handle */}
                <path d="M 15 28 C 5 35 0 45 10 45" stroke="#D7CCC8" strokeWidth="8" fill="none" strokeLinecap="round" />
                <path d="M 5 35 L -2 15" stroke="#D7CCC8" strokeWidth="4" fill="none" strokeLinecap="round" /> {/* Arm */}
              </g>

              {/* Bear 2 (Back - Passenger, Pinkish) */}
              <g transform="translate(60, -5)">
                <circle cx="15" cy="15" r="12" fill="#F8BBD0" /> {/* Head */}
                <circle cx="6" cy="6" r="4" fill="#F8BBD0" />  {/* L Ear */}
                <circle cx="24" cy="6" r="4" fill="#F8BBD0" />  {/* R Ear */}
                <circle cx="11" cy="12" r="1.5" fill="#333" /> {/* L Eye */}
                <circle cx="19" cy="12" r="1.5" fill="#333" /> {/* R Eye */}
                <ellipse cx="15" cy="18" rx="4.5" ry="3.5" fill="#FFE0B2" /> {/* Muzzle */}
                <circle cx="15" cy="17" r="1.5" fill="#5D4037" /> {/* Nose */}
                 {/* Body holding on */}
                <path d="M 15 27 C 10 35 15 45 20 45" stroke="#F8BBD0" strokeWidth="7" fill="none" strokeLinecap="round" />
                <path d="M 10 35 L 0 30" stroke="#F8BBD0" strokeWidth="4" fill="none" strokeLinecap="round" /> {/* Arm holding front bear */}
              </g>

              {/* Motion/Wind Lines */}
              <path d="M 95 40 L 110 40" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <path d="M 100 48 L 115 48" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </g>
          );
        })()}
        
        {/* Decorations */}
        {Array.from({ length: 8 }).map((_, index) => { // Generate more decorations
          const dec = getDecoration(index);
          return (
            <g key={`dec-${index}`} transform={`translate(${dec.x}, ${dec.y})`}>
              {dec.type === 'tree' && <text fontSize="24">🌳</text>}
              {dec.type === 'flower' && <text fontSize="24">🌸</text>}
              {dec.type === 'lake' && <text fontSize="24">💧</text>}
              {dec.type === 'kite' && <text fontSize="24">🪁</text>}
              {dec.type === 'train' && <text fontSize="24">🚂</text>}
              {dec.type === 'bike' && <text fontSize="24">🚲</text>}
              {dec.type === 'car' && <text fontSize="24">🚗</text>}
            </g>
          );
        })}
      </svg>



      {/* Pin Cards */}
      {pins.map((pin, index) => {
        // Calculate position based on segment
        // We have 4 pins and 4 bends.
        // Bend 1 (Left, 0-25%): Pin at ~12.5%
        // Bend 2 (Right, 25-50%): Pin at ~37.5%
        // Bend 3 (Left, 50-75%): Pin at ~62.5%
        // Bend 4 (Right, 75-100%): Pin at ~87.5%
        
        // Calculate dynamic spacing
        const segmentSize = 1.0 / Math.max(pins.length, 4); 
        const topPercent = (index + 0.5) * segmentSize; // Center of each segment
        
        // Approx X positions based on the curve logic
        // Bends: Left -> Right -> Left -> Right
        // Odd indices (0, 2) are on Left Bends -> Card Right
        // Even indices (1, 3) are on Right Bends -> Card Left
        // Wait, index 0 is first bend (Left) -> Card should be Right to be inside curve? Or outside?
        // User requested previously: opposite side.
        // Let's stick to "inside" or "balanced".
        // Bend Left (Convex Left) -> Card on Right looks balanced.
        // Bend Right (Convex Right) -> Card on Left looks balanced.
        
        // Index 0 (Bend 1 Left): Card Right
        // Index 1 (Bend 2 Right): Card Left
        // Index 2 (Bend 3 Left): Card Right
        // Index 3 (Bend 4 Right): Card Left
        
        const isRight = index % 2 === 0; 
        const cardX = isRight ? '70%' : '-10%';
        const cardY = `calc(${topPercent * 100}% - 60px)`; // Shift up 60px (was 55px)
        
        const currentPhoto = pin.photos && pin.photos.length > 0 
          ? pin.photos[activePhotoIndices[index] || 0] 
          : null;

        return (
          <div
            key={pin.cityEN}
            style={{
              position: 'absolute',
              top: cardY,
              left: cardX,
              pointerEvents: 'auto', // Re-enable clicks
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '8px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '110px', // Slightly wider
              backdropFilter: 'blur(4px)',
              zIndex: 10
            }}
          >
            {/* Pin Icon */}
            <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', color: '#FF6B9C' }}>
              <MapPin size={20} fill="#FF6B9C" color="#FFF" />
            </div>

            {/* Photo */}
            <motion.div
              key={currentPhoto} // Trigger animation on change
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                overflow: 'hidden',
                marginTop: '6px',
                cursor: 'pointer',
                border: '2px solid #FFF',
                background: '#eee'
              }}
              onClick={() => switchPhoto(index, pin)}
            >
              {currentPhoto ? (
                <img src={currentPhoto} alt={pin.cityEN} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999' }}>No IMG</div>
              )}
            </motion.div>

            {/* City Name */}
            <div style={{ 
              fontFamily: '"Kaushan Script", cursive', 
              fontSize: '16px', 
              fontWeight: 'bold', 
              color: '#333',
              marginTop: '4px' 
            }}>
              {pin.cityCN}
            </div>

            {/* Date */}
            <div style={{ fontSize: '10px', color: '#666' }}>
              {pin.arrivedAt}
            </div>

            {/* Emoji & More */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              width: '100%', 
              marginTop: '4px',
              alignItems: 'center',
              padding: '0 4px'
            }}>
              <div>{renderEmojiIcon(pin.emojiType, pin.emojiVariant)}</div>
              <div 
                style={{ cursor: 'pointer', color: '#888' }}
                onClick={() => navigateToAlbum(pin.cityEN)}
              >
                <MoreHorizontal size={16} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TravelPin;
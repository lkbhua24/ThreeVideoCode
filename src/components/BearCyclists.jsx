import React from 'react';
import { motion } from 'framer-motion';

const BearCyclists = ({ heartGroups = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
      style={{
        position: 'absolute',
        top: '20px', // In the empty space above the clock (clock is at 130px)
        right: '40px', // Aligned roughly with clock right side
        width: '300px',
        height: '100px',
        zIndex: 5,
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}
    >
      <svg width="300" height="100" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>


        {/* Road Line - Removed as per request */}


        {/* Group for Male Bear (Front/Left - leading the way) */}
        <g transform="translate(40, 10)">
          {/* Bike */}
          <circle cx="20" cy="70" r="12" stroke="#666" strokeWidth="1.5" fill="none" />
          <circle cx="60" cy="70" r="12" stroke="#666" strokeWidth="1.5" fill="none" />
          <path d="M 20 70 L 35 45 L 55 45 L 60 70 M 35 45 L 35 65" stroke="#666" strokeWidth="1.5" fill="none" />
          
          {/* Bear */}
          {/* Body */}
          <path d="M 35 45 Q 25 30 40 25 Q 55 30 50 45" fill="none" stroke="#8D6E63" strokeWidth="2" />
          {/* Head */}
          <circle cx="40" cy="20" r="10" fill="white" stroke="#8D6E63" strokeWidth="2" />
          {/* Ears */}
          <circle cx="33" cy="13" r="3" fill="white" stroke="#8D6E63" strokeWidth="2" />
          <circle cx="47" cy="13" r="3" fill="white" stroke="#8D6E63" strokeWidth="2" />
          {/* Face */}
          <circle cx="38" cy="18" r="1" fill="#333" />
          <circle cx="42" cy="18" r="1" fill="#333" />
          <ellipse cx="40" cy="22" rx="3" ry="2" fill="#FFE5D9" />
          
          {/* Hat (Male indicator) */}
          <path d="M 35 12 L 45 12 L 40 5 Z" fill="#A2D2FF" stroke="#8D6E63" strokeWidth="1" />
          
          {/* Arm */}
          <path d="M 40 35 L 55 40" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />

          {/* Minute Hearts (Groups of 4) */}
          {Array.from({ length: heartGroups }).map((_, i) => {
            const groupIdx = Math.floor(i / 4);
            const heartIdx = i % 4;
            
            // Size decreases within a group: 3, 2.5, 2, 1.5
            const size = 3 - heartIdx * 0.5; 
            
            // Adjust start position to be slightly right of mouth
            const startX = 60; 
            const startY = 55; // Slightly higher than mouth center
            
            // Group gap logic:
            // 4 hearts per group.
            // Gap between groups should be larger than gap between hearts.
            const gapBetweenHearts = 8;
            const gapBetweenGroups = 20;
            
            // Calculate linear distance from start
            const totalDist = (groupIdx * (4 * gapBetweenHearts + gapBetweenGroups)) + (heartIdx * gapBetweenHearts);
            
            // 45 degrees: x increase, y decrease (up)
            // Direction: Up-Right (flying away)
            const x = startX + totalDist * 0.707;
            const y = startY - totalDist * 0.707;
            
            // Colors logic:
            const colors = ['#FF6B9C', '#FF9AA2', '#FFB7B2', '#FFDAC1']; // Darker to Lighter
            
            return (
              <motion.text
                key={i}
                x={x}
                y={y}
                fontSize={size}
                fill={colors[heartIdx]}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{ opacity: 0.8, originX: "50%", originY: "50%" }}
              >
                ❤
              </motion.text>
            );
          })}
        </g>

        {/* Group for Female Bear (Back/Right - following) */}
        <g transform="translate(130, 10)">
           {/* Bike */}
           <circle cx="20" cy="70" r="12" stroke="#666" strokeWidth="1.5" fill="none" />
          <circle cx="60" cy="70" r="12" stroke="#666" strokeWidth="1.5" fill="none" />
          <path d="M 20 70 L 35 45 L 55 45 L 60 70 M 35 45 L 35 65" stroke="#666" strokeWidth="1.5" fill="none" />
          
          {/* Bear */}
          {/* Body */}
          <path d="M 35 45 Q 25 30 40 25 Q 55 30 50 45" fill="none" stroke="#8D6E63" strokeWidth="2" />
          {/* Head */}
          <circle cx="40" cy="20" r="9" fill="white" stroke="#8D6E63" strokeWidth="2" />
          {/* Ears */}
          <circle cx="34" cy="13" r="3" fill="white" stroke="#8D6E63" strokeWidth="2" />
          <circle cx="46" cy="13" r="3" fill="white" stroke="#8D6E63" strokeWidth="2" />
          {/* Face */}
          <circle cx="38" cy="18" r="1" fill="#333" />
          <circle cx="42" cy="18" r="1" fill="#333" />
          <ellipse cx="40" cy="22" rx="3" ry="2" fill="#FFE5D9" />
          
          {/* Bow (Female indicator) */}
          <path d="M 45 11 L 48 8 L 51 11 M 48 11 L 48 14" stroke="#FFB7B2" strokeWidth="1.5" />
          
           {/* Arm */}
           <path d="M 40 35 L 55 40" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Connecting Heart Trail */}
        <path
          d="M 90 30 Q 110 20 130 30"
          stroke="#FFB7B2"
          strokeWidth="1"
          strokeDasharray="3 3"
          fill="none"
          opacity="0.6"
        />
        <text x="105" y="20" fontSize="10" fill="#FF6B9C" opacity="0.8">❤</text>

        {/* Motion Lines */}
        <path d="M 180 70 L 200 70" stroke="#ccc" strokeWidth="1" opacity="0.6" />
        <path d="M 90 70 L 110 70" stroke="#ccc" strokeWidth="1" opacity="0.6" />
      </svg>
    </motion.div>
  );
};

export default BearCyclists;

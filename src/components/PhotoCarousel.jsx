import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const PhotoCarousel = () => {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPhotos = () => {
    setIsLoading(true);
    fetch('/api/selected-photos')
      .then(res => {
        if (!res.ok) {
           throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Limit to max 8 photos as requested
          setPhotos(data.slice(0, 8));
          setCurrentIndex(0);
        }
      })
      .catch(err => console.error('Failed to load photos:', err))
      .finally(() => {
        setTimeout(() => setIsLoading(false), 500);
      });
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    if (photos.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [photos.length, isHovered]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <>
      {/* Refresh Button */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
        whileTap={{ scale: 0.95 }}
        onClick={fetchPhotos}
        disabled={isLoading}
        style={{
          position: 'absolute',
          top: '90px', // Positioned in the gap between menu and carousel
          left: '24px',
          zIndex: 20,
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          borderRadius: '20px',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#555',
          fontWeight: '600',
          cursor: 'pointer',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          outline: 'none'
        }}
      >
        <motion.div
          animate={{ rotate: isLoading ? 360 : 0 }}
          transition={{ repeat: isLoading ? Infinity : 0, duration: 1, ease: "linear" }}
        >
          <RefreshCw size={16} />
        </motion.div>
        <span>探索</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          top: '130px', // Below menu (moved down 10px)
          left: '24px',
          width: '950px',
          bottom: '120px', // Extend to bottom, leaving space for footer
          borderRadius: '30px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}
      >
      {photos.length > 0 ? (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Blurred Background Layer */}
              <img
                src={photos[currentIndex].url}
                alt=""
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'blur(20px) brightness(0.7)',
                  transform: 'scale(1.1)', // Prevent blur edges
                  zIndex: 0
                }}
              />
              
              {/* Main Image Layer (Safe Display) */}
              <motion.img
                src={photos[currentIndex].url}
                alt="Featured"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8 }}
                style={{
                  position: 'relative',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  zIndex: 1,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows (visible on hover) */}
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '20px',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}
            onClick={prevSlide}
          >
            ‹
          </motion.div>
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0 }}
            style={{
              position: 'absolute',
              top: '50%',
              right: '20px',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)'
            }}
            onClick={nextSlide}
          >
            ›
          </motion.div>

          {/* Dots Indicator */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            background: 'rgba(0,0,0,0.2)',
            padding: '6px 12px',
            borderRadius: '20px',
            backdropFilter: 'blur(4px)'
          }}>
            {photos.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: idx === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'background 0.3s'
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '1.2rem',
          letterSpacing: '1px'
        }}>
          Waiting for moments...
        </div>
      )}
    </motion.div>
    </>
  );
};

export default PhotoCarousel;

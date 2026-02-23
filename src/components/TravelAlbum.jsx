import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TravelAlbumOverview from './TravelAlbumOverview';

const TravelAlbum = ({ city, onBack }) => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // 'overview' or 'city'
  // If city prop is provided (from TravelPin), default to 'city'
  // If no city prop (from Menu), default to 'overview'
  const [mode, setMode] = useState(city ? 'city' : 'overview');
  const [currentCity, setCurrentCity] = useState(city);

  useEffect(() => {
    if (city) {
      setCurrentCity(city);
      setMode('city');
    } else {
      setMode('overview');
    }
  }, [city]);

  useEffect(() => {
    if (mode !== 'city' || !currentCity) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/city-media/${encodeURIComponent(currentCity)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.items) {
          setItems(data.items);
        } else {
          setItems([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [currentCity, mode, lastUpdate]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/media-status')
        .then(res => res.json())
        .then(data => {
          if (data.lastMediaUpdate > lastUpdate) {
            setLastUpdate(data.lastMediaUpdate);
          }
        })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  const handleSelectCity = (selectedCityEN) => {
    setCurrentCity(selectedCityEN);
    setMode('city');
  };

  const handleBack = () => {
    if (mode === 'city') {
      // If we are in city view, always go back to overview
      setMode('overview');
    } else {
      // Otherwise (in overview), close the whole thing
      onBack();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 50,
        background: 'linear-gradient(135deg, #76B0EA 0%, #B3E5FC 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Back/Close Button */}
      <button
        onClick={handleBack}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.35)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          color: '#fff',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 100,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {mode === 'city' ? '‹' : '×'}
      </button>

      {/* Decorative Accents */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6], x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '10%', left: '15%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, #D1C4E9 0%, rgba(209, 196, 233, 0) 70%)', filter: 'blur(40px)', zIndex: 1 }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5], x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ position: 'absolute', bottom: '20%', right: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, #F8BBD0 0%, rgba(248, 187, 208, 0) 70%)', filter: 'blur(50px)', zIndex: 1 }}
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ position: 'absolute', top: '40%', left: '60%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, #FFF9C4 0%, rgba(255, 249, 196, 0) 70%)', filter: 'blur(30px)', zIndex: 1 }}
      />

      {/* Content Container */}
      <div style={{ zIndex: 10, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {mode === 'overview' ? (
          <TravelAlbumOverview onSelectCity={handleSelectCity} onClose={onBack} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '40px' }}>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', marginBottom: '30px', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
            >
              <h1 style={{ fontSize: '3rem', fontWeight: '400', letterSpacing: '2px', margin: 0 }}>
                {currentCity ? `${currentCity}` : 'Travel Album'}
              </h1>
              <p style={{ fontSize: '1.2rem', opacity: 1, fontWeight: '500', marginTop: '10px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                {loading ? 'Loading memories...' : `${items.length} moments captured`}
              </p>
            </motion.div>

            {/* Photo Grid */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '20px', 
              padding: '20px',
              paddingBottom: '60px'
            }}>
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, zIndex: 10 }}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    aspectRatio: '1', // Square tiles
                    background: 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {item.type === 'image' ? (
                    <img src={item.url} alt={`${currentCity} ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <video src={item.url} controls muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.9)',
              zIndex: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px'
            }}
          >
            {selectedItem.type === 'image' ? (
              <motion.img
                src={selectedItem.url}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px', boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}
              />
            ) : (
              <motion.video
                src={selectedItem.url}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                controls
                style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px', boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TravelAlbum;

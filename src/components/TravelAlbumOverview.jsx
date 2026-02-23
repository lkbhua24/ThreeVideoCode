import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Search, Grid, LayoutList, Grip, Eye, EyeOff, Image as ImageIcon, MapPin, Plus, X, FolderOpen, Loader } from 'lucide-react';

const TravelAlbumOverview = ({ onSelectCity, onClose }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [layout, setLayout] = useState('waterfall'); // 'waterfall' (grid) or 'list'
  const [lastUpdate, setLastUpdate] = useState(0); // Track server update time

  // Add Album Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlbumStep, setNewAlbumStep] = useState('form'); // 'form' | 'success'
  const [newAlbumData, setNewAlbumData] = useState({ cityCN: '', cityEN: '', folderName: '', arrivedAt: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdAlbum, setCreatedAlbum] = useState(null);

  useEffect(() => {
    fetchCities();

    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      fetch('/api/media-status')
        .then(res => res.json())
        .then(data => {
          if (data.lastMediaUpdate > lastUpdate) {
            setLastUpdate(data.lastMediaUpdate);
            // fetchCities() will be called by useEffect when lastUpdate changes
          }
        })
        .catch(err => console.error('Polling error:', err));
    }, 3000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  const fetchCities = () => {
    // Only set loading on initial load, not during background refresh
    if (cities.length === 0) setLoading(true);
    fetch('/api/travel-pins-all')
      .then(res => res.json())
      .then(data => {
        // Load saved order and visibility from localStorage
        const savedOrder = localStorage.getItem('cityOrder');
        const savedVisibility = localStorage.getItem('cityVisibility');
        
        let initialCities = data.map(city => ({
          ...city,
          visible: true,
          coverPhoto: city.photos && city.photos.length > 0 ? city.photos[0] : null
        }));

        if (savedOrder) {
          const orderMap = JSON.parse(savedOrder);
          
          // Check if all current cities are in the saved order
          // If any city is missing from saved order (e.g. newly added), 
          // we should revert to default date-based sorting (server order)
          const allCitiesKnown = initialCities.every(city => orderMap.includes(city.cityEN));

          if (allCitiesKnown) {
            initialCities.sort((a, b) => {
              const indexA = orderMap.indexOf(a.cityEN);
              const indexB = orderMap.indexOf(b.cityEN);
              return indexA - indexB;
            });
          } else {
            // New city detected! Use default server order (date sorted)
            // and update localStorage to match this new default order
            const newOrder = initialCities.map(c => c.cityEN);
            localStorage.setItem('cityOrder', JSON.stringify(newOrder));
          }
        }

        if (savedVisibility) {
          const visibilityMap = JSON.parse(savedVisibility);
          initialCities = initialCities.map(city => ({
            ...city,
            visible: visibilityMap[city.cityEN] !== false
          }));
        }

        setCities(initialCities);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  // Save order and visibility changes
  const saveSettings = (newCities) => {
    setCities(newCities);
    const order = newCities.map(c => c.cityEN);
    const visibility = newCities.reduce((acc, c) => ({
      ...acc,
      [c.cityEN]: c.visible
    }), {});
    
    localStorage.setItem('cityOrder', JSON.stringify(order));
    localStorage.setItem('cityVisibility', JSON.stringify(visibility));
    
    // Dispatch custom event for TravelPin to update
    window.dispatchEvent(new Event('cityOrderUpdated'));
  };

  const toggleVisibility = (e, cityEN) => {
    e.stopPropagation();
    const newCities = cities.map(c => 
      c.cityEN === cityEN ? { ...c, visible: !c.visible } : c
    );
    saveSettings(newCities);
  };

  const filteredCities = cities.filter(city => 
    city.cityCN.toLowerCase().includes(searchTerm.toLowerCase()) || 
    city.cityEN.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/travel-pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlbumData)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create album');
      }

      const data = await res.json();
      setCreatedAlbum(data);
      setNewAlbumStep('success');
      fetchCities(); // Refresh list
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenFolder = async () => {
    if (!createdAlbum) return;
    try {
      await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: createdAlbum.folderName || createdAlbum.cityEN })
      });
    } catch (err) {
      console.error('Failed to open folder', err);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewAlbumStep('form');
    setNewAlbumData({ cityCN: '', cityEN: '', folderName: '', arrivedAt: '' });
    setErrorMsg('');
    setCreatedAlbum(null);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      color: '#fff',
      position: 'relative' // For modal
    }}>
      {/* Header & Toolbar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '400', 
            letterSpacing: '1px',
            margin: 0,
            textShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}>
            Travel Album <span style={{ opacity: 0.9, fontSize: '1rem', fontWeight: '300' }}>Overview</span>
          </h2>
          <p style={{ opacity: 1, fontSize: '0.9rem', marginTop: '4px', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            Drag to reorder • Toggle visibility on Home
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Add Album Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            style={{
              background: 'rgba(255,255,255,0.25)',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              color: '#fff',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            <Plus size={16} />
            <span>新增你的旅行足迹</span>
          </motion.button>

          {/* Search */}
          <div style={{ 
            position: 'relative',
            background: 'rgba(255,255,255,0.25)',
            borderRadius: '20px',
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <Search size={16} style={{ marginRight: '8px', opacity: 1 }} />
            <input 
              type="text" 
              placeholder="Search city..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#fff', 
                outline: 'none',
                width: '120px',
                fontSize: '14px',
                fontWeight: '500',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }} 
            />
          </div>

          {/* Layout Toggle */}
          <div style={{ 
            display: 'flex', 
            background: 'rgba(255,255,255,0.25)', 
            borderRadius: '20px', 
            padding: '4px',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <button
              onClick={() => setLayout('waterfall')}
              style={{
                background: layout === 'waterfall' ? 'rgba(255,255,255,0.5)' : 'transparent',
                border: 'none',
                borderRadius: '16px',
                padding: '6px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                boxShadow: layout === 'waterfall' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
              title="Waterfall View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setLayout('list')}
              style={{
                background: layout === 'list' ? 'rgba(255,255,255,0.5)' : 'transparent',
                border: 'none',
                borderRadius: '16px',
                padding: '6px',
                cursor: 'pointer',
                color: '#fff',
                display: 'flex',
                boxShadow: layout === 'list' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
              }}
              title="List View"
            >
              <LayoutList size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* City List / Grid */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
        <Reorder.Group 
          axis="y" 
          values={cities} 
          onReorder={saveSettings}
          style={{
            display: layout === 'waterfall' ? 'grid' : 'flex',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            flexDirection: 'column',
            gap: '20px',
            paddingBottom: '40px'
          }}
        >
          {filteredCities.map((city) => (
            <Reorder.Item
              key={city.cityEN}
              value={city}
              style={{ listStyle: 'none' }}
              whileDrag={{ scale: 1.02, boxShadow: '0 8px 20px rgba(0,0,0,0.2)', zIndex: 100 }}
            >
              <motion.div
                layoutId={city.cityEN}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}
                style={{
                  background: 'rgba(255,255,255,0.35)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: layout === 'list' ? 'row' : 'column',
                  height: layout === 'list' ? '120px' : 'auto',
                  border: '1px solid rgba(255,255,255,0.25)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
                onClick={() => onSelectCity(city.cityEN)}
              >
                {/* Drag Handle (Visible in List view mainly, or absolutely positioned) */}
                <div 
                  className="drag-handle"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    bottom: '0',
                    width: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'grab',
                    zIndex: 10,
                    opacity: 0.5,
                    background: 'linear-gradient(90deg, rgba(0,0,0,0.1), transparent)'
                  }}
                  onPointerDown={(e) => e.stopPropagation()} // Let Reorder.Item handle drag
                >
                  <Grip size={16} />
                </div>

                {/* Cover Image */}
                <div style={{
                  width: layout === 'list' ? '120px' : '100%',
                  height: layout === 'list' ? '100%' : '180px',
                  background: '#eee',
                  position: 'relative',
                  marginLeft: '30px' // Space for drag handle
                }}>
                  {city.coverPhoto ? (
                    <img 
                      src={city.coverPhoto} 
                      alt={city.cityEN} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #e0e0e0, #f5f5f5)',
                      color: '#999'
                    }}>
                      <ImageIcon size={24} />
                    </div>
                  )}
                  
                  {/* Visibility Toggle Badge */}
                  <div 
                    onClick={(e) => toggleVisibility(e, city.cityEN)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: city.visible ? 'rgba(53, 188, 104, 0.8)' : 'rgba(0,0,0,0.5)',
                      padding: '4px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      color: '#fff',
                      display: 'flex'
                    }}
                    title={city.visible ? "Visible on Home" : "Hidden from Home"}
                  >
                    {city.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </div>
                </div>

                {/* Info */}
                <div style={{ 
                  flex: 1, 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '600', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                     {city.cityCN} <span style={{ fontSize: '0.95rem', opacity: 0.9, fontWeight: '400' }}>{city.cityEN}</span>
                   </h3>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', opacity: 1, fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} />
                      <span>{city.arrivedAt}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ImageIcon size={14} />
                      <span>{city.photos ? city.photos.length : 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {/* Add Album Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAddModal}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '24px',
                  padding: '30px',
                  width: '90%',
                  maxWidth: '500px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  position: 'relative',
                  color: '#333'
                }}
              >
                <button
                  onClick={closeAddModal}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#999'
                  }}
                >
                  <X size={24} />
                </button>

                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', textAlign: 'center', color: '#333' }}>
                  {newAlbumStep === 'form' ? '新增你的旅行足迹' : '相册创建成功'}
                </h3>

                {newAlbumStep === 'form' ? (
                  <form onSubmit={handleCreateAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>城市名称 (中文)</label>
                      <input
                        type="text"
                        required
                        value={newAlbumData.cityCN}
                        onChange={(e) => setNewAlbumData({...newAlbumData, cityCN: e.target.value})}
                        placeholder="例如：巴黎"
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>City Name (English)</label>
                      <input
                        type="text"
                        required
                        value={newAlbumData.cityEN}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewAlbumData(prev => ({
                            ...prev, 
                            cityEN: val,
                            // Auto-fill folder name if it's empty or matches previous cityEN
                            folderName: (prev.folderName === prev.cityEN || prev.folderName === '') ? val : prev.folderName
                          }));
                        }}
                        placeholder="e.g. Paris"
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>文件夹名称 (Folder Name)</label>
                      <input
                        type="text"
                        required
                        value={newAlbumData.folderName}
                        onChange={(e) => setNewAlbumData({...newAlbumData, folderName: e.target.value})}
                        placeholder="例如：Paris_2025"
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
                      />
                      <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#999' }}>
                        将会在 media 目录下创建此名称的文件夹
                      </p>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#666' }}>抵达日期</label>
                      <input
                        type="date"
                        value={newAlbumData.arrivedAt}
                        onChange={(e) => setNewAlbumData({...newAlbumData, arrivedAt: e.target.value})}
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem' }}
                      />
                    </div>
                    
                    {errorMsg && <p style={{ color: 'red', margin: 0, fontSize: '0.9rem' }}>{errorMsg}</p>}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        background: '#333',
                        color: '#fff',
                        border: 'none',
                        padding: '14px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginTop: '10px',
                        opacity: isSubmitting ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {isSubmitting ? <Loader size={18} className="spin" /> : <Plus size={18} />}
                      创建相册
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      background: '#E8F5E9', 
                      color: '#2E7D32', 
                      padding: '16px', 
                      borderRadius: '12px',
                      marginBottom: '20px',
                      fontSize: '0.95rem',
                      lineHeight: '1.6'
                    }}>
                      <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '8px' }}>温馨提示</p>
                      <p style={{ margin: 0 }}>
                        相册文件夹已创建。请将照片存入即将打开的文件夹中，建议使用统一的命名方式（如 1.jpg, 2.jpg...）。
                      </p>
                    </div>

                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '24px' }}>
                      目标路径: .../media/{createdAlbum?.folderName || createdAlbum?.cityEN}
                    </p>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={handleOpenFolder}
                        style={{
                          flex: 1,
                          background: '#333',
                          color: '#fff',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <FolderOpen size={18} />
                        打开文件夹
                      </button>
                      <button
                        onClick={closeAddModal}
                        style={{
                          flex: 1,
                          background: '#f5f5f5',
                          color: '#333',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '12px',
                          fontSize: '1rem',
                          fontWeight: '500',
                          cursor: 'pointer'
                        }}
                      >
                        完成
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TravelAlbumOverview;

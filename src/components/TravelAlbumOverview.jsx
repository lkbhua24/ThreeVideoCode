import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Search, Grid, LayoutList, Grip, Eye, EyeOff, Image as ImageIcon, MapPin, Plus, X, FolderOpen, Loader, Map, CheckCircle, AlertTriangle, Info, Globe, Flag, Calendar, Folder } from 'lucide-react';
import Achievements from './Achievements';

const TravelAlbumOverview = ({ onSelectCity, onClose }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [layout, setLayout] = useState('waterfall'); // 'waterfall' (grid) or 'list'
  const [activeFilter, setActiveFilter] = useState('All');
  const [lastUpdate, setLastUpdate] = useState(0); // Track server update time
  const [isDeleteMode, setIsDeleteMode] = useState(false); // Toggle delete mode

  // Add Album Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlbumStep, setNewAlbumStep] = useState('form'); // 'form' | 'success'
  const [newAlbumData, setNewAlbumData] = useState({ cityCN: '', cityEN: '', folderName: '', arrivedAt: '', country: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdAlbum, setCreatedAlbum] = useState(null);
  const [toasts, setToasts] = useState([]);

  

  const showToast = (message, type = 'info', action = null) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type, action }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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
          coverPhoto: city.cover || (city.photos && city.photos.length > 0 ? city.photos[0] : null)
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

  const filteredCities = cities.filter(city => {
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!(
        (city.cityEN && city.cityEN.toLowerCase().includes(term)) ||
        (city.cityCN && city.cityCN.toLowerCase().includes(term))
      )) return false;
    }
    
    // Filter
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Photo') return city.tags && city.tags.includes('Photo');
    if (activeFilter === 'Video') return city.tags && city.tags.includes('Video');
    if (activeFilter === 'Huge' || activeFilter === 'Big') return city.tags && city.tags.includes(activeFilter);
    // Date (Year)
    if (city.tags && city.tags.includes(activeFilter)) return true;

    return false;
  });

  // Calculate available filters
  const availableFilters = ['All'];
  const years = new Set();
  const hasVideo = cities.some(c => c.tags?.includes('Video'));
  const hasPhoto = cities.some(c => c.tags?.includes('Photo'));
  
  cities.forEach(c => {
    if (c.tags) {
       c.tags.forEach(t => {
         if (/^\d{4}$/.test(t)) years.add(t);
       });
    }
  });
  
  Array.from(years).sort().reverse().forEach(y => availableFilters.push(y));
  if (hasVideo) availableFilters.push('Video');
  if (hasPhoto) availableFilters.push('Photo');

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
      
      const data = await res.json();
      if (res.ok) {
        setCreatedAlbum(data); // data is the new city object
        setLastUpdate(Date.now()); // Refresh list
        try {
          fetchCities();
        } catch {}
        
        // Close modal and show success toast with action
        closeAddModal();
        showToast('旅行足迹添加成功！', 'success', {
          label: '打开文件夹',
          onClick: () => handleOpenFolderDirectly(data.folderName || data.cityEN)
        });
      } else {
        setErrorMsg(data.error || 'Failed to create album');
      }
    } catch (err) {
      setErrorMsg('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOpenFolderDirectly = async (folderName) => {
    try {
      await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderName })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCity = async (e, cityEN) => {
    e.stopPropagation(); // Prevent card click
    if (!window.confirm(`Are you sure you want to delete the album "${cityEN}"? This will remove the album entry and delete the folder if it's empty.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/travel-pins/${encodeURIComponent(cityEN)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (res.ok) {
        setLastUpdate(Date.now()); // Refresh list
        if (data.keptFolders && data.keptFolders.length > 0) {
          showToast('相册已删除，含文件的文件夹未删除', 'info');
        } else {
          showToast('相册已删除', 'success');
        }
      } else {
        showToast(data.error || '删除相册失败', 'error');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      showToast('网络错误，删除失败', 'error');
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
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '40px 20px',
      maxWidth: '1200px',
      margin: '0 auto',
      color: '#fff',
      position: 'relative' // For modal
    }}>
      <div style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 500, display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              style={{
                minWidth: '220px',
                maxWidth: '320px',
                padding: '12px 14px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderLeft: t.type === 'success' ? '4px solid #4CAF50' : t.type === 'error' ? '4px solid #FF5252' : '4px solid #2196F3',
                pointerEvents: 'auto'
              }}
            >
              {t.type === 'success' ? (
                <CheckCircle size={18} color="#4CAF50" />
              ) : t.type === 'error' ? (
                <AlertTriangle size={18} color="#FF5252" />
              ) : (
                <Info size={18} color="#2196F3" />
              )}
              <div style={{ flex: 1, fontSize: '0.95rem' }}>{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', lineHeight: 0 }}
                title="关闭"
              >
                <X size={16} color="#666" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
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
            <span>新增旅行足迹</span>
          </motion.button>

          {/* Delete Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDeleteMode(!isDeleteMode)}
            style={{
              background: isDeleteMode ? 'rgba(255, 82, 82, 0.8)' : 'rgba(255,255,255,0.25)',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 16px',
              color: '#fff',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              boxShadow: isDeleteMode ? '0 0 12px rgba(255, 82, 82, 0.4)' : '0 2px 8px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            {isDeleteMode ? <X size={16} /> : <Grip size={16} />}
            <span>{isDeleteMode ? '完成' : '管理'}</span>
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
          
          {/* Achievements Trigger (top-right with other actions) */}
          <Achievements variant="trigger" refreshKey={lastUpdate} />
        </div>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', padding: '0 40px' }}>
        {availableFilters.map(filter => (
          <motion.button
            key={filter}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(filter)}
            style={{
              background: activeFilter === filter ? '#fff' : 'rgba(255,255,255,0.2)',
              color: activeFilter === filter ? '#333' : '#fff',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 16px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              fontWeight: activeFilter === filter ? '600' : '400',
              boxShadow: activeFilter === filter ? '0 2px 8px rgba(255,255,255,0.3)' : 'none',
              transition: 'background 0.2s, color 0.2s'
            }}
          >
            {filter}
          </motion.button>
        ))}
      </div>

      {/* City List / Grid */}
      <div style={{ 
        flex: 1, 
        // overflowY: 'auto', // Removed internal scroll to use page scroll
        padding: '20px 40px',
        position: 'relative',
        zIndex: 1
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#fff' }}>
            <Loader className="spin" size={32} />
          </div>
        ) : cities.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '400px', 
            color: '#fff',
            textAlign: 'center'
          }}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{ 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: '50%', 
                padding: '40px',
                marginBottom: '24px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <Map size={64} color="rgba(255,255,255,0.8)" />
            </motion.div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.8rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              开启你的第一段旅程
            </h2>
            <p style={{ margin: '0 0 32px 0', fontSize: '1.1rem', opacity: 0.9, maxWidth: '400px', lineHeight: '1.5', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
              记录每一个难忘的瞬间，把美好的回忆珍藏在心底。点击下方按钮创建你的第一个旅行相册吧！
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
                border: 'none',
                borderRadius: '30px',
                padding: '16px 40px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '600',
                boxShadow: '0 4px 15px rgba(255, 154, 158, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <Plus size={24} />
              <span>创建新相册</span>
            </motion.button>
          </div>
        ) : (
        <Reorder.Group 
          axis="y" 
          values={cities} 
          onReorder={saveSettings}
          style={{
            display: layout === 'waterfall' ? 'grid' : 'flex',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
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
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: layout === 'list' ? 'row' : 'column',
                  height: layout === 'list' ? '140px' : 'auto',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}
                onClick={() => !isDeleteMode && onSelectCity(city.cityEN)}
              >
                {/* Delete Badge */}
                <AnimatePresence>
                  {isDeleteMode && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => handleDeleteCity(e, city.cityEN)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#ff5252',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 20,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        border: '2px solid #fff'
                      }}
                    >
                      <X size={16} color="#fff" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Drag Handle */}
                <div 
                  className="drag-handle"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    bottom: layout === 'list' ? '0' : 'auto',
                    height: layout === 'list' ? '100%' : '40px',
                    width: layout === 'list' ? '30px' : '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'grab',
                    zIndex: 10,
                    opacity: 0.5,
                    background: layout === 'list' ? 'linear-gradient(90deg, rgba(0,0,0,0.1), transparent)' : 'transparent',
                    borderTopLeftRadius: '16px'
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Grip size={16} color={layout === 'list' ? '#fff' : 'rgba(255,255,255,0.8)'} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} />
                </div>

                {/* Cover Image Container */}
                <div style={{
                  width: layout === 'list' ? '180px' : '100%',
                  height: layout === 'list' ? '100%' : '180px',
                  background: '#eee',
                  position: 'relative',
                  marginLeft: layout === 'list' ? '30px' : '0'
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

                  {/* Gradient Overlay for Grid View - Removed as text is below image */}
                  
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
                      display: 'flex',
                      zIndex: 5
                    }}
                    title={city.visible ? "Visible on Home" : "Hidden from Home"}
                  >
                    {city.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </div>
                </div>

                {/* Info Section */}
                <div style={{ 
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  flex: 1,
                  background: 'transparent'
                }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '600', lineHeight: 1.2, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                     {city.cityCN} <span style={{ fontSize: '0.9rem', opacity: 0.8, fontWeight: '400' }}>{city.cityEN}</span>
                   </h3>
                   
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', opacity: 0.7, fontWeight: '400', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      <span>{city.arrivedAt}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ImageIcon size={12} />
                      <span>{city.mediaCount || (city.photos ? city.photos.length : 0)}</span>
                    </div>
                    
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                      {city.tags && city.tags.map(tag => (
                        <span key={tag} style={{ 
                          fontSize: '0.7rem', 
                          background: 'rgba(255,255,255,0.1)', 
                          color: 'rgba(255,255,255,0.9)',
                          padding: '2px 6px', 
                          borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          {tag}
                        </span>
                      ))}
                   </div>
                </div>
              </motion.div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
        )}
      </div>

      {/* Add Album Modal */}
      <AnimatePresence>
        {showAddModal && (
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
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.65)',
              borderRadius: '24px',
              width: '900px',
              maxWidth: '95%',
              height: '580px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid rgba(255,255,255,0.6)'
            }}
          >
              {/* Close Button */}
              <button
                onClick={closeAddModal}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(0,0,0,0.05)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#666',
                  zIndex: 10,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              >
                <X size={20} />
              </button>

              {/* Left Side: Form */}
              <div style={{ 
                flex: 1, 
                padding: '40px', 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', fontWeight: '700', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                  开启新旅程
                </h3>
                <p style={{ margin: '0 0 32px 0', color: '#666', fontSize: '0.95rem' }}>
                  记录你的足迹，保存珍贵回忆。
                </p>

                <form onSubmit={handleCreateAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* City Name Row */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#444' }}>
                        <MapPin size={14} /> 城市 (中文)
                      </label>
                      <input
                        type="text"
                        required
                        value={newAlbumData.cityCN}
                        onChange={(e) => setNewAlbumData({...newAlbumData, cityCN: e.target.value})}
                        placeholder="例如：巴黎"
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(0,0,0,0.08)', 
                          fontSize: '1rem', 
                          background: 'rgba(255,255,255,0.4)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.8)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                          e.target.style.borderColor = '#000';
                        }}
                        onBlur={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.4)';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                          e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#444' }}>
                        <Globe size={14} /> City (English)
                      </label>
                      <input
                        type="text"
                        required
                        value={newAlbumData.cityEN}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewAlbumData(prev => ({
                            ...prev, 
                            cityEN: val,
                            folderName: (prev.folderName === prev.cityEN || prev.folderName === '') ? val : prev.folderName
                          }));
                        }}
                        placeholder="e.g. Paris"
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(0,0,0,0.08)', 
                          fontSize: '1rem', 
                          background: 'rgba(255,255,255,0.4)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.8)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                          e.target.style.borderColor = '#000';
                        }}
                        onBlur={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.4)';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                          e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                        }}
                      />
                    </div>
                  </div>

                  {/* Country & Date Row */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#444' }}>
                        <Flag size={14} /> 国家/地区
                      </label>
                      <input
                        type="text"
                        list="countries-list"
                        value={newAlbumData.country || ''}
                        onChange={(e) => setNewAlbumData({...newAlbumData, country: e.target.value})}
                        placeholder="选择或输入"
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(0,0,0,0.08)', 
                          fontSize: '1rem', 
                          background: 'rgba(255,255,255,0.4)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.8)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                          e.target.style.borderColor = '#000';
                        }}
                        onBlur={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.4)';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                          e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                        }}
                      />
                      <datalist id="countries-list">
                        <option value="中国" />
                        <option value="日本" />
                        <option value="韩国" />
                        <option value="泰国" />
                        <option value="新加坡" />
                        <option value="马来西亚" />
                        <option value="美国" />
                        <option value="英国" />
                        <option value="法国" />
                        <option value="意大利" />
                        <option value="澳大利亚" />
                        <option value="新西兰" />
                      </datalist>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#444' }}>
                        <Calendar size={14} /> 抵达日期
                      </label>
                      <input
                        type="date"
                        value={newAlbumData.arrivedAt}
                        onChange={(e) => setNewAlbumData({...newAlbumData, arrivedAt: e.target.value})}
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          borderRadius: '12px', 
                          border: '1px solid rgba(0,0,0,0.08)', 
                          fontSize: '1rem', 
                          background: 'rgba(255,255,255,0.4)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          outline: 'none',
                          transition: 'all 0.2s',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.8)';
                          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                          e.target.style.borderColor = '#000';
                        }}
                        onBlur={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.4)';
                          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                          e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                        }}
                      />
                    </div>
                  </div>

                  {/* Folder Name */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: '#444' }}>
                      <Folder size={14} /> 文件夹名称
                    </label>
                    <input
                      type="text"
                      required
                      value={newAlbumData.folderName}
                      onChange={(e) => setNewAlbumData({...newAlbumData, folderName: e.target.value})}
                      placeholder="例如：Paris_2025"
                      style={{ 
                        width: '100%', 
                        padding: '12px 16px', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(0,0,0,0.08)', 
                        fontSize: '1rem', 
                        background: 'rgba(255,255,255,0.4)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.8)';
                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        e.target.style.borderColor = '#000';
                      }}
                      onBlur={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.4)';
                        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                        e.target.style.borderColor = 'rgba(0,0,0,0.08)';
                      }}
                    />
                    <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Info size={12} />
                      将在 media 目录下自动创建此文件夹
                    </p>
                  </div>
                  
                  {errorMsg && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f44336', fontSize: '0.9rem', background: '#ffebee', padding: '8px 12px', borderRadius: '8px' }}>
                      <AlertTriangle size={16} />
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ flex: 1 }}></div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '16px',
                      borderRadius: '16px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      transition: 'transform 0.1s, box-shadow 0.2s',
                      opacity: isSubmitting ? 0.8 : 1
                    }}
                    onMouseEnter={(e) => {
                      if(!isSubmitting) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if(!isSubmitting) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                      }
                    }}
                    onMouseDown={(e) => !isSubmitting && (e.currentTarget.style.transform = 'scale(0.98)')}
                    onMouseUp={(e) => !isSubmitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader size={20} className="spin" />
                        <span>正在创建...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={20} />
                        <span>立即创建</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Side: Illustration */}
              <div style={{ 
                width: '320px', 
                background: 'linear-gradient(135deg, rgba(253,251,251,0.3) 0%, rgba(235,237,238,0.3) 100%)',
                borderLeft: '1px solid rgba(255,255,255,0.2)',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', opacity: 0.1, filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)', opacity: 0.1, filter: 'blur(30px)' }} />

                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  background: '#fff',
                  borderRadius: '30px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                  marginBottom: '32px',
                  transform: 'rotate(-5deg)'
                }}>
                  <Map size={48} color="#555" strokeWidth={1.5} />
                </div>

                <h4 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', color: '#333' }}>整理美好回忆</h4>
                <p style={{ margin: 0, textAlign: 'center', color: '#888', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  为每一次旅行建立专属档案。<br/>
                  照片、视频、故事，<br/>
                  都将在这里被精心珍藏。
                </p>

                <div style={{ marginTop: 'auto', width: '100%', paddingTop: '30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', marginBottom: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50' }} />
                    <span style={{ fontSize: '0.85rem', color: '#555' }}>自动同步文件夹</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2196F3' }} />
                    <span style={{ fontSize: '0.85rem', color: '#555' }}>支持智能筛选</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{
              position: 'fixed',
              bottom: '40px',
              left: '50%',
              x: '-50%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              color: '#333',
              padding: '12px 24px',
              borderRadius: '50px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              zIndex: 2000,
              minWidth: '320px',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {toast.type === 'success' ? (
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={14} color="#4CAF50" />
                </div>
              ) : (
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Info size={14} color="#2196F3" />
                </div>
              )}
              <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{toast.message}</span>
            </div>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action.onClick();
                  // Optionally close toast after action
                }}
                style={{
                  background: '#1a1a1a',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = 0.8}
                onMouseLeave={(e) => e.target.style.opacity = 1}
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      
    </div>
  );
};

export default TravelAlbumOverview;

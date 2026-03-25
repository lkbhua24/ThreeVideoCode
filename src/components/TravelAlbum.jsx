import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Upload, Loader, Image as ImageIcon, BookOpen, X, Ghost, PenTool, ImageOff, Save, CheckCircle, AlertTriangle, Info, Calendar, Edit2, Clock } from 'lucide-react';
import TravelAlbumOverview from './TravelAlbumOverview';

const TravelAlbum = ({ city, onBack }) => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isSetCoverMode, setIsSetCoverMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddInstruction, setShowAddInstruction] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [openedFolderInfo, setOpenedFolderInfo] = useState(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [latestStories, setLatestStories] = useState([]);
  const [isWritingStory, setIsWritingStory] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryContent, setNewStoryContent] = useState('');
  const [isSavingStory, setIsSavingStory] = useState(false);
  const [debugEmptyAlbum, setDebugEmptyAlbum] = useState(false);
  const [debugEmptyStories, setDebugEmptyStories] = useState(false);
  const [toasts, setToasts] = useState([]);
  const fileInputRef = useRef(null);
  const [cityMeta, setCityMeta] = useState(null);
  const [showAnniversaryModal, setShowAnniversaryModal] = useState(false);
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [isSavingAnniversary, setIsSavingAnniversary] = useState(false);
  
  // 'overview' or 'city'
  // If city prop is provided (from TravelPin), default to 'city'
  // If no city prop (from Menu), default to 'overview'
  const [mode, setMode] = useState(city ? 'city' : 'overview');
  const [currentCity, setCurrentCity] = useState(city);

  const showToast = (message, type = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2600);
  };
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    if (city) {
      setCurrentCity(city);
      setMode('city');
    } else {
      setMode('overview');
    }
  }, [city]);

  useEffect(() => {
    fetchItems();
  }, [currentCity, mode, lastUpdate]);

  // Polling for updates when folder is open
  useEffect(() => {
    let interval;
    if (isPolling) {
      interval = setInterval(() => {
        fetchItems();
      }, 2000); // Poll every 2 seconds
    }
    return () => clearInterval(interval);
  }, [isPolling, currentCity]);

  const fetchItems = async () => {
    if (mode !== 'city' || !currentCity) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/city-media/${encodeURIComponent(currentCity)}`);
      const data = await res.json();
      if (data && data.items) {
        setItems(data.items);
        setCityMeta(data);
        if (data.anniversary) setAnniversaryDate(data.anniversary);
      } else {
        setItems([]);
        setCityMeta(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleOpenFolder = async () => {
    setIsUploading(true);
    try {
      const res = await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentCity })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '打开文件夹失败');
      }
      const data = await res.json();
      setOpenedFolderInfo({ folderName: data.folderName, fullPath: data.fullPath });
      setShowAddInstruction(true);
      setIsPolling(true); // Start polling
      showToast('已打开城市文件夹', 'info');
    } catch (err) {
      console.error("Failed to open folder", err);
      showToast('无法打开文件夹', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenStories = async () => {
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLatestStories(data);
        setShowStoryModal(true);
        setIsWritingStory(false); // Reset writing state
        setNewStoryTitle('');
        setNewStoryContent('');
      }
    } catch (err) {
      console.error("Failed to fetch stories", err);
    }
  };

  const handleSaveStory = async () => {
    if (!newStoryContent.trim()) return;
    setIsSavingStory(true);
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newStoryTitle,
          content: newStoryContent,
          date: new Date().toISOString().split('T')[0],
          author: 'Me', // Placeholder
          mood: '#FFB7B2', // Default mood color
          type: 'note'
        })
      });
      if (res.ok) {
        // Refresh stories
        const storiesRes = await fetch('/api/stories');
        const storiesData = await storiesRes.json();
        setLatestStories(storiesData);
        setIsWritingStory(false);
        setNewStoryTitle('');
        setNewStoryContent('');
        showToast('故事已保存', 'success');
      }
    } catch (err) {
      console.error("Failed to save story", err);
      showToast('保存失败', 'error');
    } finally {
      setIsSavingStory(false);
    }
  };

  const handleFinishAdding = () => {
    setShowAddInstruction(false);
    setIsPolling(false);
    setOpenedFolderInfo(null);
  };

  const handleDeleteItem = async (e, item) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    try {
      const param = item.relativePath 
        ? `relativePath=${encodeURIComponent(item.relativePath)}` 
        : `fileName=${encodeURIComponent(item.name)}`;
        
      await fetch(`/api/delete/${encodeURIComponent(currentCity)}?${param}`, {
        method: 'DELETE'
      });
      // Remove item from local state immediately for better UX
      setItems(prev => prev.filter(i => i.id !== item.id));
      setLastUpdate(Date.now());
      showToast(`已删除 ${item.name}`, 'success');
    } catch (err) {
      console.error("Delete failed", err);
      showToast('删除失败', 'error');
    }
  };

  const handleSetCover = async (e, item) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/set-cover/${encodeURIComponent(currentCity)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverUrl: item.thumbnail })
      });
      if (res.ok) {
        setIsSetCoverMode(false);
        showToast('封面已更新', 'success');
        setLastUpdate(Date.now()); // Trigger refresh
      } else {
        throw new Error("Failed to set cover");
      }
    } catch (err) {
      console.error("Failed to set cover", err);
      showToast('设置封面失败', 'error');
    }
  };

  const getAnniversaryText = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const target = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return { text: '就是今天!', color: '#FF4081' };
    if (diffDays > 0) return { text: `还有 ${diffDays} 天`, color: '#64B5F6' };
    return { text: `已过 ${Math.abs(diffDays)} 天`, color: '#FFB74D' };
  };

  const openAnniversaryModal = () => {
    setAnniversaryDate(cityMeta?.anniversary || '');
    setShowAnniversaryModal(true);
  };

  const handleSaveAnniversary = async (e) => {
    e.preventDefault();
    if (!currentCity) return;
    if (!anniversaryDate) {
      showToast('请选择日期', 'error');
      return;
    }
    setIsSavingAnniversary(true);
    try {
      const res = await fetch(`/api/travel-pins/${encodeURIComponent(currentCity)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anniversary: anniversaryDate })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCityMeta(prev => ({ ...(prev || {}), anniversary: anniversaryDate }));
        showToast('纪念日设置成功', 'success');
        setShowAnniversaryModal(false);
      } else {
        showToast(data.error ? `保存失败：${data.error}` : '保存失败', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('网络错误', 'error');
    } finally {
      setIsSavingAnniversary(false);
    }
  };

  

  const renderMediaGrid = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '300px', color: '#fff' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Loader size={32} />
          </motion.div>
        </div>
      );
    }
    if (debugEmptyAlbum || items.length === 0) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          minHeight: '300px',
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
              padding: '30px',
              marginBottom: '20px',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <ImageOff size={48} color="rgba(255,255,255,0.8)" />
          </motion.div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            相册是空的
          </h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '1rem', opacity: 0.9, maxWidth: '300px', lineHeight: '1.5', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            点击上方“+”号打开文件夹，放入照片或视频即可自动展示。
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenFolder}
            style={{
              background: 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '24px',
              padding: '12px 24px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} />
            <span>打开文件夹</span>
          </motion.button>
        </div>
      );
    }
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
        gap: '16px', 
        padding: '20px',
        paddingBottom: '60px',
        maxWidth: '1600px',
        margin: '0 auto',
        width: '100%'
      }}>
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            onClick={() => !isDeleteMode && !isSetCoverMode && setSelectedItem(item)}
            style={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              aspectRatio: '1',
              background: 'rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative'
            }}
          >
            {item.type === 'image' ? (
              <img src={item.url} alt={`${currentCity} ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            ) : (
              <video 
                src={item.url} 
                poster={item.thumbnail}
                controls={!isDeleteMode} 
                muted 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            )}

            {isSetCoverMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(76, 175, 80, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20,
                  cursor: 'pointer'
                }}
                onClick={(e) => handleSetCover(e, item)}
                title="设置封面"
              >
                <ImageIcon color="#fff" size={40} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                <span style={{ 
                  position: 'absolute', 
                  bottom: '20px', 
                  color: '#fff', 
                  fontWeight: 'bold', 
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)' 
                }}>
                  设为封面
                </span>
              </motion.div>
            )}

            {isDeleteMode && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(255,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20
                }}
                onClick={(e) => handleDeleteItem(e, item)}
              >
                <Trash2 color="#fff" size={32} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    );
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
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Toast Instruction */}
      <AnimatePresence>
        {showAddInstruction && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            style={{
              position: 'fixed',
              top: '80px',
              left: '50%',
              zIndex: 200,
              background: 'rgba(0,0,0,0.85)',
              color: '#fff',
              padding: '16px 24px',
              borderRadius: '16px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ background: '#4CAF50', borderRadius: '50%', padding: '8px', display: 'flex' }}>
              <Plus size={20} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '1rem' }}>文件夹已打开</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                请将照片或视频直接放入该城市文件夹中
              </p>
              {openedFolderInfo && (
                <p style={{ margin: '6px 0 0 0', fontSize: '0.8rem', opacity: 0.85 }}>
                  城市文件夹名：{openedFolderInfo.folderName}
                  <br />
                  路径：{openedFolderInfo.fullPath}
                </p>
              )}
            </div>
            <button
              onClick={handleFinishAdding}
              style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginLeft: '12px'
              }}
            >
              完成
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons (Top Right) */}
      <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '12px',
          zIndex: 100
      }}>
        {mode === 'city' && (
            <>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={openAnniversaryModal}
                    style={{
                        background: cityMeta?.anniversary ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    title={cityMeta?.anniversary ? '修改纪念日' : '设置纪念日'}
                >
                    {cityMeta?.anniversary ? <Edit2 size={18} /> : <Calendar size={20} />}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleOpenStories}
                    style={{
                        background: 'rgba(255,255,255,0.35)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    title="最新故事"
                >
                    <BookOpen size={20} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleOpenFolder}
                    disabled={isUploading}
                    style={{
                        background: 'rgba(255,255,255,0.35)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    title="打开文件夹添加文件"
                >
                    {isUploading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        style={{ display: 'flex' }}
                      >
                        <Loader size={20} />
                      </motion.div>
                    ) : (
                      <Plus size={24} />
                    )}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        setIsSetCoverMode(!isSetCoverMode);
                        setIsDeleteMode(false);
                    }}
                    style={{
                        background: isSetCoverMode ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255,255,255,0.35)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    title="设置封面"
                >
                    <ImageIcon size={20} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        setIsDeleteMode(!isDeleteMode);
                        setIsSetCoverMode(false);
                    }}
                    style={{
                        background: isDeleteMode ? 'rgba(255,80,80,0.8)' : 'rgba(255,255,255,0.35)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    title="删除照片/视频"
                >
                    <Trash2 size={20} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDebugEmptyAlbum(v => !v)}
                    style={{
                        background: debugEmptyAlbum ? 'rgba(255, 193, 7, 0.8)' : 'rgba(255,255,255,0.35)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    title="模拟相册为空"
                >
                    <ImageOff size={18} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setDebugEmptyStories(v => !v)}
                    style={{
                        background: debugEmptyStories ? 'rgba(156, 39, 176, 0.8)' : 'rgba(255,255,255,0.35)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    title="模拟故事为空"
                >
                    <Ghost size={18} />
                </motion.button>
            </>
        )}

        <button
            onClick={handleBack}
            style={{
                background: 'rgba(255,255,255,0.35)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                lineHeight: 1
            }}
        >
            {mode === 'city' ? '‹' : '×'}
        </button>
      </div>

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
      <div style={{ zIndex: 10, width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {mode === 'overview' ? (
          <TravelAlbumOverview onSelectCity={handleSelectCity} onClose={onBack} />
        ) : (
          <div style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', padding: '40px' }}>
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
              {cityMeta?.anniversary && (() => {
                const status = getAnniversaryText(cityMeta.anniversary);
                if (!status) return null;
                return (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px', padding: '6px 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)' }}>
                    <Clock size={14} color={status.color} />
                    <span style={{ color: status.color, fontWeight: 600 }}>{status.text}</span>
                    <span style={{ color: '#fff', opacity: 0.9, fontSize: '0.85rem' }}>{cityMeta.anniversary}</span>
                  </div>
                );
              })()}
            </motion.div>

            {/* Photo Grid */}
            {renderMediaGrid()}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAnniversaryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAnniversaryModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 300,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '24px',
                padding: '28px',
                width: '90%',
                maxWidth: '420px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                color: '#333'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>设置纪念日</h3>
                <button onClick={() => setShowAnniversaryModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px' }}>
                  <X size={20} color="#666" />
                </button>
              </div>
              <form onSubmit={handleSaveAnniversary} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input
                  type="date"
                  value={anniversaryDate}
                  onChange={(e) => setAnniversaryDate(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '1rem', fontFamily: 'inherit' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setShowAnniversaryModal(false)} style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', background: '#f5f5f5', color: '#333', cursor: 'pointer' }}>
                    取消
                  </button>
                  <button type="submit" disabled={isSavingAnniversary} style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', background: '#333', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isSavingAnniversary ? <Loader size={16} className="spin" /> : <Save size={16} />}
                    保存
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Modal */}
      <AnimatePresence>
        {showStoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 300,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setShowStoryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '24px',
                padding: '32px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                color: '#333'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <BookOpen size={28} color="#FF7E5F" />
                  最新故事
                </h2>
                <button 
                  onClick={() => setShowStoryModal(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                >
                  <X size={24} color="#666" />
                </button>
              </div>

              {isWritingStory ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   <input 
                     type="text" 
                     placeholder="标题 (可选)" 
                     value={newStoryTitle} 
                     onChange={(e) => setNewStoryTitle(e.target.value)}
                     style={{ padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontSize: '1.1rem', outline: 'none' }}
                   />
                   <textarea 
                     placeholder="写下你的故事..." 
                     value={newStoryContent}
                     onChange={(e) => setNewStoryContent(e.target.value)}
                     style={{ padding: '12px', borderRadius: '12px', border: '1px solid #eee', fontSize: '1rem', minHeight: '150px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                   />
                   <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                     <button 
                       onClick={() => setIsWritingStory(false)}
                       style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#f5f5f5', color: '#666', cursor: 'pointer' }}
                     >
                       取消
                     </button>
                     <button 
                       onClick={handleSaveStory}
                       disabled={isSavingStory}
                       style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#FF7E5F', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                     >
                       {isSavingStory ? <Loader size={16} className="spin" /> : <Save size={16} />}
                       保存
                     </button>
                   </div>
                </div>
              ) : (debugEmptyStories || latestStories.length === 0) ? (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  padding: '40px 20px', 
                  color: '#666',
                  textAlign: 'center' 
                }}>
                  <div style={{ background: '#FFF0F5', padding: '24px', borderRadius: '50%', marginBottom: '20px' }}>
                    <Ghost size={40} color="#FFB7B2" />
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#333' }}>暂无故事</h3>
                  <p style={{ margin: '0 0 24px 0', color: '#888' }}>这里静悄悄的，写下第一篇故事吧！</p>
                  <button
                    onClick={() => setIsWritingStory(true)}
                    style={{
                      background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
                      border: 'none',
                      borderRadius: '24px',
                      padding: '12px 28px',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(255, 154, 158, 0.4)'
                    }}
                  >
                    <PenTool size={18} />
                    <span>写故事</span>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <button
                    onClick={() => setIsWritingStory(true)}
                    style={{
                      alignSelf: 'flex-end',
                      background: 'transparent',
                      border: '1px solid #FF7E5F',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      color: '#FF7E5F',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <PenTool size={14} />
                    <span>写新故事</span>
                  </button>
                  {latestStories.map((story) => (
                    <div key={story.id} style={{ 
                      padding: '20px', 
                      background: story.bgColor || '#fff', 
                      borderRadius: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: '500' }}>
                          {new Date(story.date).toLocaleDateString()}
                        </span>
                        {story.mood && (
                          <span style={{ 
                            display: 'inline-block', 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%', 
                            background: story.mood 
                          }} />
                        )}
                      </div>
                      
                      {story.title && (
                        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.4rem', color: '#222' }}>
                          {story.title}
                        </h3>
                      )}
                      
                      <p style={{ margin: 0, lineHeight: '1.6', fontSize: '1.05rem', color: '#444', whiteSpace: 'pre-wrap' }}>
                        {story.content}
                      </p>
                      
                      {story.author && (
                        <div style={{ marginTop: '16px', textAlign: 'right', fontSize: '0.9rem', color: '#999', fontStyle: 'italic' }}>
                          — {story.author}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

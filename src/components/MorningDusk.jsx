import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Calendar, Paperclip, Heart, X, Edit2, Trash2, ChevronLeft, ChevronRight, MessageCircle, Send, Book } from 'lucide-react';

const MorningDusk = ({ onReturnToMemory }) => {
  // State
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [currentStory, setCurrentStory] = useState(null); // For editing
  const [expandedStory, setExpandedStory] = useState(null); // For viewing
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [timelineDates, setTimelineDates] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    author: '',
    tags: '',
    mood: '#FFB7B2',
    bgColor: '#ffffff', // Default white background
    type: 'note' // 'note' | 'heart'
  });

  // Decorations
  const decorations = [
    { color: '#FFB7B2', top: '20%', left: '15%', size: '120px', delay: 0 },
    { color: '#B2EBF2', top: '60%', left: '80%', size: '180px', delay: 2 },
    { color: '#FFF9C4', top: '80%', left: '30%', size: '100px', delay: 4 },
    { color: '#D7CCC8', top: '15%', left: '70%', size: '150px', delay: 1 },
    { color: '#E1BEE7', top: '40%', left: '50%', size: '80px', delay: 3 },
  ];

  // Fetch Stories
  useEffect(() => {
    fetchStories();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('selectedStoryDate');
    if (saved) {
      setSelectedDate(saved);
      localStorage.removeItem('selectedStoryDate');
    }
  }, []);
  const [showReturn, setShowReturn] = useState(false);
  useEffect(() => {
    const flag = localStorage.getItem('fromMemoryMode');
    if (flag === '1') setShowReturn(true);
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      setStories(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch stories:', err);
      setLoading(false);
    }
  };

  // Generate Timeline Dates (Center on selectedDate, +/- 5 days)
  useEffect(() => {
    const dates = [];
    const center = new Date(selectedDate);
    for (let i = -4; i <= 4; i++) {
      const d = new Date(center);
      d.setDate(center.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    setTimelineDates(dates);
  }, [selectedDate]);

  // Filter Stories
  const filteredStories = stories.filter(story => {
    const matchesSearch = 
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (story.tags && story.tags.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // If searching, ignore date filter unless date is explicitly in search? 
    // Or just filter by date if no search term?
    // User asked for "search bar... automatically search date". 
    // Let's say: if searchTerm is present, filter globally. If empty, show selectedDate.
    // BUT user also wants "manual jump... choose corresponding day".
    // Strategy: 
    // 1. If searchTerm is NOT empty, show all matching stories regardless of date.
    // 2. If searchTerm IS empty, show stories for selectedDate.
    
    if (searchTerm) return matchesSearch;
    return story.date === selectedDate;
  });

  // Handle Create/Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentStory ? 'PUT' : 'POST';
    const url = currentStory ? `/api/stories/${currentStory.id}` : '/api/stories';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        fetchStories();
        setShowModal(false);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            title: '',
            content: '',
            author: '',
            tags: '',
            mood: '#FFB7B2',
            bgColor: '#ffffff',
            type: 'note'
        });
        setCurrentStory(null);
      }
    } catch (err) {
      console.error('Failed to save story:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这个故事吗？')) return;
    try {
      await fetch(`/api/stories/${id}`, { method: 'DELETE' });
      fetchStories();
    } catch (err) {
      console.error('Failed to delete story:', err);
    }
  };

  const openEdit = (story) => {
    setCurrentStory(story);
    setFormData({ ...story });
    setShowModal(true);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !expandedStory) return;

    try {
      const res = await fetch(`/api/stories/${expandedStory.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: commentText,
            author: commentAuthor.trim() || 'Anonymous' 
        })
      });

      if (res.ok) {
        const newComment = await res.json();
        const updatedStory = {
            ...expandedStory,
            comments: [...(expandedStory.comments || []), newComment]
        };
        setExpandedStory(updatedStory);
        
        // Update local stories list as well
        setStories(stories.map(s => s.id === updatedStory.id ? updatedStory : s));
        
        setCommentText('');
        // Keep author name for convenience, or clear it? User might want to reply multiple times.
        // Let's keep it.
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #DE7AD6 0%, #E6E6FA 100%)',
      zIndex: 100,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '"Ma Shan Zheng", cursive, sans-serif'
    }}>
      {/* Dynamic Background Decorations */}
      {decorations.map((item, index) => (
        <motion.div
          key={index}
          style={{
            position: 'absolute',
            top: item.top,
            left: item.left,
            width: item.size,
            height: item.size,
            borderRadius: '50%',
            background: item.color,
            filter: 'blur(40px)',
            opacity: 0.6,
            zIndex: 0
          }}
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 8 + index * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: item.delay,
          }}
        />
      ))}

      {/* Header & Search */}
      <div style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        {showReturn && (
          <button
            onClick={() => {
              localStorage.removeItem('fromMemoryMode');
              onReturnToMemory && onReturnToMemory();
            }}
            style={{
              position: 'fixed',
              top: '16px',
              right: '16px',
              zIndex: 1000,
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: 'rgba(255,255,255,0.85)',
              color: '#DE7AD6',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(6px)'
            }}
          >
            返回回忆
          </button>
        )}
        {/* Placeholder for left side to balance the layout */}
        <div style={{ width: '120px' }}></div>

        {/* Center Content: Title + Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', transform: 'translateX(-290px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <h1 style={{ 
                    margin: 0, 
                    color: '#fff', 
                    fontSize: '42px', 
                    fontWeight: '500', 
                    fontFamily: '"Brush Script MT", "Segoe Script", cursive',
                    letterSpacing: '2px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    lineHeight: '1.1'
                }}>
                    Our Story
                </h1>
                <p style={{ 
                    margin: '4px 0 0 4px', 
                    color: 'rgba(255,255,255,0.95)', 
                    fontSize: '13px', 
                    letterSpacing: '1px',
                    fontWeight: '400',
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                    在这里珍藏成长的足迹，书写属于你们的故事
                </p>
            </div>
            <div style={{
                position: 'relative',
                width: '300px'
            }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#fff', opacity: 0.8 }} />
                <input 
                    type="text" 
                    placeholder="搜索日期、关键词、作者..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px 12px 8px 40px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        outline: 'none',
                        fontSize: '14px'
                    }}
                />
            </div>
        </div>
        
        {/* Right Action Button */}
        <button 
            onClick={() => {
                setCurrentStory(null);
                setFormData({
                    date: selectedDate,
                    title: '',
                    content: '',
                    author: '',
                    tags: '',
                    mood: '#FFB7B2',
                    bgColor: '#ffffff',
                    type: 'note'
                });
                setShowModal(true);
            }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 20px',
                borderRadius: '20px',
                border: 'none',
                background: 'rgba(255,255,255,0.3)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '16px',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s',
                transform: 'translateX(-360px)'
            }}
        >
            <Plus size={18} /> 写故事
        </button>
      </div>

      {/* Timeline Axis */}
      <div style={{
        height: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Navigation Arrows */}
        <button 
            onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split('T')[0]);
            }}
            style={{ position: 'absolute', left: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
            <ChevronLeft size={32} />
        </button>
        <button 
            onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
            }}
            style={{ position: 'absolute', right: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
            <ChevronRight size={32} />
        </button>

        {/* Date Axis */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
            {timelineDates.map((date, index) => {
                const isSelected = date === selectedDate;
                const d = new Date(date);
                const day = d.getDate();
                const month = d.getMonth() + 1;
                const isToday = date === new Date().toISOString().split('T')[0];

                return (
                    <motion.div
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        animate={{ 
                            scale: isSelected ? 1.2 : 0.9,
                            opacity: isSelected ? 1 : 0.6,
                            y: isSelected ? -5 : 0
                        }}
                        style={{
                            cursor: 'pointer',
                            textAlign: 'center',
                            color: '#fff',
                            position: 'relative'
                        }}
                    >
                        <div style={{ fontSize: '12px', marginBottom: '4px' }}>{month}月</div>
                        <div style={{ 
                            fontSize: '24px', 
                            fontWeight: 'bold',
                            width: '40px',
                            height: '40px',
                            lineHeight: '40px',
                            borderRadius: '50%',
                            background: isSelected ? 'rgba(255,255,255,0.3)' : 'transparent',
                            backdropFilter: isSelected ? 'blur(5px)' : 'none'
                        }}>
                            {day}
                        </div>
                        {isToday && <div style={{ fontSize: '10px', marginTop: '4px' }}>今天</div>}
                        {/* Dot indicator if stories exist for this date */}
                        {stories.some(s => s.date === date) && (
                            <div style={{
                                width: '6px',
                                height: '6px',
                                background: '#FF6B9C',
                                borderRadius: '50%',
                                margin: '4px auto 0'
                            }} />
                        )}
                    </motion.div>
                );
            })}
        </div>
      </div>

      {/* Content Area (Waterfall / Grid) */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '40px',
        zIndex: 10
      }}>
        {loading ? (
            <div style={{ textAlign: 'center', color: '#fff', marginTop: '100px' }}>Loading...</div>
        ) : filteredStories.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginTop: '100px', fontSize: '18px' }}>
                {searchTerm ? '未找到相关故事' : '这一天还没有记录故事...'}
            </div>
        ) : (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '30px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <AnimatePresence>
                    {filteredStories.map((story, index) => (
                        <motion.div
                            key={story.id}
                            layoutId={story.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5, rotate: story.type === 'heart' ? 2 : 0 }}
                            style={{
                                background: story.type === 'heart' 
                                    ? `linear-gradient(135deg, ${story.mood}22 0%, ${story.bgColor || '#fff'} 100%)` 
                                    : (story.bgColor || '#fff'),
                                borderRadius: story.type === 'heart' ? '24px' : '20px', 
                                padding: '24px',
                                position: 'relative',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden', // Clip the large heart
                                border: story.type === 'heart' ? `2px solid ${story.mood}` : 'none'
                            }}
                            onClick={() => setExpandedStory(story)}
                        >
                            {/* Paperclip Decoration */}
                            {story.type === 'note' && (
                                <div 
                                    style={{
                                        position: 'absolute',
                                        top: '-15px',
                                        left: '20px',
                                        color: '#888',
                                        transform: 'rotate(-15deg)',
                                        zIndex: 5
                                    }}
                                >
                                    <Paperclip size={32} />
                                </div>
                            )}

                            {/* Edit/Delete Actions Top Right */}
                            {story.type === 'note' && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    display: 'flex',
                                    gap: '8px',
                                    zIndex: 10
                                }}>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEdit(story);
                                        }}
                                        style={{
                                            padding: '6px',
                                            borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.05)',
                                            color: '#666',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                        title="编辑"
                                    >
                                        <Edit2 size={14} />
                                    </div>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(story.id);
                                        }}
                                        style={{
                                            padding: '6px',
                                            borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.05)',
                                            color: '#ff4d4f',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                        title="删除"
                                    >
                                        <Trash2 size={14} />
                                    </div>
                                </div>
                            )}

                            {/* Heart Decoration (Background Watermark) */}
                            {story.type === 'heart' && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-20px',
                                    right: '-20px',
                                    opacity: 0.1,
                                    zIndex: 0,
                                    transform: 'rotate(-15deg)'
                                }}>
                                    <Heart fill={story.mood} color={story.mood} size={180} />
                                </div>
                            )}
                            
                            {/* Small Heart Icon Top Right */}
                            {story.type === 'heart' && (
                                <div 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openEdit(story);
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px',
                                        zIndex: 1,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Heart fill={story.mood} color={story.mood} size={24} />
                                </div>
                            )}

                            <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
                                {story.date}
                            </div>
                            
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#333', position: 'relative', zIndex: 1 }}>
                                {story.title}
                            </h3>
                            
                            <p style={{ 
                                flex: 1, 
                                margin: 0, 
                                color: '#555', 
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap',
                                fontSize: '15px',
                                position: 'relative', 
                                zIndex: 1
                            }}>
                                {story.content}
                            </p>

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#999', position: 'relative', zIndex: 1 }}>
                                <span>From: {story.author}</span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {story.tags && story.tags.split(' ').map((tag, i) => (
                                        <span key={i} style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px' }}>#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        )}
      </div>

      {/* Edit/Create Modal - Side Drawer Style */}
      <AnimatePresence>
        {showModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(240, 242, 245, 0.8)', // Light neutral background
                    backdropFilter: 'blur(8px)',
                    zIndex: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Ma Shan Zheng", cursive, sans-serif'
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) setShowModal(false);
                }}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    style={{
                        width: '90%',
                        maxWidth: '1000px',
                        height: '85vh',
                        background: 'transparent',
                        display: 'flex',
                        gap: '24px',
                        position: 'relative'
                    }}
                >
                    {/* Main Editor Area (60% weight) */}
                    <div style={{
                        flex: '1 1 60%',
                        background: formData.bgColor || '#fff', // Apply selected background color
                        borderRadius: '24px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative',
                        transition: 'background 0.3s ease'
                    }}>
                        {/* Top Bar */}
                        <div style={{
                            padding: '16px 32px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                             <button 
                                onClick={() => setShowModal(false)}
                                style={{ 
                                    border: 'none', 
                                    background: 'none', 
                                    cursor: 'pointer',
                                    color: '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '14px',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            >
                                <ChevronLeft size={16} /> 返回
                            </button>
                            <div style={{ fontSize: '12px', color: '#aaa' }}>
                                {currentStory ? '编辑模式' : '创作模式'}
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {currentStory && (
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            handleDelete(currentStory.id);
                                            setShowModal(false);
                                        }}
                                        style={{ 
                                            padding: '8px 16px', 
                                            borderRadius: '12px', 
                                            border: 'none', 
                                            background: '#fff1f0', 
                                            color: '#ff4d4f',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        删除
                                    </button>
                                )}
                                <button 
                                    onClick={handleSubmit}
                                    style={{ 
                                        padding: '8px 24px', 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        background: 'linear-gradient(135deg, #DE7AD6 0%, #B2EBF2 100%)', 
                                        color: '#fff', 
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        boxShadow: '0 4px 12px rgba(222, 122, 214, 0.2)'
                                    }}
                                >
                                    {currentStory ? '保存' : '发布'}
                                </button>
                            </div>
                        </div>

                        {/* Editor Content */}
                        <div style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
                            <input 
                                type="text" 
                                placeholder="无标题" 
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                style={{
                                    width: '100%',
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#222',
                                    marginBottom: '12px',
                                    background: 'transparent',
                                    fontFamily: '"Ma Shan Zheng", cursive'
                                }}
                            />
                            <div style={{ 
                                width: '48px', 
                                height: '4px', 
                                background: formData.mood || '#DE7AD6', 
                                borderRadius: '2px', 
                                marginBottom: '32px',
                                opacity: 0.8
                            }} />
                            <textarea 
                                placeholder="写下那一刻的点点滴滴..."
                                value={formData.content}
                                onChange={e => setFormData({...formData, content: e.target.value})}
                                style={{ 
                                    width: '100%', 
                                    minHeight: '400px',
                                    border: 'none', 
                                    outline: 'none', 
                                    resize: 'none',
                                    fontSize: '18px',
                                    lineHeight: '2',
                                    color: '#444',
                                    background: 'transparent',
                                    fontFamily: '"Ma Shan Zheng", cursive'
                                }}
                            />
                        </div>
                    </div>

                    {/* Right Drawer (40% weight) */}
                    <div style={{
                        flex: '0 0 320px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {/* Info Panel 1: Basics */}
                        <div style={{
                            background: '#fff',
                            borderRadius: '20px',
                            padding: '20px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: '13px', color: '#999', marginBottom: '16px', fontWeight: 'bold' }}>基础信息</div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#666' }}>日期</label>
                                <input 
                                    type="date" 
                                    value={formData.date}
                                    onChange={e => setFormData({...formData, date: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#fafafa', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#666' }}>撰写人</label>
                                <input 
                                    type="text" 
                                    placeholder="你的名字"
                                    value={formData.author}
                                    onChange={e => setFormData({...formData, author: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#fafafa', outline: 'none' }}
                                />
                            </div>
                        </div>

                        {/* Info Panel 2: Tags & Mood */}
                        <div style={{
                            background: '#fff',
                            borderRadius: '20px',
                            padding: '20px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: '13px', color: '#999', marginBottom: '16px', fontWeight: 'bold' }}>标签与心情</div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#666' }}>标签</label>
                                <input 
                                    type="text" 
                                    placeholder="相遇 纪念日..."
                                    value={formData.tags}
                                    onChange={e => setFormData({...formData, tags: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #eee', background: '#fafafa', outline: 'none' }}
                                />
                            </div>
                            
                            <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px', color: '#666' }}>背景颜色</label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                                {[
                                    '#ffffff', // 纯白
                                    '#FFF0F5', // 薰衣草红
                                    '#F0FFF0', // 蜜瓜绿
                                    '#F0F8FF', // 爱丽丝蓝
                                    '#FFF8DC', // 玉米丝色
                                    '#F5F5DC', // 米色
                                    '#E6E6FA', // 淡紫
                                    '#FAFAFA'  // 雪白
                                ].map(color => (
                                    <div 
                                        key={color}
                                        onClick={() => setFormData({...formData, bgColor: color})}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '4px',
                                            background: color,
                                            cursor: 'pointer',
                                            border: formData.bgColor === color ? '2px solid #666' : '1px solid #eee',
                                            transition: 'transform 0.2s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        title={color}
                                    />
                                ))}
                            </div>

                            <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px', color: '#666' }}>心情色调</label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {[
                                    '#FFB7B2', // 柔粉
                                    '#FFDAC1', // 蜜桃
                                    '#FFF9C4', // 鹅黄
                                    '#C8E6C9', // 薄荷
                                    '#B2EBF2', // 天青
                                    '#A7C7E7', // 雾霾蓝
                                    '#E1BEE7', // 薰衣草
                                    '#D7CCC8'  // 奶咖
                                ].map(color => (
                                    <div 
                                        key={color}
                                        onClick={() => setFormData({...formData, mood: color})}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: color,
                                            cursor: 'pointer',
                                            border: formData.mood === color ? '2px solid #666' : '2px solid transparent',
                                            transition: 'transform 0.2s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Info Panel 3: Style Type */}
                        <div style={{
                            background: '#fff',
                            borderRadius: '20px',
                            padding: '20px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ fontSize: '13px', color: '#999', marginBottom: '16px', fontWeight: 'bold' }}>展示样式</div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div 
                                    onClick={() => setFormData({...formData, type: 'note'})}
                                    style={{ 
                                        flex: 1,
                                        padding: '12px', 
                                        borderRadius: '12px', 
                                        border: formData.type === 'note' ? '2px solid #DE7AD6' : '1px solid #f0f0f0',
                                        background: formData.type === 'note' ? '#fff9fc' : '#fff',
                                        color: formData.type === 'note' ? '#DE7AD6' : '#666',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Paperclip size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> 便签
                                </div>
                                <div 
                                    onClick={() => setFormData({...formData, type: 'heart'})}
                                    style={{ 
                                        flex: 1,
                                        padding: '12px', 
                                        borderRadius: '12px', 
                                        border: formData.type === 'heart' ? '2px solid #DE7AD6' : '1px solid #f0f0f0',
                                        background: formData.type === 'heart' ? '#fff9fc' : '#fff',
                                        color: formData.type === 'heart' ? '#DE7AD6' : '#666',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Heart size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> 心形
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Story View */}
      <AnimatePresence>
        {expandedStory && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) setExpandedStory(null);
                }}
            >
                <motion.div
                    layoutId={expandedStory.id}
                    style={{
                        background: expandedStory.type === 'heart' 
                            ? `linear-gradient(135deg, ${expandedStory.mood}11 0%, ${expandedStory.bgColor || '#fff'} 100%)` 
                            : (expandedStory.bgColor || '#fff'),
                        width: '100%',
                        maxWidth: '700px',
                        height: '85vh',
                        borderRadius: '24px',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}
                >
                    {/* Close Button */}
                    <button 
                        onClick={() => setExpandedStory(null)}
                        style={{ 
                            position: 'absolute', 
                            top: '20px', 
                            right: '20px', 
                            zIndex: 10,
                            background: 'rgba(255,255,255,0.8)',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        <X size={24} color="#666" />
                    </button>

                    {/* Scrollable Content Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '50px 60px' }}>
                        
                        {/* Header Section */}
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{ fontSize: '14px', color: '#999', marginBottom: '10px', letterSpacing: '1px' }}>
                                {expandedStory.date} · {expandedStory.author}
                            </div>
                            <h1 style={{ 
                                fontSize: '32px', 
                                color: '#333', 
                                margin: '0 0 20px 0',
                                fontFamily: '"Ma Shan Zheng", cursive',
                                fontWeight: 'normal'
                            }}>
                                {expandedStory.title}
                            </h1>
                            <div style={{ width: '40px', height: '3px', background: expandedStory.mood || '#DE7AD6', margin: '0 auto', borderRadius: '2px', opacity: 0.5 }} />
                        </div>

                        {/* Story Content */}
                        <div style={{ 
                            fontSize: '18px', 
                            lineHeight: '2.2', 
                            color: '#444', 
                            whiteSpace: 'pre-wrap',
                            textAlign: 'justify',
                            fontFamily: '"Ma Shan Zheng", cursive' // Keeping the handwriting style
                        }}>
                            {expandedStory.content}
                        </div>

                        {/* Divider */}
                        <div style={{ 
                            margin: '80px 0 40px', 
                            borderTop: '1px dashed #ddd',
                            position: 'relative',
                            textAlign: 'center'
                        }}>
                            <span style={{ 
                                background: '#fff', 
                                padding: '0 15px', 
                                position: 'relative', 
                                top: '-12px',
                                color: '#aaa',
                                fontSize: '14px'
                            }}>
                                <MessageCircle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                留言区
                            </span>
                        </div>

                        {/* Comments List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
                            {expandedStory.comments && expandedStory.comments.length > 0 ? (
                                expandedStory.comments.map((comment, idx) => (
                                    <div key={idx} style={{ 
                                        padding: '20px', 
                                        background: '#fcfcfc', 
                                        borderRadius: '16px',
                                        fontSize: '14px',
                                        border: '1px solid #f0f0f0'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#999', fontSize: '12px' }}>
                                            <span>{comment.author || 'Anonymous'}</span>
                                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ color: '#555', lineHeight: '1.6', fontSize: '15px' }}>
                                            {comment.content}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', color: '#ccc', fontStyle: 'italic', padding: '20px' }}>
                                    还没有留言，写下第一条回应吧...
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Comment Input Area (Fixed at bottom) */}
                    <div style={{ 
                        padding: '20px 40px', 
                        background: '#fff', 
                        borderTop: '1px solid #f5f5f5',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center'
                    }}>
                        <input 
                            type="text" 
                            placeholder="你的名字" 
                            value={commentAuthor}
                            onChange={e => setCommentAuthor(e.target.value)}
                            style={{
                                width: '100px',
                                padding: '14px 16px',
                                borderRadius: '30px',
                                border: '1px solid #eee',
                                background: '#f8f8f8',
                                outline: 'none',
                                fontSize: '14px',
                                transition: 'all 0.2s',
                                textAlign: 'center'
                            }}
                            onFocus={(e) => e.target.style.background = '#fff'}
                            onBlur={(e) => e.target.style.background = '#f8f8f8'}
                        />
                        <input 
                            type="text" 
                            placeholder="写下你的回应..." 
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(e)}
                            style={{
                                flex: 1,
                                padding: '14px 24px',
                                borderRadius: '30px',
                                border: '1px solid #eee',
                                background: '#f8f8f8',
                                outline: 'none',
                                fontSize: '15px',
                                transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.background = '#fff'}
                            onBlur={(e) => e.target.style.background = '#f8f8f8'}
                        />
                        <button 
                            onClick={handleCommentSubmit}
                            disabled={!commentText.trim()}
                            style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                border: 'none',
                                background: commentText.trim() ? '#DE7AD6' : '#f0f0f0',
                                color: '#fff',
                                cursor: commentText.trim() ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                boxShadow: commentText.trim() ? '0 4px 12px rgba(222, 122, 214, 0.3)' : 'none'
                            }}
                        >
                            <Send size={22} />
                        </button>
                    </div>

                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MorningDusk;

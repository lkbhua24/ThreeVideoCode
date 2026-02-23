import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Calendar, Paperclip, Heart, X, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const MorningDusk = () => {
  // State
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [currentStory, setCurrentStory] = useState(null); // For editing
  const [timelineDates, setTimelineDates] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    content: '',
    author: '',
    tags: '',
    mood: '#FFB7B2',
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
                                    ? `linear-gradient(135deg, ${story.mood} 0%, #fff 100%)`
                                    : '#fff',
                                borderRadius: story.type === 'heart' ? '30px 30px 4px 30px' : '20px', // Round-smooth square or heart-ish
                                padding: '24px',
                                position: 'relative',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                minHeight: '200px',
                                display: 'flex',
                                flexDirection: 'column',
                                clipPath: story.type === 'heart' 
                                    ? 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")' // SVG path for heart shape? No, clip-path is tricky for content. 
                                    // Let's use border-radius trick for "smooth round square" as requested default.
                                    : '20px'
                            }}
                            onClick={() => openEdit(story)}
                        >
                            {/* Paperclip Decoration */}
                            {story.type === 'note' && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-15px',
                                    left: '20px',
                                    color: '#888',
                                    transform: 'rotate(-15deg)',
                                    zIndex: 5
                                }}>
                                    <Paperclip size={32} />
                                </div>
                            )}

                            {/* Heart Decoration */}
                            {story.type === 'heart' && (
                                <motion.div 
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        color: '#fff',
                                        opacity: 0.8
                                    }}
                                >
                                    <Heart fill="#fff" size={24} />
                                </motion.div>
                            )}

                            <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
                                {story.date}
                            </div>
                            
                            <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#333' }}>
                                {story.title}
                            </h3>
                            
                            <p style={{ 
                                flex: 1, 
                                margin: 0, 
                                color: '#555', 
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap',
                                fontSize: '15px'
                            }}>
                                {story.content}
                            </p>

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#999' }}>
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

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {showModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={(e) => {
                    if (e.target === e.currentTarget) setShowModal(false);
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    style={{
                        background: '#fff',
                        width: '90%',
                        maxWidth: '500px',
                        borderRadius: '24px',
                        padding: '30px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                        position: 'relative'
                    }}
                >
                    <button 
                        onClick={() => setShowModal(false)}
                        style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                        <X size={24} color="#999" />
                    </button>

                    <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
                        {currentStory ? '编辑故事' : '写一段故事'}
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#666' }}>日期</label>
                            <input 
                                type="date" 
                                required
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#666' }}>标题</label>
                            <input 
                                type="text" 
                                required
                                placeholder="给故事起个名字..."
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#666' }}>内容</label>
                            <textarea 
                                required
                                rows={5}
                                placeholder="写下那一刻的点点滴滴..."
                                value={formData.content}
                                onChange={e => setFormData({...formData, content: e.target.value})}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', resize: 'none' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#666' }}>撰写人</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="你的名字"
                                    value={formData.author}
                                    onChange={e => setFormData({...formData, author: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#666' }}>标签 (空格分隔)</label>
                                <input 
                                    type="text" 
                                    placeholder="相遇 纪念日..."
                                    value={formData.tags}
                                    onChange={e => setFormData({...formData, tags: e.target.value})}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#666' }}>样式风格</label>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div 
                                    onClick={() => setFormData({...formData, type: 'note'})}
                                    style={{ 
                                        padding: '10px 20px', 
                                        borderRadius: '8px', 
                                        border: formData.type === 'note' ? '2px solid #DE7AD6' : '1px solid #ddd',
                                        background: '#fff',
                                        cursor: 'pointer',
                                        flex: 1,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Paperclip size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 便签
                                </div>
                                <div 
                                    onClick={() => setFormData({...formData, type: 'heart'})}
                                    style={{ 
                                        padding: '10px 20px', 
                                        borderRadius: '8px', 
                                        border: formData.type === 'heart' ? '2px solid #DE7AD6' : '1px solid #ddd',
                                        background: '#fff',
                                        cursor: 'pointer',
                                        flex: 1,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Heart size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 心形
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                            <button 
                                type="submit"
                                style={{ 
                                    flex: 1, 
                                    padding: '12px', 
                                    borderRadius: '12px', 
                                    border: 'none', 
                                    background: 'linear-gradient(135deg, #DE7AD6 0%, #B2EBF2 100%)', 
                                    color: '#fff', 
                                    fontWeight: 'bold',
                                    cursor: 'pointer' 
                                }}
                            >
                                {currentStory ? '保存修改' : '发布故事'}
                            </button>
                            
                            {currentStory && (
                                <button 
                                    type="button"
                                    onClick={() => {
                                        handleDelete(currentStory.id);
                                        setShowModal(false);
                                    }}
                                    style={{ 
                                        padding: '12px', 
                                        borderRadius: '12px', 
                                        border: '1px solid #ff4d4f', 
                                        background: '#fff', 
                                        color: '#ff4d4f',
                                        cursor: 'pointer' 
                                    }}
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MorningDusk;

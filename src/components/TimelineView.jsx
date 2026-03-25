import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TimelineView = ({ memories, onSelect, onOpenStories }) => {
  const [storiesByDate, setStoriesByDate] = useState({});
  const [expandedDate, setExpandedDate] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDate, setConfirmDate] = useState(null);
  const [globalComposerOpen, setGlobalComposerOpen] = useState(false);
  const [globalSaving, setGlobalSaving] = useState(false);
  const [globalFormData, setGlobalFormData] = useState({
    date: '',
    title: '',
    content: '',
    author: '',
    tags: '',
    mood: '#FFB7B2',
    type: 'note'
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/stories');
        const data = await res.json();
        const map = {};
        data.forEach(s => {
          const d = s.date;
          if (!map[d]) map[d] = [];
          map[d].push(s);
        });
        setStoriesByDate(map);
      } catch (e) {
        console.error("Failed to fetch stories", e);
      }
    })();
  }, []);

  useEffect(() => {
    setConfirmOpen(false);
    setConfirmDate(null);
  }, [expandedDate]);

  const handleSaveStoryGlobal = async () => {
    if (!globalFormData.date || !globalFormData.title.trim() || !globalFormData.content.trim()) return;
    setGlobalSaving(true);
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(globalFormData)
      });
      if (res.ok) {
        const created = await res.json();
        const date = created.date;
        setStoriesByDate(prev => {
          const arr = prev[date] ? [...prev[date]] : [];
          arr.unshift(created);
          return { ...prev, [date]: arr };
        });
        setGlobalComposerOpen(false);
        try { localStorage.removeItem(`storyDraft-global-${date}`); } catch {}
        setGlobalFormData({ date: '', title: '', content: '', author: '', tags: '', mood: '#FFB7B2', type: 'note' });
        try { localStorage.setItem('selectedStoryDate', date); } catch {}
      }
    } finally {
      setGlobalSaving(false);
    }
  };

  // Group memories by date (YYYY-MM-DD)
  const groupedMemories = useMemo(() => {
    const groups = {};
    memories.forEach(memory => {
      const date = memory.date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(memory);
    });
    // Sort dates descending
    return Object.keys(groups)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(date => ({
        date,
        items: groups[date]
      }));
  }, [memories]);

  return (
    <div style={{
      width: '100%',
      height: '100vh',
      overflowY: 'auto',
      padding: '100px 20px 40px',
      boxSizing: 'border-box'
    }}>
      <button
        onClick={() => {
          setGlobalComposerOpen(true);
          const firstDate = groupedMemories[0]?.date || new Date().toISOString().split('T')[0];
          setGlobalFormData(g => ({ ...g, date: g.date || firstDate }));
        }}
        style={{
          position: 'fixed',
          top: '16px',
          right: '66px',
          zIndex: 1000,
          padding: '10px 16px',
          borderRadius: '18px',
          border: 'none',
          background: 'linear-gradient(135deg, #DE7AD6 0%, #FF6B9C 100%)',
          color: '#fff',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 8px 18px rgba(222,122,214,0.35)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #DE7AD6 0%, #FF8EC0 100%)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(222,122,214,0.45)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #DE7AD6 0%, #FF6B9C 100%)';
          e.currentTarget.style.boxShadow = '0 8px 18px rgba(222,122,214,0.35)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        续写故事
      </button>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {groupedMemories.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '100px' }}>
            暂无回忆，请添加媒体文件
          </div>
        ) : (
          groupedMemories.map((group, index) => (
            <motion.div
              key={group.date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ marginBottom: '40px', position: 'relative' }}
            >
              {/* Timeline Line */}
              <div style={{
                position: 'absolute',
                left: '-20px',
                top: '0',
                bottom: '-40px',
                width: '2px',
                backgroundColor: '#FF6B9C',
                opacity: 0.3
              }} />

              {/* Date Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '20px',
                position: 'relative' 
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#FF6B9C',
                  position: 'absolute',
                  left: '-25px'
                }} />
                
                {/* Today's Story Button */}
                <button
                  onClick={() => setExpandedDate(expandedDate === group.date ? null : group.date)}
                  style={{
                    marginRight: '12px',
                    padding: '8px 14px',
                    borderRadius: '18px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #DE7AD6 0%, #FF6B9C 100%)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                    boxShadow: '0 6px 14px rgba(222,122,214,0.35)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #DE7AD6 0%, #FF8EC0 100%)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(222,122,214,0.45)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #DE7AD6 0%, #FF6B9C 100%)';
                    e.currentTarget.style.boxShadow = '0 6px 14px rgba(222,122,214,0.35)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <span>✨</span>
                  今日故事
                  {storiesByDate[group.date] && storiesByDate[group.date].length > 0 && (
                    <span style={{ 
                      background: '#DE7AD6', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: '16px', 
                      height: '16px', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '10px',
                      marginLeft: '4px'
                    }}>
                      {storiesByDate[group.date].length}
                    </span>
                  )}
                </button>

                <h2 style={{ 
                  margin: 0, 
                  color: '#333', 
                  fontSize: '24px',
                  fontWeight: '600'
                }}>
                  {group.date}
                </h2>
              </div>

              {/* Stories Expansion Area */}
              <AnimatePresence>
                {expandedDate === group.date && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ position: 'absolute', left: '-360px', top: '0', width: '320px', overflow: 'hidden', marginBottom: '20px', zIndex: 5 }}
                  >
                    {/* Stories List */}
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '20px',
                      padding: '10px 0'
                    }}>
                      {(!storiesByDate[group.date] || storiesByDate[group.date].length === 0) && (
                        <div style={{ 
                          width: '100%', 
                          padding: '8px 12px', 
                          borderRadius: '8px',
                          background: '#fff6fb',
                          color: '#DE7AD6',
                          fontSize: '12px'
                        }}>
                          这一天还没有故事，点击右上角“续写故事”
                        </div>
                      )}
                      {(storiesByDate[group.date] || []).map(s => (
                        <motion.div 
                          key={s.id} 
                          onClick={() => { setConfirmDate(group.date); setConfirmOpen(true); }} 
                          whileHover={{ scale: 1.05, rotate: s.type === 'heart' ? 2 : 0 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ 
                            width: '200px',
                            height: '180px',
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {/* Shape Background */}
                          {s.type === 'note' ? (
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              left: '15px',
                              width: '170px',
                              height: '160px',
                              backgroundColor: s.mood || '#FFB7B2',
                              borderRadius: '4px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                              transform: 'rotate(-2deg)'
                            }} />
                          ) : (
                            <svg viewBox="0 0 24 24" style={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              width: '100%', 
                              height: '100%', 
                              fill: s.mood || '#FFB7B2',
                              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                            }}>
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          )}
                          
                          {/* Content */}
                          <div style={{ 
                            position: 'relative', 
                            zIndex: 1, 
                            textAlign: 'center', 
                            padding: s.type === 'note' ? '30px 24px' : '30px',
                            color: '#fff',
                            width: '100%',
                            height: '100%',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden'
                          }}>
                            <h3 style={{ 
                              margin: '0 0 8px 0', 
                              fontSize: '16px', 
                              fontWeight: 'bold',
                              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                              fontFamily: '"Ma Shan Zheng", cursive',
                              width: '100%',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {s.title}
                            </h3>
                            <p style={{ 
                              margin: 0, 
                              fontSize: '12px', 
                              opacity: 0.9,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: '1.4'
                            }}>
                              {s.content}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    

                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '16px'
              }}>
                {group.items.map(memory => (
                  <motion.div
                    key={memory.id}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(memory)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backgroundColor: 'white',
                      position: 'relative'
                    }}
                  >
                    {memory.type === 'video' ? (
                      <video 
                        src={`${memory.url}#t=0.001`} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          pointerEvents: 'none'
                        }} 
                        preload="metadata"
                        muted
                        playsInline
                      />
                    ) : memory.thumbnail ? (
                      <img 
                        src={memory.thumbnail} 
                        alt={memory.name}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        backgroundColor: '#f5f5f5'
                      }}>
                        {getFileIcon(memory.type)}
                      </div>
                    )}
                    
                    {/* Type Badge */}
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.5)',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      color: 'white',
                      fontSize: '10px'
                    }}>
                      {memory.type.toUpperCase()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
      <AnimatePresence>
        {globalComposerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(6px)',
              zIndex: 9998,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setGlobalComposerOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              style={{
                background: '#fff',
                width: '92%',
                maxWidth: '520px',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                position: 'relative'
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                style={{
                  position: 'absolute',
                  left: '-240px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  background: 'linear-gradient(135deg, #DE7AD6 0%, #FF6B9C 100%)',
                  color: '#fff',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  boxShadow: '0 8px 18px rgba(222,122,214,0.35)',
                  maxWidth: '220px',
                  textAlign: 'right',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                  opacity: 0.95
                }}
              >
                在这里写下你对当天的感悟吧
              </motion.div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '12px', marginBottom: '12px' }}>
                <select
                  value={globalFormData.date}
                  onChange={e => setGlobalFormData({ ...globalFormData, date: e.target.value })}
                  style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                >
                  {groupedMemories.map(g => (
                    <option key={g.date} value={g.date}>{g.date}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="作者"
                    value={globalFormData.author}
                    onChange={e => setGlobalFormData({ ...globalFormData, author: e.target.value })}
                    style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                  <input
                    type="color"
                    value={globalFormData.mood}
                    onChange={e => setGlobalFormData({ ...globalFormData, mood: e.target.value })}
                    title="心情色"
                    style={{ width: '44px', height: '44px', padding: 0, border: '1px solid #ddd', borderRadius: '8px' }}
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="标题"
                value={globalFormData.title}
                onChange={e => setGlobalFormData({ ...globalFormData, title: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '12px' }}
              />
              <textarea
                rows={4}
                placeholder="写下此刻的感受，与照片相互呼应..."
                value={globalFormData.content}
                onChange={e => setGlobalFormData({ ...globalFormData, content: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '12px' }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setGlobalComposerOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: '#fff',
                    color: '#666',
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveStoryGlobal}
                  disabled={globalSaving}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#DE7AD6',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {globalSaving ? '保存中...' : '保存到故事页'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <div style={{ width: '520px', maxWidth: '92%', background: '#ffffff', border: '2px solid #DE7AD6', borderRadius: '28px', boxShadow: '0 16px 48px rgba(0,0,0,0.2)', padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DE7AD6', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                <span style={{ width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BearIcon size={28} />
                </span>
                <span>轻松熊熊哥提醒你:</span>
              </div>
              <div style={{ color: '#DE7AD6', fontSize: '16px', margin: '6px 0 14px', textAlign: 'center' }}>
                确认进入我们的故事吗？
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => { 
                    setConfirmOpen(false); 
                    const d = confirmDate || expandedDate;
                    onOpenStories && onOpenStories(d);
                  }}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#DE7AD6',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  即刻出发
                </button>
                <button
                  onClick={() => setConfirmOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    border: '1px solid #ddd',
                    background: '#fff',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  酝酿爱意
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getFileIcon(type) {
  switch (type) {
    case 'video': return '🎥';
    case 'image': return '🖼️';
    case 'audio': return '🎵';
    default: return '📄';
  }
}

export default TimelineView;
 
function BearIcon({ size = 28 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="22" fill="#A86A2C" />
      <circle cx="18" cy="18" r="9" fill="#A86A2C" />
      <circle cx="46" cy="18" r="9" fill="#A86A2C" />
      <circle cx="18" cy="18" r="5.5" fill="#F7D14E" />
      <circle cx="46" cy="18" r="5.5" fill="#F7D14E" />
      <circle cx="24" cy="30" r="2.5" fill="#2E1B10" />
      <circle cx="40" cy="30" r="2.5" fill="#2E1B10" />
      <ellipse cx="32" cy="37" rx="12" ry="10" fill="#FFFFFF" />
      <circle cx="32" cy="35" r="3" fill="#2E1B10" />
      <path d="M28 39 Q32 42 36 39 Q36 43 32 44 Q28 43 28 39 Z" fill="#E04B3E" />
      <circle cx="24" cy="46" r="6.5" fill="#A86A2C" />
      <circle cx="40" cy="46" r="6.5" fill="#A86A2C" />
    </svg>
  );
}

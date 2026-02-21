import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const TimelineView = ({ memories, onSelect }) => {
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
                <h2 style={{ 
                  margin: 0, 
                  color: '#333', 
                  fontSize: '24px',
                  fontWeight: '600'
                }}>
                  {group.date}
                </h2>
              </div>

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
                    {memory.thumbnail ? (
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

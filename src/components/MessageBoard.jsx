import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const initialMessages = [
  {
    id: 1,
    nickname: 'LkbHua',
    avatar: '🐻',
    content: 'Meeting you was the best thing ever!',
    time: '26/2/21 10:23',
    color: '#35BC68', // Light green
    image: null
  },
  {
    id: 2,
    nickname: 'ZengQ',
    avatar: '🐰',
    content: 'Every moment with you is precious.',
    time: '26/2/21 14:05',
    color: '#46579D', // Light blue
    image: null
  },
  {
    id: 3,
    nickname: 'LkbHua',
    avatar: '🐻',
    content: 'Cannot wait for our next adventure!',
    time: '26/2/21 09:15',
    color: '#83728D', // Light purple
    image: null
  }
];

const MessageBoard = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id of message to confirm delete
  const [editingNicknameId, setEditingNicknameId] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simple compression/resizing logic
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          // Resize to max width 300px to simulate compression
          const maxWidth = 300;
          const scale = maxWidth / img.width;
          
          if (scale < 1) {
            canvas.width = maxWidth;
            canvas.height = img.height * scale;
          } else {
            canvas.width = img.width;
            canvas.height = img.height;
          }
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Compress quality to 0.7
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setSelectedImage(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMessage = () => {
    if (!newMessage.trim() && !selectedImage) return;
    
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    const timeString = `${yy}/${m}/${d} ${hh}:${mm}`;
    
    const newMsg = {
      id: Date.now(),
      nickname: 'LkbHua', // Default nickname
      avatar: '✨', // Default avatar
      content: newMessage,
      time: timeString,
      color: ['#35BC68', '#46579D', '#83728D'][Math.floor(Math.random() * 3)],
      image: selectedImage
    };
    
    setMessages([newMsg, ...messages]);
    setNewMessage('');
    setSelectedImage(null);
    setIsAddMode(false);
  };

  const handleNicknameChange = (id, newNickname) => {
    if (!newNickname.trim()) return;
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, nickname: newNickname } : msg
    ));
    setEditingNicknameId(null);
  };

  const moveMessage = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newMessages = [...messages];
      [newMessages[index - 1], newMessages[index]] = [newMessages[index], newMessages[index - 1]];
      setMessages(newMessages);
    } else if (direction === 'down' && index < messages.length - 1) {
      const newMessages = [...messages];
      [newMessages[index + 1], newMessages[index]] = [newMessages[index], newMessages[index + 1]];
      setMessages(newMessages);
    }
  };

  const handleDeleteRequest = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    setMessages(messages.filter(m => m.id !== deleteConfirm));
    setDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      style={{
        position: 'absolute',
        top: '450px', // Positioned below the 300px height clock + 130px top + 20px gap
        right: '24px', // Aligned with the clock
        width: '355px', // Consistent with clock width
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(12px)',
        borderRadius: '30px', // Rounded corners for soft look
        border: '1px solid rgba(255, 255, 255, 0.4)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        padding: '20px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '500px', // Increased height to accommodate input area
        overflow: 'visible', // Allow delete button to overflow slightly
      }}
    >
      {/* Custom scrollbar hiding style injection */}
      <style>{`
        .message-list::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header with Tools */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '5px',
      }}>
        <div style={{
          fontSize: '1.2em',
          fontWeight: 'bold',
          color: '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '1.4em' }}>☁️</span> Our Whispers
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsAddMode(!isAddMode);
              if (isEditMode) setIsEditMode(false);
            }}
            style={{ 
              cursor: 'pointer', 
              fontSize: '1.2em',
              background: isAddMode ? 'rgba(255,255,255,0.5)' : 'transparent',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Add Message"
          >
            ➕
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsEditMode(!isEditMode);
              if (isAddMode) setIsAddMode(false);
            }}
            style={{ 
              cursor: 'pointer', 
              fontSize: '1.2em',
               background: isEditMode ? 'rgba(255,255,255,0.5)' : 'transparent',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Manage Messages"
          >
            ✏️
          </motion.div>
        </div>
      </div>

      {/* Message List */}
      <div className="message-list" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        flex: 1,
        paddingRight: '4px' // Prevent scrollbar overlap
      }}>
        <AnimatePresence>
          {messages.slice(0, 5).map((msg, index) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.02 }}
              style={{
                background: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '16px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                borderLeft: `4px solid ${msg.color}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ 
                    background: '#fff', 
                    borderRadius: '50%', 
                    width: '24px', 
                    height: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}>
                    {msg.avatar}
                  </span>
                  
                  {editingNicknameId === msg.id ? (
                    <input
                      autoFocus
                      defaultValue={msg.nickname}
                      onBlur={(e) => handleNicknameChange(msg.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleNicknameChange(msg.id, e.currentTarget.value);
                        }
                      }}
                      style={{
                        border: 'none',
                        background: 'rgba(255,255,255,0.8)',
                        borderRadius: '4px',
                        padding: '2px 4px',
                        fontSize: '0.9em',
                        fontWeight: '700',
                        color: '#444',
                        width: '80px',
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <span 
                      onClick={() => setEditingNicknameId(msg.id)}
                      style={{ 
                        fontWeight: '700', 
                        fontSize: '0.9em', 
                        color: '#444',
                        cursor: 'pointer',
                        borderBottom: '1px dashed transparent'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderBottom = '1px dashed #666'}
                      onMouseLeave={(e) => e.currentTarget.style.borderBottom = '1px dashed transparent'}
                      title="Click to edit nickname"
                    >
                      {msg.nickname}
                    </span>
                  )}
                </div>
                
                {/* Edit Mode Tools: Arrows */}
                {isEditMode ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {index > 0 && (
                      <motion.span 
                        whileHover={{ scale: 1.2, color: '#000' }}
                        onClick={() => moveMessage(index, 'up')}
                        style={{ cursor: 'pointer', fontSize: '12px', color: '#666' }}
                      >
                        ▲
                      </motion.span>
                    )}
                    {index < Math.min(messages.length, 5) - 1 && (
                      <motion.span 
                        whileHover={{ scale: 1.2, color: '#000' }}
                        onClick={() => moveMessage(index, 'down')}
                        style={{ cursor: 'pointer', fontSize: '12px', color: '#666' }}
                      >
                        ▼
                      </motion.span>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.75em', color: '#666', opacity: 0.8 }}>{msg.time}</span>
                )}
              </div>
              
              <div style={{ 
                fontSize: '0.95em', 
                color: '#333', 
                lineHeight: '1.4',
                paddingLeft: '30px' 
              }}>
                {msg.content}
                {msg.image && (
                  <div style={{ marginTop: '8px' }}>
                    <img 
                      src={msg.image} 
                      alt="attachment" 
                      style={{ 
                        maxHeight: '100px', 
                        borderRadius: '8px',
                        display: 'block',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }} 
                    />
                  </div>
                )}
              </div>

              {/* Edit Mode: Delete Button (Superscript style) */}
              {isEditMode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.2, color: 'red' }}
                  onClick={() => handleDeleteRequest(msg.id)}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: '#fff',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#888',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  x
                </motion.div>
              )}
              
              {/* Delete Confirmation Overlay (Non-modal) */}
              {deleteConfirm === msg.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(255,255,255,0.9)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    zIndex: 20
                  }}
                >
                  <span style={{ fontSize: '0.9em', color: '#444' }}>Delete?</span>
                  <button 
                    onClick={confirmDelete}
                    style={{ border: 'none', background: '#FF6B9C', color: '#fff', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}
                  >Yes</button>
                  <button 
                    onClick={cancelDelete}
                    style={{ border: 'none', background: '#ccc', color: '#fff', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}
                  >No</button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Mode: Input Area */}
      <AnimatePresence>
        {isAddMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginTop: '8px' }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '12px',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {selectedImage && (
                <div style={{ position: 'relative', width: 'fit-content' }}>
                  <img src={selectedImage} alt="Preview" style={{ maxHeight: '60px', borderRadius: '8px' }} />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: '#FF6B9C',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept="image/*" 
                  onChange={handleImageSelect} 
                />
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current.click()}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '1.2em',
                    padding: '0 4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Add Image"
                >
                  📷
                </motion.button>

                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a whisper..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMessage()}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '0.9em',
                    color: '#444'
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddMessage}
                  style={{
                    border: 'none',
                    background: '#FF6B9C',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '4px 12px',
                    cursor: 'pointer',
                    fontSize: '0.9em'
                  }}
                >
                  Send
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MessageBoard;

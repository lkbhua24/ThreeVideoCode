import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Code, Sparkles, Upload, Plus, X, Activity, Coffee, Smile, Edit3, CheckCircle, Circle, Trash2, Calendar, Flag, PenTool, Droplet, Sun, Moon, Star } from 'lucide-react';

const GLASS_STYLE = {
  background: 'rgba(255,255,255,0.25)',
  border: '1px solid rgba(255,255,255,0.4)',
  backdropFilter: 'blur(12px) saturate(1.1)',
  WebkitBackdropFilter: 'blur(12px) saturate(1.1)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
};

const SharedGoals = () => {
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('couple_shared_goals');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editIsImportant, setEditIsImportant] = useState(false);
  const [editColor, setEditColor] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [rotationIndex, setRotationIndex] = useState(0);
  const dateInputRef = useRef(null);
  
  const PRESET_COLORS = [
    '#EBC8E1', '#ECDAEA', '#E3E3EF', '#CAE4E3', '#DFF0EF', 
    '#9DCCE1', '#B1D6E6', '#C3DAE6', '#F0E6E1', '#E4D1E6', 
    '#EADEE6', '#F0EADF', '#F0EEDA', '#DAE6DB', '#D7E6D3', 
    '#B8D4B7', '#F4E9E7', '#F5E4E5', '#F9D7D2', '#F8B1B1', 
    '#F3DC9C', '#EAE3B2', '#E4EACA', '#DEEDDD', '#87DFE4'
  ];

  // Get names from localStorage for selection
  const leftName = localStorage.getItem('couple_left_name') || 'LkbHua';
  const rightName = localStorage.getItem('couple_right_name') || 'ZengQ';

  useEffect(() => {
    localStorage.setItem('couple_shared_goals', JSON.stringify(goals));
  }, [goals]);

  // Goal rotation logic
  useEffect(() => {
    if (isExpanded) return; // Don't rotate when expanded
    
    const importantGoals = goals.filter(g => g.isImportant);
    const normalGoals = goals.filter(g => !g.isImportant);
    
    // If we have enough slots to show all normal goals without rotation, do nothing
    // Total slots is 5. Used slots is importantGoals.length.
    // Available slots for normal goals is 5 - importantGoals.length.
    // If normalGoals.length <= available slots, no rotation needed.
    const availableSlots = Math.max(0, 5 - importantGoals.length);
    if (normalGoals.length <= availableSlots) return;

    const interval = setInterval(() => {
      setRotationIndex(prev => (prev + 1) % normalGoals.length);
    }, 3000); // Rotate every 3 seconds

    return () => clearInterval(interval);
  }, [goals, isExpanded]);

  const displayGoals = useMemo(() => {
    if (isExpanded) return goals;

    const importantGoals = goals.filter(g => g.isImportant);
    const normalGoals = goals.filter(g => !g.isImportant);
    
    // Always show all important goals first (up to 5)
    const result = [...importantGoals];
    
    // Fill remaining slots with normal goals
    const remainingSlots = 5 - result.length;
    
    if (remainingSlots > 0 && normalGoals.length > 0) {
      // If we have more normal goals than slots, use rotation
      if (normalGoals.length > remainingSlots) {
        for (let i = 0; i < remainingSlots; i++) {
          const index = (rotationIndex + i) % normalGoals.length;
          result.push(normalGoals[index]);
        }
      } else {
        // Otherwise just add all normal goals
        result.push(...normalGoals);
      }
    }
    
    return result.slice(0, 5); // Ensure we never exceed 5 items
  }, [goals, isExpanded, rotationIndex]);

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    
    if (editingGoal.isNew) {
      // Handle creating new goal
      const newGoalObj = {
        id: Date.now(),
        content: editContent,
        author: leftName, // Default to leftName, could be improved
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: editDueDate,
        isImportant: editIsImportant,
        customColor: editColor
      };
      setGoals(prev => [newGoalObj, ...prev]);
    } else {
      // Handle updating existing goal
      setGoals(prev => prev.map(g => 
        g.id === editingGoal.id ? { 
          ...g, 
          content: editContent,
          dueDate: editDueDate,
          isImportant: editIsImportant,
          customColor: editColor
        } : g
      ));
    }
    
    setEditingGoal(null);
    setShowColorPicker(false);
  };

  const handleCreateNew = () => {
    setEditingGoal({ isNew: true });
    setEditContent('');
    setEditDueDate('');
    setEditIsImportant(false);
    setEditColor(null);
  };

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;
    const goal = {
      id: Date.now(),
      content: newGoal,
      author: author,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setGoals([goal, ...goals]);
    setNewGoal('');
    setIsAdding(false);
  };

  const toggleGoal = (id) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, completed: !g.completed } : g
    ));
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleContainerDoubleClick = (e) => {
    // If clicking on input or button, don't expand
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Backdrop for expanded mode */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(4px)',
              zIndex: 99
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        initial={false}
        animate={{
          width: isExpanded ? '600px' : '400px',
          height: isExpanded ? '500px' : 'auto',
          borderRadius: isExpanded ? '30px' : '50px',
          background: isExpanded 
            ? 'rgba(255, 255, 255, 0.25)' 
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.5) 100%)',
          backdropFilter: isExpanded ? 'blur(20px)' : 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.4)',
          boxShadow: isExpanded ? '0 20px 60px rgba(0,0,0,0.15)' : '0 10px 40px rgba(0,0,0,0.05)',
          zIndex: isExpanded ? 1000 : 100,
          x: 0,
          y: 0
        }}
        style={{
          position: isExpanded ? 'fixed' : 'absolute',
          top: isExpanded ? 0 : 'auto',
          left: isExpanded ? 0 : 'auto',
          right: isExpanded ? 0 : '40px',
          bottom: isExpanded ? 0 : '40px',
          margin: isExpanded ? 'auto' : 0,
          padding: '20px 30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          overflow: 'hidden'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onDoubleClick={handleContainerDoubleClick}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6495ED' }}>
            <Calendar size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>待办事项</h3>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); handleCreateNew(); }}
              style={{
                background: 'linear-gradient(135deg, #6495ED 0%, #B19CD9 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            >
              <Plus size={18} />
            </motion.button>
            {isExpanded && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                style={{
                  background: 'rgba(255,255,255,0.5)',
                  color: '#666',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </motion.button>
            )}
          </div>
        </div>
  
        <AnimatePresence mode="wait">
          {/* List of goals */}
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px',
              flex: 1,
              overflowY: isExpanded ? 'auto' : 'hidden',
              paddingRight: isExpanded ? '5px' : '0'
            }}
          >
            {goals.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                color: '#999', 
                fontSize: '0.9rem', 
                padding: '10px 0',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '20px',
                border: '1px dashed #ccc'
              }}>
                还没有制定计划，点击右上角 + 添加吧~
              </div>
            ) : (
                displayGoals.map(goal => {
                  const isZengQ = goal.author === rightName;
                  const borderColor = isZengQ ? '#FFB6C1' : '#87CEFA'; // Pink for ZengQ, Blue for LkbHua
                  const bgColor = isZengQ ? 'rgba(255, 182, 193, 0.25)' : 'rgba(135, 206, 250, 0.25)';
                  const textColor = isZengQ ? '#C71585' : '#104E8B'; // Deep Pink / Deep Blue for contrast
                  
                  return (
                    <motion.div
                      key={goal.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={(e) => e.stopPropagation()} 
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingGoal(goal);
                        setEditContent(goal.content);
                        setEditDueDate(goal.dueDate || '');
                        setEditIsImportant(goal.isImportant || false);
                        setEditColor(goal.customColor || null);
                        setShowColorPicker(false);
                      }}
                      style={{
                        background: goal.customColor || bgColor,
                        borderRadius: '30px', // Pill shape
                        padding: '12px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: `1.5px solid ${borderColor}`,
                        boxShadow: `0 4px 15px ${isZengQ ? 'rgba(255, 182, 193, 0.2)' : 'rgba(135, 206, 250, 0.2)'}`,
                        color: textColor,
                        flexShrink: 0,
                        position: 'relative', // For flag positioning
                        overflow: 'hidden' // Ensure flag doesn't spill out
                      }}
                    >
                      {/* Importance Flag */}
                      {goal.isImportant && (
                        <div style={{
                          position: 'absolute',
                          top: '-2px',
                          left: '-2px',
                          width: '0',
                          height: '0',
                          borderTop: '20px solid #FF4D4D',
                          borderRight: '20px solid transparent',
                          zIndex: 1
                        }}>
                          <div style={{
                            position: 'absolute',
                            top: '-18px',
                            left: '2px',
                            width: '4px',
                            height: '4px',
                            background: 'white',
                            borderRadius: '50%'
                          }} />
                        </div>
                      )}
                      <div 
                        onClick={() => toggleGoal(goal.id)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {goal.completed ? (
                          <CheckCircle size={20} color="#4CAF50" />
                        ) : (
                          <Circle size={20} color={textColor} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '0.95rem', 
                          color: goal.completed ? '#888' : textColor,
                          textDecoration: goal.completed ? 'line-through' : 'none',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 600
                        }}>
                          {goal.content}
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: textColor,
                        background: 'rgba(255,255,255,0.4)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        whiteSpace: 'nowrap',
                        fontWeight: 'bold'
                      }}>
                        {goal.author}
                      </div>
                      <button 
                        onClick={() => deleteGoal(goal.id)}
                        style={{ 
                          border: 'none', 
                          background: 'transparent', 
                          color: textColor,
                          opacity: 0.7,
                          cursor: 'pointer', 
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )
        </AnimatePresence>

        <AnimatePresence>
          {editingGoal && (
            <motion.div
              key="edit-modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(255,255,255,0.95)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: isExpanded ? '30px' : '50px',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '15px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
              }}>
                <button
                  onClick={() => setEditingGoal(null)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#666',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    padding: '5px'
                  }}
                >
                  取消
                </button>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#333' }}>
                  {editingGoal.isNew ? '新建' : '编辑'}
                </span>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#6495ED',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    padding: '5px'
                  }}
                >
                  完成
                </button>
              </div>
              
              {/* Edit Area */}
              <div style={{
                flex: 1,
                padding: '20px',
                background: editColor || '#CCCDD1',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background-color 0.3s ease'
              }}>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder={editingGoal.isNew ? "添加你的新计划..." : "编辑你的计划..."}
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'transparent',
                    border: 'none',
                    resize: 'none',
                    outline: 'none',
                    fontSize: '1.1rem',
                    color: '#333',
                    fontFamily: 'inherit',
                    lineHeight: '1.5'
                  }}
                />
                
                {/* Small Circle Bottom Left */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  {/* Calendar Icon */}
                  <div 
                    onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
                    style={{ 
                      cursor: 'pointer',
                      position: 'relative',
                      color: editDueDate ? '#6495ED' : '#666',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Calendar size={24} />
                    <input 
                      ref={dateInputRef}
                      type="date" 
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      style={{ 
                        position: 'absolute', 
                        opacity: 0, 
                        width: '100%', 
                        height: '100%', 
                        cursor: 'pointer',
                        left: 0,
                        top: 0
                      }}
                    />
                    {editDueDate && <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{editDueDate}</span>}
                  </div>

                  {/* Flag Icon */}
                  <div 
                    onClick={() => setEditIsImportant(!editIsImportant)}
                    style={{ 
                      cursor: 'pointer',
                      color: editIsImportant ? '#FF4D4D' : '#666',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Flag size={24} fill={editIsImportant ? "#FF4D4D" : "none"} />
                  </div>

                  {/* Color Picker Circle */}
                  <div style={{ position: 'relative' }}>
                    <div 
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '2px solid #666',
                        background: editColor || 'transparent',
                        cursor: 'pointer',
                        boxShadow: showColorPicker ? '0 0 0 2px rgba(100, 149, 237, 0.5)' : 'none'
                      }} 
                    />
                    
                    {/* Color Palette Panel */}
                    <AnimatePresence>
                      {showColorPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          style={{
                            position: 'absolute',
                            bottom: '35px',
                            left: '0',
                            background: 'white',
                            padding: '10px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                            width: '240px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            zIndex: 10
                          }}
                        >
                          {/* Reset Option */}
                           <div
                              onClick={() => {
                                setEditColor(null);
                                setShowColorPicker(false);
                              }}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                border: '1px solid #ddd',
                                background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                color: '#666'
                              }}
                            >
                              <X size={14} />
                            </div>
                            
                          {PRESET_COLORS.map(color => (
                            <div
                              key={color}
                              onClick={() => {
                                setEditColor(color);
                                setShowColorPicker(false);
                              }}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: color,
                                cursor: 'pointer',
                                border: editColor === color ? '2px solid #666' : '1px solid rgba(0,0,0,0.05)',
                                transform: editColor === color ? 'scale(1.1)' : 'scale(1)',
                                transition: 'transform 0.2s'
                              }}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

const STATUS_SECTIONS = [
  {
    title: '情绪想法',
    icon: <Smile size={18} />,
    options: [
      { label: '元气满满', icon: '🌟' },
      { label: 'emo', icon: '🌧️' },
      { label: '悠哉哉', icon: '🍃' },
      { label: '水逆退散', icon: '🚫' },
    ]
  },
  {
    title: '在干什么',
    icon: <Activity size={18} />,
    options: [
      { label: '想你', icon: '💭' },
      { label: '上课', icon: '📚' },
      { label: '开黑', icon: '🎮' },
      { label: '熬夜', icon: '🌙' },
      { label: '摸鱼', icon: '🐟' },
      { label: '发呆', icon: '😶' },
      { label: '干饭中', icon: '🍚' },
      { label: '在忙哦', icon: '💼' },
      { label: '拯救世界', icon: '🦸‍♂️' },
    ]
  },
  {
    title: '身体状态',
    icon: <Coffee size={18} />,
    options: [
      { label: '好累', icon: '😫' },
      { label: '昏昏欲睡', icon: '😪' },
      { label: '肚子疼', icon: '😣' },
      { label: '头疼欲裂', icon: '🤯' },
    ]
  }
];

const getStatusDisplay = (statusLabel) => {
  for (const section of STATUS_SECTIONS) {
    const option = section.options.find(opt => opt.label === statusLabel);
    if (option) {
      return `${option.icon} ${option.label}`;
    }
  }
  return statusLabel; // Custom status or not found
};

const StatusModal = ({ isOpen, onClose, onSave, currentStatus = [] }) => {
  const [selected, setSelected] = useState(currentStatus);
  const [customText, setCustomText] = useState('');
  const [customEmoji, setCustomEmoji] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelected(currentStatus);
    }
  }, [isOpen, currentStatus]);

  const toggleStatus = (status) => {
    setSelected(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleSave = () => {
    let finalStatus = [...selected];
    if (customText.trim()) {
      const customStatus = (customEmoji ? customEmoji + ' ' : '') + customText.trim();
      if (!finalStatus.includes(customStatus)) {
        finalStatus.push(customStatus);
      }
    }
    onSave(finalStatus);
    setCustomText('');
    setCustomEmoji('');
  };

  const sections = STATUS_SECTIONS;

  const customEmojis = ['🙂', '😄', '😢', '😮‍💨', '😞', '😎', '😐'];

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }} onClick={onClose}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '32px',
            padding: '30px',
            width: '90%',
            maxWidth: '480px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>此刻状态</h2>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6495ED', margin: '10px 0 5px', minHeight: '38px' }}>
              {currentStatus.length > 0 ? currentStatus[currentStatus.length - 1] : '暂无状态'}
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#999' }}>状态仅保留24小时</p>
            <button 
              onClick={onClose}
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
          </div>

          {/* Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {sections.map((section, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {section.options.map((opt) => {
                      const isSelected = selected.includes(opt.label);
                      return (
                        <motion.button
                          key={opt.label}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleStatus(opt.label)}
                          style={{
                            background: isSelected ? '#E6F0FF' : '#f5f5f7',
                            color: isSelected ? '#6495ED' : '#666',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 2px 8px rgba(100, 149, 237, 0.2)' : 'none',
                            border: isSelected ? '1px solid #6495ED' : '1px solid transparent'
                          }}
                        >
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Custom Status Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#666', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  <Edit3 size={18} />
                  <span>自定义状态</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>{customEmoji || '😶'}</div>
                    <input 
                      type="text" 
                      placeholder="输入你的状态..." 
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '10px 15px',
                        borderRadius: '20px',
                        border: '1px solid #eee',
                        background: '#f9f9f9',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {customEmojis.map(emoji => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCustomEmoji(emoji)}
                        style={{
                          background: customEmoji === emoji ? '#E6F0FF' : '#f5f5f7',
                          fontSize: '1.2rem',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: customEmoji === emoji ? '1px solid #6495ED' : '1px solid transparent'
                        }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>

                  {(() => {
                    const predefined = new Set(sections.flatMap(s => s.options.map(o => o.label)));
                    const customItems = selected.filter(s => !predefined.has(s));
                    
                    if (customItems.length === 0) return null;
                    
                    return (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: '6px' }}>已添加:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {customItems.map(item => (
                            <motion.button
                              key={item}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleStatus(item)}
                              style={{
                                border: '1px solid #6495ED',
                                background: '#E6F0FF',
                                color: '#6495ED',
                                padding: '6px 12px',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>{item}</span>
                              <X size={14} />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Footer */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              style={{
                marginTop: '10px',
                background: 'linear-gradient(90deg, #6495ED 0%, #B19CD9 100%)',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(100, 149, 237, 0.3)'
              }}
            >
              保存状态
            </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

const CoupleCounter = () => {
  const [startDate, setStartDate] = useState(() => localStorage.getItem('couple_start_date') || '2023-03-03T00:00:00');
  const [leftAvatar, setLeftAvatar] = useState(() => localStorage.getItem('couple_left_avatar'));
  const [rightAvatar, setRightAvatar] = useState(() => localStorage.getItem('couple_right_avatar'));
  const [leftName, setLeftName] = useState(() => localStorage.getItem('couple_left_name') || 'LkbHua');
  const [rightName, setRightName] = useState(() => localStorage.getItem('couple_right_name') || 'ZengQ');
  const [isEditingLeft, setIsEditingLeft] = useState(false);
  const [isEditingRight, setIsEditingRight] = useState(false);
  const [activeStatusUser, setActiveStatusUser] = useState(null); // 'left' or 'right'
  const [leftStatus, setLeftStatus] = useState([]);
  const [rightStatus, setRightStatus] = useState([]);
  const [tick, setTick] = useState(Date.now());
  
  // Ref for hidden file inputs
  const leftFileInputRef = React.useRef(null);
  const rightFileInputRef = React.useRef(null);
  const leftNameInputRef = React.useRef(null);
  const rightNameInputRef = React.useRef(null);

  useEffect(() => {
    if (isEditingLeft && leftNameInputRef.current) {
      leftNameInputRef.current.focus();
    }
  }, [isEditingLeft]);

  useEffect(() => {
    if (isEditingRight && rightNameInputRef.current) {
      rightNameInputRef.current.focus();
    }
  }, [isEditingRight]);

  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setStartDate(newDate);
    localStorage.setItem('couple_start_date', newDate);
  };

  const handleAvatarChange = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (side === 'left') {
          setLeftAvatar(result);
          localStorage.setItem('couple_left_avatar', result);
        } else {
          setRightAvatar(result);
          localStorage.setItem('couple_right_avatar', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const timeDiff = useMemo(() => {
    const start = new Date(startDate).getTime();
    const now = tick;
    const diff = Math.max(0, now - start);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }, [startDate, tick]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto 40px',
      display: 'flex',
      justifyContent: 'center',
      gap: '40px',
      alignItems: 'center',
      padding: '20px',
      zIndex: 10,
      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
      maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)'
    }}>
      {/* Floating Hearts Background */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, x: 0, opacity: 0, rotate: 0 }}
            animate={{
              y: -800,
              x: Math.sin(i) * 100,
              opacity: [0, 0.8, 0],
              rotate: [0, 45, -45]
            }}
            transition={{
              duration: 20 + Math.random() * 15,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${80 + Math.random() * 20}%`,
            }}
          >
            <Heart
              size={20 + Math.random() * 60}
              color="rgba(255, 182, 193, 0.6)"
              fill="rgba(255, 192, 203, 0.1)"
              strokeWidth={1}
            />
          </motion.div>
        ))}
      </div>

      {/* Left Avatar (Blueish Thumb) */}
      <motion.div
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ position: 'relative', width: '180px', height: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #E6F0FF 0%, #CFE3FF 100%)',
          borderRadius: '90px 90px 50px 50px',
          transform: 'rotate(12deg)',
          boxShadow: '0 10px 20px rgba(207, 227, 255, 0.4)'
        }} />
        <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {/* Avatar Area with Click to Upload */}
          <div 
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid rgba(255,255,255,0.8)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              background: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => leftFileInputRef.current?.click()}
          >
            {leftAvatar ? (
              <>
                <img src={leftAvatar} alt="Him" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.2)',
                  opacity: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'opacity 0.2s',
                  ':hover': { opacity: 1 }
                }} className="avatar-hover-overlay">
                   <Plus size={30} color="#fff" strokeWidth={3} />
                </div>
              </>
            ) : (
              <Plus size={40} color="#6495ED" strokeWidth={1.5} />
            )}
            <input 
              type="file" 
              accept="image/*" 
              hidden 
              ref={leftFileInputRef}
              onChange={(e) => handleAvatarChange(e, 'left')} 
            />
          </div>
          
          {isEditingLeft ? (
            <input
              ref={leftNameInputRef}
              value={leftName}
              onChange={(e) => setLeftName(e.target.value)}
              onBlur={() => {
                setIsEditingLeft(false);
                localStorage.setItem('couple_left_name', leftName);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingLeft(false);
                  localStorage.setItem('couple_left_name', leftName);
                }
              }}
              style={{
                fontFamily: '"Ma Shan Zheng", cursive',
                color: '#6495ED',
                fontSize: '1.2rem',
                border: 'none',
                background: 'transparent',
                textAlign: 'center',
                outline: 'none',
                borderBottom: '1px solid #6495ED',
                width: '100px'
              }}
            />
          ) : (
            <span 
              onDoubleClick={() => setIsEditingLeft(true)}
              style={{ fontFamily: '"Ma Shan Zheng", cursive', color: '#6495ED', fontSize: '1.2rem', cursor: 'text' }}
            >
              {leftName}
            </span>
          )}
          
          {/* Status Barrage Button */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={leftStatus.length > 0 ? { y: [0, -4, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => setActiveStatusUser('left')}
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              fontSize: '0.8rem', 
              color: '#6495ED', 
              background: 'rgba(255,255,255,0.8)', 
              padding: '6px 12px', 
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(100, 149, 237, 0.2)',
              border: '1px solid rgba(100, 149, 237, 0.3)',
              maxWidth: '140px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {leftStatus.length > 0 ? (
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {leftStatus.map(s => getStatusDisplay(s)).join(' ')}
              </span>
            ) : (
              <>
                <Plus size={14} />
                <span>此刻状态</span>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Center Counter */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: '#555',
          gap: '4px',
          zIndex: 10
        }}
      >
        <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <input 
            type="datetime-local" 
            value={startDate} 
            onChange={handleDateChange}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} 
          />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#333', lineHeight: 1, fontFamily: '"Brush Script MT", cursive' }}>{timeDiff.days}</span>
            <span style={{ fontSize: '1rem', color: '#888' }}>天</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#555', fontFamily: '"Brush Script MT", cursive' }}>{timeDiff.hours}</span>
            <span style={{ fontSize: '0.9rem', color: '#888' }}>小时</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#555', fontFamily: '"Brush Script MT", cursive' }}>{timeDiff.minutes}</span>
            <span style={{ fontSize: '0.9rem', color: '#888' }}>分</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#555', fontFamily: '"Brush Script MT", cursive' }}>{timeDiff.seconds}</span>
            <span style={{ fontSize: '0.9rem', color: '#888' }}>秒</span>
          </div>
        </label>
      </motion.div>

      {/* Right Avatar (Pinkish Thumb) */}
      <motion.div
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ position: 'relative', width: '180px', height: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #FDE8F2 0%, #F7DCE7 100%)',
          borderRadius: '90px 90px 50px 50px',
          transform: 'rotate(-12deg)',
          boxShadow: '0 10px 20px rgba(249, 221, 233, 0.4)'
        }} />
        <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          {/* Avatar Area with Click to Upload */}
          <div 
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid rgba(255,255,255,0.8)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              background: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => rightFileInputRef.current?.click()}
          >
            {rightAvatar ? (
              <>
                <img src={rightAvatar} alt="Her" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.2)',
                  opacity: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'opacity 0.2s',
                  ':hover': { opacity: 1 }
                }} className="avatar-hover-overlay">
                   <Plus size={30} color="#fff" strokeWidth={3} />
                </div>
              </>
            ) : (
              <Plus size={40} color="#B19CD9" strokeWidth={1.5} />
            )}
            <input 
              type="file" 
              accept="image/*" 
              hidden 
              ref={rightFileInputRef}
              onChange={(e) => handleAvatarChange(e, 'right')} 
            />
          </div>

          {isEditingRight ? (
            <input
              ref={rightNameInputRef}
              value={rightName}
              onChange={(e) => setRightName(e.target.value)}
              onBlur={() => {
                setIsEditingRight(false);
                localStorage.setItem('couple_right_name', rightName);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingRight(false);
                  localStorage.setItem('couple_right_name', rightName);
                }
              }}
              style={{
                fontFamily: '"Ma Shan Zheng", cursive',
                color: '#B19CD9',
                fontSize: '1.2rem',
                border: 'none',
                background: 'transparent',
                textAlign: 'center',
                outline: 'none',
                borderBottom: '1px solid #B19CD9',
                width: '100px'
              }}
            />
          ) : (
            <span 
              onDoubleClick={() => setIsEditingRight(true)}
              style={{ fontFamily: '"Ma Shan Zheng", cursive', color: '#B19CD9', fontSize: '1.2rem', cursor: 'text' }}
            >
              {rightName}
            </span>
          )}
          
          {/* Status Barrage Button */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={rightStatus.length > 0 ? { y: [0, -4, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            onClick={() => setActiveStatusUser('right')}
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              fontSize: '0.8rem', 
              color: '#B19CD9', 
              background: 'rgba(255,255,255,0.8)', 
              padding: '6px 12px', 
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(219, 112, 147, 0.2)',
              border: '1px solid rgba(219, 112, 147, 0.3)',
              maxWidth: '140px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {rightStatus.length > 0 ? (
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {rightStatus.map(s => getStatusDisplay(s)).join(' ')}
              </span>
            ) : (
              <>
                <Plus size={14} />
                <span>此刻状态</span>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
      
      {/* Status Modal */}
      <StatusModal 
        isOpen={!!activeStatusUser}
        onClose={() => setActiveStatusUser(null)}
        currentStatus={activeStatusUser === 'left' ? leftStatus : rightStatus}
        onSave={(newStatus) => {
          console.log(`Saved status for ${activeStatusUser}:`, newStatus);
          if (activeStatusUser === 'left') {
            setLeftStatus(newStatus);
          } else {
            setRightStatus(newStatus);
          }
          setActiveStatusUser(null);
        }}
      />
    </div>
  );
};

const OneHundredThings = () => {
  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.1, rotate: -5 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'absolute',
        top: '180px', 
        left: '40px',
        width: '100px',
        height: '100px',
        ...GLASS_STYLE,
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 20,
        fontFamily: '"Ma Shan Zheng", cursive'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFF', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)' }} />
        ))}
      </div>
      
      <PenTool size={32} color="#6495ED" style={{ marginLeft: '10px', marginBottom: '5px' }} />
      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#555', marginLeft: '10px' }}>100件小事</div>
    </motion.div>
  );
};

const PeriodTracker = () => {
  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'absolute',
        top: '180px', 
        left: '160px',
        width: '100px',
        height: '100px',
        ...GLASS_STYLE,
        background: 'rgba(255,235,238,0.3)', // Slightly pinker glass
        // Drop shape: rounded top, pointed bottom-ish but still soft
        borderRadius: '50% 50% 50% 5%', 
        transform: 'rotate(-45deg)', // Rotate to make the point at bottom
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 20,
        fontFamily: '"Ma Shan Zheng", cursive'
      }}
    >
      {/* Content wrapper */}
      <div style={{ transform: 'rotate(45deg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Droplet size={32} color="#FF80AB" fill="#FF80AB" style={{ marginBottom: '5px', opacity: 0.8 }} />
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#D81B60' }}>姨妈助手</div>
      </div>
    </motion.div>
  );
};

const AboutUs = () => {
  // 配色模式：1-初恋（0-1年），2-热恋（1-3年），3-永恒（3年以上）
  const [mode, setMode] = useState(1);
  // 鼠标位置
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // 涟漪效果
  const [ripples, setRipples] = useState([]);
  // 星光跟随
  const [stars, setStars] = useState([]);
  
  // 三种配色方案
  const colorModes = {
    1: {
      name: '初恋',
      gradient: 'linear-gradient(135deg, #FFD1DC 0%, #E6E6FA 100%)', // 蜜桃粉渐变薰衣草紫
      accent: '#FF69B4',
      icon: <Sun size={20} />
    },
    2: {
      name: '热恋',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FF7F50 100%)', // 暖金渐变珊瑚橙
      accent: '#FF4500',
      icon: <Moon size={20} />
    },
    3: {
      name: '永恒',
      gradient: 'linear-gradient(135deg, #1E90FF 0%, #E0FFFF 100%)', // 星空蓝渐变银白
      accent: '#00BFFF',
      icon: <Star size={20} />
    }
  };
  
  // 获取当前模式的配色
  const currentMode = colorModes[mode];
  
  // 处理鼠标移动
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    setMousePosition({ x: clientX, y: clientY });
    
    // 创建涟漪效果
    const newRipple = {
      id: Date.now() + Math.random(),
      x: clientX,
      y: clientY,
      size: 0,
      opacity: 0.5
    };
    setRipples(prev => [...prev, newRipple]);
    
    // 3秒后移除涟漪
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 3000);
    
    // 创建设星效果
    if (Math.random() > 0.9) { // 10%概率生成星星
      const newStar = {
        id: Date.now() + Math.random() * 1000,
        x: clientX,
        y: clientY,
        size: 2 + Math.random() * 3,
        opacity: 0.8
      };
      setStars(prev => [...prev, newStar]);
      
      // 2秒后移除星星
      setTimeout(() => {
        setStars(prev => prev.filter(star => star.id !== newStar.id));
      }, 2000);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 100,
        overflow: 'hidden',
        fontFamily: '"Ma Shan Zheng", cursive, sans-serif'
      }}
    >
      {/* Mouse Ripple Effects */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            initial={{ x: ripple.x, y: ripple.y, width: 0, height: 0, opacity: 0.5 }}
            animate={{ 
              x: ripple.x - 100, 
              y: ripple.y - 100, 
              width: 200, 
              height: 200, 
              opacity: 0 
            }}
            transition={{ duration: 3, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${currentMode.accent}33 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
      
      {/* Mouse Star Effects */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        {stars.map(star => (
          <motion.div
            key={star.id}
            initial={{ x: star.x, y: star.y, width: star.size, height: star.size, opacity: 0.8 }}
            animate={{ 
              y: star.y - 50, 
              opacity: 0 
            }}
            transition={{ duration: 2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 0 10px rgba(255,255,255,0.9)',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
      {/* Gradient Background with Glassmorphism */}
      <motion.div 
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -3,
          background: currentMode.gradient,
          backdropFilter: 'blur(10px)'
        }} 
      />

      {/* Additional Glassmorphism Overlay for enhanced朦胧效果 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -2,
        pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
        backdropFilter: 'blur(5px)'
      }} />
      


      {/* Mode Switcher Section */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px'
      }}>
        {/* Guide Text */}
        <div style={{
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.9)',
            fontFamily: '"Ma Shan Zheng", cursive',
            letterSpacing: '1px',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            点击切换专属恋爱氛围・三段时光三种浪漫
          </p>
        </div>
        
        {/* Mode Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          padding: '8px',
          borderRadius: '25px',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          {Object.entries(colorModes).map(([key, modeData]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(parseInt(key))}
              style={{
                background: mode === parseInt(key) ? modeData.accent : 'rgba(255,255,255,0.4)',
                color: mode === parseInt(key) ? 'white' : 'rgba(255,255,255,0.9)',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                boxShadow: mode === parseInt(key) ? `0 2px 8px ${modeData.accent}40` : 'none'
              }}
            >
              {modeData.name}模式
            </motion.button>
          ))}
        </div>
      </div>

      {/* Top Gradient Banner */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '160px',
        background: 'linear-gradient(90deg, #F9DDE9 0%, #F9DDE9 35%, #F0DEEF 50%, #D4DCF6 65%, #D4DCF6 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5
      }}>
        {/* Decorative Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '4px'
          }}>
            <Code size={28} color="#6495ED" />
            <h1 style={{
              background: 'linear-gradient(to right, #B19CD9, #6495ED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '3.5rem',
              fontFamily: '"Brush Script MT", "Dancing Script", cursive',
              margin: 0,
              fontWeight: 'normal',
              textShadow: '0 2px 10px rgba(0,0,0,0.05)',
              lineHeight: 1
            }}>
              About Us
            </h1>
            <Heart size={28} fill="#B19CD9" color="#B19CD9" />
          </div>
          <p style={{
            color: '#7B88B6',
            fontSize: '1rem',
            margin: 0,
            letterSpacing: '2px',
            fontFamily: '"Ma Shan Zheng", cursive',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)'
          }}>
            当代码邂逅浪漫，便是永恒
          </p>
        </motion.div>
        
        {/* Mode Switcher */}
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          display: 'flex',
          gap: '10px',
          background: 'rgba(255,255,255,0.3)',
          padding: '8px 16px',
          borderRadius: '25px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.4)'
        }}>
          {Object.entries(colorModes).map(([key, modeData]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(parseInt(key))}
              style={{
                background: mode === parseInt(key) ? modeData.accent : 'rgba(255,255,255,0.5)',
                color: mode === parseInt(key) ? 'white' : '#333',
                border: 'none',
                borderRadius: '20px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {modeData.icon}
              <span>{modeData.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        marginTop: '60px',
        height: 'calc(100vh - 60px)',
        padding: '0 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto'
      }}>
        
        {/* Couple Counter Section */}
        <CoupleCounter />

        {/* 100 Little Things Section - Positioned Absolutely */}
        <OneHundredThings />

        {/* Period Tracker Section - Positioned Absolutely Right */}
        <PeriodTracker />

        {/* Shared Goals Section - Positioned Absolutely */}
        <SharedGoals />

      </div>


    </motion.div>
  );
};

export default AboutUs;

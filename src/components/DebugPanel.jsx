import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bug, X, ChevronDown, ChevronUp, Server, Database, Monitor } from 'lucide-react';

const DebugPanel = ({ currentMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [fps, setFps] = useState(60);
  const [lsSize, setLsSize] = useState(0);
  const [serverStatus, setServerStatus] = useState('Checking...');
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // FPS Monitor
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId;
    
    const loop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      animationId = requestAnimationFrame(loop);
    };
    
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // LocalStorage Size & Window Size
  useEffect(() => {
    const updateStats = () => {
      let _lsTotal = 0;
      let xLen;
      for (let x in localStorage) {
        if (!localStorage.hasOwnProperty(x)) continue;
        xLen = ((localStorage[x].length + x.length) * 2);
        _lsTotal += xLen;
      }
      setLsSize((_lsTotal / 1024).toFixed(2));
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    window.addEventListener('resize', updateStats);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateStats);
    };
  }, []);

  // Server Status
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch('/api/memories');
        if (res.ok) setServerStatus('Online');
        else setServerStatus('Error');
      } catch (e) {
        setServerStatus('Offline');
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          color: fps < 30 ? '#ef4444' : '#3b82f6'
        }}
        title="打开调试面板"
      >
        <Bug size={20} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 20, y: -20 }}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '16px',
        width: '280px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        fontFamily: 'monospace',
        fontSize: '12px'
      }}
    >
      {/* Header */}
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid rgba(0,0,0,0.05)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#333' }}>
          <Activity size={16} color={fps < 30 ? '#ef4444' : '#10b981'} />
          Health Check
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setIsMinimized(!isMinimized)} style={btnStyle}>
            {isMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} style={btnStyle}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <StatRow 
              icon={<Monitor size={14} />} 
              label="FPS" 
              value={fps} 
              status={fps >= 50 ? 'good' : fps >= 30 ? 'warn' : 'bad'} 
            />
            <StatRow 
              icon={<Activity size={14} />} 
              label="Mode" 
              value={currentMode} 
              status="info" 
            />
            <StatRow 
              icon={<Server size={14} />} 
              label="API Status" 
              value={serverStatus} 
              status={serverStatus === 'Online' ? 'good' : 'bad'} 
            />
            <StatRow 
              icon={<Database size={14} />} 
              label="Local Storage" 
              value={`${lsSize} KB`} 
              status={lsSize < 4000 ? 'good' : 'warn'} 
            />
            <StatRow 
              icon={<Monitor size={14} />} 
              label="Resolution" 
              value={`${windowSize.width}x${windowSize.height}`} 
              status="info" 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const StatRow = ({ icon, label, value, status }) => {
  const colors = {
    good: '#10b981',
    warn: '#f59e0b',
    bad: '#ef4444',
    info: '#3b82f6'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
        <span style={{ color: colors[status] }}>{icon}</span>
        {label}
      </div>
      <div style={{ fontWeight: 'bold', color: colors[status] }}>
        {value}
      </div>
    </div>
  );
};

const btnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#666',
  borderRadius: '4px',
};

export default DebugPanel;

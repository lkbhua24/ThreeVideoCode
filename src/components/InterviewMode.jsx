import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Heart, Play, Pause, Volume2, VolumeX, Maximize, Minimize, RotateCcw, MessageCircle, Star, Lock, Unlock, List, Plus, X, CheckCircle, SkipBack, SkipForward, Download, Upload, Save, FolderOpen, Search, Filter, Shuffle, FileVideo, Link as LinkIcon, FolderInput, Paperclip, AlertCircle } from 'lucide-react';
import { INTERVIEW_TIMELINE, THEME_CONFIG, QUESTION_LIBRARY } from '../data/interviewConfig';


const useFPS = () => {
  const [fps, setFps] = useState(60);
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
  return fps;
};

const LazyBackgroundTile = ({ memory, isCurrent, isNext, reducedMotion, windowWidth }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' }); // Load a bit before it enters viewport
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const shouldLoad = isVisible || isCurrent || isNext;

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0 }}
      animate={reducedMotion ? { opacity: 0.2 } : { 
        opacity: [0.1, 0.3, 0.1],
        scale: windowWidth < 768 ? 1 : [0.98, 1.02, 0.98]
      }}
      transition={reducedMotion ? { duration: 1 } : { 
        duration: 10 + Math.random() * 5, 
        repeat: Infinity, 
        delay: Math.random() * 5 
      }}
      style={{
        backgroundImage: shouldLoad ? `url(${memory.thumbnail})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 'var(--radius-md)',
        filter: isCurrent ? 'none' : 'grayscale(80%) blur(1px)',
        opacity: isCurrent ? 1 : undefined,
        transition: 'all 0.5s ease',
        willChange: 'opacity, transform'
      }}
    />
  );
};

const InterviewMode = ({ memories, onExit }) => {
  // Load timeline from local storage or use default
  const [timeline, setTimeline] = useState(() => {
    try {
      const saved = localStorage.getItem('interview_timeline');
      return saved ? JSON.parse(saved) : INTERVIEW_TIMELINE;
    } catch (e) {
      return INTERVIEW_TIMELINE;
    }
  });

  const PREFS_VERSION = 1;
  const initialPrefs = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('interview_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === PREFS_VERSION) return parsed;
      }
    } catch(e) {}
    return {};
  }, []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(initialPrefs.isFullscreen ?? false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isFreeMode, setIsFreeMode] = useState(initialPrefs.isFreeMode ?? false); // 自由探索模式
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(initialPrefs.volume ?? 1);
  const [isMuted, setIsMuted] = useState(initialPrefs.isMuted ?? false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(initialPrefs.isAutoPlay ?? true);
  const [isEnded, setIsEnded] = useState(false);
  const [showNextHint, setShowNextHint] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    localStorage.setItem('interview_preferences', JSON.stringify({
      version: PREFS_VERSION,
      volume,
      isMuted,
      isFullscreen,
      isAutoPlay,
      isFreeMode
    }));
  }, [volume, isMuted, isFullscreen, isAutoPlay, isFreeMode]);
  
  // New States for Library, Plan Management & Generation
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('All');
  const [showPlanManager, setShowPlanManager] = useState(false);
  const [plans, setPlans] = useState(() => {
    try {
      const saved = localStorage.getItem('interview_plans');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });
  const [newPlanName, setNewPlanName] = useState('');
  const [showSmartGen, setShowSmartGen] = useState(false);
  const [genConfig, setGenConfig] = useState({ total: 100, deep: 4, fun: 3, future: 3 });

  // --- Asset Management & Persistence ---
  const [showAssetManager, setShowAssetManager] = useState(false);
  const [localAssets, setLocalAssets] = useState([]); // Array of { name, size, type, blobUrl, file }
  const [videoMappings, setVideoMappings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('interview_video_mappings') || '{}');
    } catch(e) { return {}; }
  });

  // Custom Questions State
  const [customQuestions, setCustomQuestions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('interview_custom_questions') || '[]');
    } catch(e) { return []; }
  });
  const [newQuestionText, setNewQuestionText] = useState('');

  const handleAddCustomQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ = {
      id: Date.now(),
      question: newQuestionText,
      category: 'Custom',
      defaultSpeaker: 'Both'
    };
    const updated = [newQ, ...customQuestions];
    setCustomQuestions(updated);
    localStorage.setItem('interview_custom_questions', JSON.stringify(updated));
    setNewQuestionText('');
    // Switch to Custom tab to show it
    setLibraryFilter('Custom');
  };

  const handleDeleteCustomQuestion = (id) => {
    const updated = customQuestions.filter(q => q.id !== id);
    setCustomQuestions(updated);
    localStorage.setItem('interview_custom_questions', JSON.stringify(updated));
  };

  // Clean up blob URLs when component unmounts or assets change
  useEffect(() => {
    return () => {
      localAssets.forEach(a => {
        if (a.blobUrl) URL.revokeObjectURL(a.blobUrl);
      });
    };
  }, [localAssets]);

  // Persist mappings
  useEffect(() => {
    localStorage.setItem('interview_video_mappings', JSON.stringify(videoMappings));
  }, [videoMappings]);

  // Helper: Handle file selection (folder scan or single file)
  const handleAssetImport = (files) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('video/'));
    const newAssets = validFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
      blobUrl: URL.createObjectURL(f),
      file: f, // Keep reference for potential upload
      lastModified: f.lastModified
    }));

    setLocalAssets(prev => {
      const existing = new Map(prev.map(a => [a.name, a]));
      newAssets.forEach(a => existing.set(a.name, a));
      return Array.from(existing.values());
    });
    
    // Auto-match Logic (Run immediately after import)
    const newMappings = { ...videoMappings };
    let matchCount = 0;
    
    timeline.forEach(node => {
      // Priority 1: Exact match on videoKeyword
      if (node.videoKeyword) {
        const match = newAssets.find(a => a.name.toLowerCase().includes(node.videoKeyword.toLowerCase()));
        if (match && !newMappings[node.id]) {
          newMappings[node.id] = { type: 'file', value: match.name };
          matchCount++;
        }
      }
    });
    
    if (matchCount > 0) {
      setVideoMappings(newMappings);
      // alert(`自动匹配成功：${matchCount} 个视频已关联！`); // Optional: notify user
    }
  };

  const handleBindVideo = (nodeId, assetNameOrUrl, type = 'file') => {
    setVideoMappings(prev => ({
      ...prev,
      [nodeId]: { type, value: assetNameOrUrl }
    }));
  };

  // Theme / Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const matchMediaDark = window.matchMedia('(prefers-color-scheme: dark)');
    const matchMediaMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    setIsDarkMode(matchMediaDark.matches);
    setReducedMotion(matchMediaMotion.matches);

    const handlerDark = (e) => setIsDarkMode(e.matches);
    const handlerMotion = (e) => setReducedMotion(e.matches);
    const handleResize = () => setWindowWidth(window.innerWidth);

    matchMediaDark.addEventListener('change', handlerDark);
    matchMediaMotion.addEventListener('change', handlerMotion);
    window.addEventListener('resize', handleResize);
    
    return () => {
      matchMediaDark.removeEventListener('change', handlerDark);
      matchMediaMotion.removeEventListener('change', handlerMotion);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  
  const [missingLogs, setMissingLogs] = useState([]);
  const [showMissingLogs, setShowMissingLogs] = useState(false);
  const currentFps = useFPS();
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  // --- Progress Stats ---
  const completedCount = React.useMemo(() => timeline.filter(t => t.isCompleted).length, [timeline]);
  const getEncouragingText = () => {
    const total = timeline.length;
    const remaining = total - completedCount;
    if (total === 0) return "";
    if (remaining === 0) return "太棒了，全部完成啦！🎉";
    
    // Estimate 1.5 mins per question
    const estimatedMins = Math.ceil(remaining * 1.5); 
    if (completedCount / total > 0.8) return `冲刺阶段！还剩 ${remaining} 题，约需 ${estimatedMins} 分钟 🏃‍♂️`;
    if (completedCount / total >= 0.5) return `已经完成一半啦！还剩 ${remaining} 题，约需 ${estimatedMins} 分钟 ⭐`;
    return `加油！已完成 ${completedCount}/${total}，还剩约 ${estimatedMins} 分钟 💪`;
  };

  // --- Usage Data (Analytics) ---
  const trackEvent = (eventName, data = {}) => {
    try {
      const logs = JSON.parse(localStorage.getItem('interview_usage_logs') || '[]');
      logs.push({
        event: eventName,
        timestamp: new Date().toISOString(),
        ...data
      });
      if (logs.length > 100) logs.shift(); // Keep only last 100 logs
      localStorage.setItem('interview_usage_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Analytics error:', e);
    }
  };

  useEffect(() => {
    if (currentFps < 30) {
      setIsLowPerformance(true);
    } else if (currentFps > 45) {
      setIsLowPerformance(false);
    }
  }, [currentFps]);

  const effectiveReducedMotion = reducedMotion || isLowPerformance;

  const hideControlsTimerRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  
  const revealControls = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2200);
    }
  };
  
  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
      if (autoPlayTimerRef.current) { clearTimeout(autoPlayTimerRef.current); autoPlayTimerRef.current = null; }
    };
  }, []);
  
  useEffect(() => {
    if (!isAutoPlay || isFreeMode) {
      if (autoPlayTimerRef.current) { clearTimeout(autoPlayTimerRef.current); autoPlayTimerRef.current = null; }
    }
  }, [isAutoPlay, isFreeMode, currentNodeIndex]);
  
  // Persist timeline changes
  useEffect(() => {
    localStorage.setItem('interview_timeline', JSON.stringify(timeline));
  }, [timeline]);

  // Persist plans changes
  useEffect(() => {
    localStorage.setItem('interview_plans', JSON.stringify(plans));
  }, [plans]);

  // Filter relevant memories based on config
  // We look for files in 'sucai/caifang' (normalized path check)
  const interviewMemories = React.useMemo(() => {
    return memories.filter(m => m.relativePath.includes('sucai/caifang') || m.relativePath.includes('sucai\\caifang'));
  }, [memories]);

  // Optimization: Render a subset of background tiles based on screen size to save memory and avoid frame drops
  const backgroundMemories = React.useMemo(() => {
    let maxTiles = isLowPerformance ? 12 : 48; // default for large screens
    if (windowWidth < 768) {
      maxTiles = 16; // mobile
    } else if (windowWidth < 1200) {
      maxTiles = 32; // tablet/small desktop
    }
    
    if (interviewMemories.length <= maxTiles) return interviewMemories;
    // Shuffle and pick maxTiles random items for atmosphere
    return [...interviewMemories].sort(() => 0.5 - Math.random()).slice(0, maxTiles);
  }, [interviewMemories, windowWidth, isLowPerformance]);

  // Find the video for the current node (Enhanced with Mappings)
  const currentVideo = React.useMemo(() => {
    const node = timeline[currentNodeIndex];
    if (!node) return null;
    
    // 1. Explicit Mapping
    const mapping = videoMappings[node.id];
    if (mapping) {
      if (mapping.type === 'url' || mapping.value.includes('://')) {
        return { url: mapping.value, id: `mapped-url-${node.id}`, name: 'Remote Video' };
      }
      // Local asset mapping
      const asset = localAssets.find(a => a.name === mapping.value);
      if (asset) return { url: asset.blobUrl, id: asset.name, ...asset, thumbnail: null }; 
    }

    // 2. Node direct URL (from plan/config)
    if (node.videoUrl) return { url: node.videoUrl, id: `node-url-${node.id}`, name: 'Linked Video' };

    // 3. Fallback to existing keyword logic (Backend/Memories + Local Assets)
    const keyword = node.videoKeyword || '';
    
    // Check Local Assets first (higher priority for newly added files)
    const localMatch = localAssets.find(a => a.name.toLowerCase().includes(keyword.toLowerCase()));
    if (localMatch) return { url: localMatch.blobUrl, id: localMatch.name, ...localMatch, thumbnail: null };

    // Then check Backend/Memories
    return interviewMemories.find(m => m.name.toLowerCase().includes(keyword.toLowerCase()));
  }, [currentNodeIndex, interviewMemories, timeline, videoMappings, localAssets]);

  // Pre-calculate next video for preloading
  const nextVideo = React.useMemo(() => {
    if (currentNodeIndex >= timeline.length - 1) return null;
    const nextNode = timeline[currentNodeIndex + 1];
    if (!nextNode) return null;
    
    const keyword = nextNode.videoKeyword || '';
    const localMatch = localAssets.find(a => a.name.toLowerCase().includes(keyword.toLowerCase()));
    if(localMatch) return { url: localMatch.blobUrl };

    return interviewMemories.find(m => m.name.toLowerCase().includes(keyword.toLowerCase()));
  }, [currentNodeIndex, interviewMemories, timeline, localAssets]);

  
  useEffect(() => {
    const node = timeline[currentNodeIndex];
    if (node && node.videoKeyword && !currentVideo) {
      setMissingLogs(prev => {
        if (!prev.includes(node.videoKeyword)) {
          console.warn(`[素材匹配日志] 找不到关键字为 "${node.videoKeyword}" 的视频`);
          return [...prev, node.videoKeyword];
        }
        return prev;
      });
    }
  }, [currentNodeIndex, currentVideo, timeline]);

  const videoRef = useRef(null);

  // Media Session API Integration
  useEffect(() => {
    if ('mediaSession' in navigator && currentVideo) {
      const node = timeline[currentNodeIndex];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: node?.question || '采访记录',
        artist: '我们的三周年',
        album: '情侣采访',
        artwork: [
          { src: currentVideo.thumbnail || '', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => { 
        if (isEnded) { 
          setIsEnded(false); 
          if (videoRef.current) videoRef.current.currentTime = 0; 
        }
        setIsPlaying(true); 
      });
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => { 
        setCurrentNodeIndex(prev => Math.max(0, prev - 1));
        setIsEnded(false); setShowNextHint(false); setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => { 
        setCurrentNodeIndex(prev => Math.min(timeline.length - 1, prev + 1));
        setIsEnded(false); setShowNextHint(false); setIsPlaying(true);
      });
    }
  }, [currentVideo, currentNodeIndex, timeline, isEnded]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        const p = videoRef.current.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      }
      else videoRef.current.pause();
    }
  }, [isPlaying, currentNodeIndex]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          revealControls();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          revealControls();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          revealControls();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          setIsFullscreen(prev => !prev);
          revealControls();
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
            revealControls();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen, currentNodeIndex, timeline.length]);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    revealControls();
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) { // Swipe threshold
      if (diff > 0 && currentNodeIndex < timeline.length - 1) {
        handleNext();
        setIsPlaying(true);
      } else if (diff < 0 && currentNodeIndex > 0) {
        handlePrev();
        setIsPlaying(true);
      }
    }
    setTouchStartX(null);
  };

  const handleNodeClick = (index) => {
    if (isFreeMode || index === currentNodeIndex) {
      setCurrentNodeIndex(index);
      setIsEnded(false);
      setShowNextHint(false);
      setIsPlaying(true);
      trackEvent('node_clicked', { index });
    }
  };

  const togglePlay = () => {
    if (isEnded) {
      setIsEnded(false);
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    trackEvent(newIsPlaying ? 'play' : 'pause', { videoId: currentVideo?.id, index: currentNodeIndex });
  };

  const handlePrev = () => {
    const newIndex = Math.max(0, currentNodeIndex - 1);
    setCurrentNodeIndex(newIndex);
    setIsEnded(false);
    setShowNextHint(false);
    trackEvent('switch_question', { direction: 'prev', index: newIndex });
  };

  const handleNext = () => {
    const newIndex = Math.min(timeline.length - 1, currentNodeIndex + 1);
    setCurrentNodeIndex(newIndex);
    setIsEnded(false);
    setShowNextHint(false);
    trackEvent('switch_question', { direction: 'next', index: newIndex });
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      
      if (isAutoPlay && !isFreeMode && currentNodeIndex < timeline.length - 1 && duration > 0) {
        const timeLeft = duration - current;
        if (timeLeft <= 2.5 && timeLeft > 0) {
          if (!showNextHint) setShowNextHint(true);
        } else {
          if (showNextHint) setShowNextHint(false);
        }
      } else {
        if (showNextHint) setShowNextHint(false);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      setDuration(d);
      
      // Auto-update duration in timeline if not set or 0
      if (timeline[currentNodeIndex] && (!timeline[currentNodeIndex].duration || timeline[currentNodeIndex].duration === 0)) {
         const newTimeline = [...timeline];
         newTimeline[currentNodeIndex] = { ...newTimeline[currentNodeIndex], duration: Math.round(d) };
         setTimeline(newTimeline);
      }
    }
  };

  const handleProgressClick = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
    setCurrentTime(pos * duration);
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleWheel = (e) => {
    if (showVolumeSlider) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setVolume(prev => Math.min(Math.max(0, prev + delta), 1));
      if (isMuted && delta > 0) setIsMuted(false);
    }
  };

  const currentTheme = isDarkMode ? THEME_CONFIG.dark : THEME_CONFIG.light;
  const metrics = THEME_CONFIG.metrics;

  const cssVariables = `
    .interview-mode-container {
      --color-primary: ${currentTheme.colors.primary};
      --color-primary-hover: ${currentTheme.colors.primaryHover};
      --color-secondary: ${currentTheme.colors.secondary};
      --color-bg: ${currentTheme.colors.bg};
      --color-surface: ${currentTheme.colors.surface};
      --color-surface-hover: ${currentTheme.colors.surfaceHover};
      --color-text: ${currentTheme.colors.text};
      --color-text-muted: ${currentTheme.colors.textMuted};
      --color-text-hint: ${currentTheme.colors.textHint};
      --color-border: ${currentTheme.colors.border};
      --color-success: ${currentTheme.colors.success};
      --color-warning: ${currentTheme.colors.warning};
      --color-danger: ${currentTheme.colors.danger};
      --color-danger-bg: ${currentTheme.colors.dangerBg};
      --color-toolbar-bg: ${currentTheme.colors.toolbarBg};
      --color-toolbar-bg-hover: ${currentTheme.colors.toolbarBgHover};

      --radius-sm: ${metrics.radius.sm};
      --radius-md: ${metrics.radius.md};
      --radius-lg: ${metrics.radius.lg};
      --radius-xl: ${metrics.radius.xl};
      --radius-xxl: ${metrics.radius.xxl};
      --radius-full: ${metrics.radius.full};

      --shadow-sm: ${metrics.shadows.sm};
      --shadow-md: ${metrics.shadows.md};
      --shadow-lg: ${metrics.shadows.lg};
      --shadow-xl: ${metrics.shadows.xl};
      --shadow-glow: ${metrics.shadows.glow};

      --spacing-sm: ${metrics.spacing.sm};
      --spacing-md: ${metrics.spacing.md};
      --spacing-lg: ${metrics.spacing.lg};
      --spacing-xl: ${metrics.spacing.xl};
      --spacing-xxl: ${metrics.spacing.xxl};

      --font-weight-normal: ${metrics.fontWeight.normal};
      --font-weight-medium: ${metrics.fontWeight.medium};
      --font-weight-bold: ${metrics.fontWeight.bold};
    }
  `;

  return (
    <div className="interview-mode-container" style={{ 
      position: 'fixed', inset: 0, zIndex: 100, 
      background: 'var(--color-bg)', overflow: 'hidden',
      fontFamily: THEME_CONFIG.fonts.body,
      color: 'var(--color-text)',
      transition: 'background 0.3s, color 0.3s'
    }}>
      <style>{cssVariables}</style>
      
      {/* 1. Background Layer (Atmosphere) */}
      <div className="bg-layer" style={{ 
        position: 'absolute', inset: 0, zIndex: 0, 
        display: 'grid', 
        gridTemplateColumns: windowWidth < 768 ? 'repeat(auto-fill, minmax(80px, 1fr))' : 'repeat(auto-fill, minmax(120px, 1fr))', 
        gap: 'var(--spacing-md)', opacity: 0.3, pointerEvents: 'none' 
      }}>
        {backgroundMemories.map((m, idx) => (
          <LazyBackgroundTile 
            key={m.id}
            memory={m}
            isCurrent={currentVideo && m.id === currentVideo.id}
            isNext={nextVideo && m.id === nextVideo.id}
            reducedMotion={effectiveReducedMotion}
            windowWidth={windowWidth}
          />
        ))}
      </div>

      {/* 2. Top Navigation */}
      <div className="top-nav" style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, height: '80px', 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        zIndex: 20,
        background: 'linear-gradient(to bottom, var(--color-bg) 40%, transparent)',
        pointerEvents: isFullscreen ? 'none' : 'auto',
        opacity: isFullscreen ? 0 : 1, transition: 'opacity 0.3s'
      }}>
        {/* Centered Title */}
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            fontFamily: "'Dancing Script', 'Pacifico', cursive", // Artistic font
            fontSize: '32px',
            color: 'var(--color-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-lg)',
            textShadow: 'var(--shadow-sm)',
            fontWeight: 'var(--font-weight-normal)',
            letterSpacing: '2px'
          }}
        >
          <Heart fill="var(--color-primary)" color="var(--color-primary)" size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(255,105,180,0.3))' }} />
          我们的采访
          <Heart fill="var(--color-secondary)" color="var(--color-secondary)" size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(100,100,255,0.3))' }} />
        </motion.h2>

        {/* Right side controls (Volume only, Exit handled by ModeSwitcher) */}
        <div style={{ position: 'absolute', right: '30px', display: 'flex', gap: 'var(--spacing-xl)' }}>
          <button onClick={() => setIsMuted(!isMuted)} style={btnStyle}>
            {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
          </button>
        </div>
      </div>

      {/* 3. Core Player Area */}
      <motion.div 
        className="player-area" 
        layout
        style={{ 
          position: isFullscreen ? 'fixed' : 'absolute', 
          top: isFullscreen ? 0 : '50%', 
          left: isFullscreen ? 0 : '50%', 
          transform: isFullscreen ? 'none' : 'translate(-50%, -60%)',
          width: isFullscreen ? '100vw' : 'min(90vw, 1100px)', 
          height: isFullscreen ? '100vh' : 'auto',
          aspectRatio: isFullscreen ? 'auto' : '16/9',
          zIndex: isFullscreen ? 5 : 10,
          boxShadow: isFullscreen ? 'none' : 'var(--shadow-xl)',
          borderRadius: isFullscreen ? 0 : 'var(--radius-xl)', 
          overflow: 'hidden',
          background: '#000',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseMove={revealControls}
        onMouseLeave={() => setShowControls(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={() => setIsFullscreen(!isFullscreen)}
      >
        {currentVideo ? (
          <video 
            ref={videoRef}
            src={currentVideo.url} 
            poster={currentVideo.thumbnail}
            style={{ width: '100%', height: '100%', objectFit: isFullscreen ? 'cover' : 'contain' }}
            muted={isMuted}
            onPlay={revealControls}
            onPause={() => setShowControls(true)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setIsPlaying(false);
              setShowNextHint(false);
              trackEvent('question_completed', { index: currentNodeIndex, duration: duration });
              
              // Mark current as completed
              const newTimeline = [...timeline];
              if (newTimeline[currentNodeIndex]) {
                newTimeline[currentNodeIndex] = { ...newTimeline[currentNodeIndex], isCompleted: true };
                setTimeline(newTimeline);
              }
              
              if (autoPlayTimerRef.current) { clearTimeout(autoPlayTimerRef.current); autoPlayTimerRef.current = null; }
              if (isAutoPlay && !isFreeMode && currentNodeIndex < timeline.length - 1) {
                const capturedIndex = currentNodeIndex;
                autoPlayTimerRef.current = setTimeout(() => {
                  if (currentNodeIndex === capturedIndex && isAutoPlay && !isFreeMode) {
                    handleNext();
                    setIsPlaying(true);
                  }
                  autoPlayTimerRef.current = null;
                }, 500);
              } else {
                setIsEnded(true);
              }
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexDirection: 'column', gap: 'var(--spacing-md)', background: 'var(--color-surface)' }}>
            <p style={{ fontSize: '20px', color: 'var(--color-danger)' }}>未找到匹配的视频素材 😥</p>
            <p style={{ color: 'var(--color-text-muted)' }}>建议: 请确保视频文件名包含关键词 <strong style={{ color: 'var(--color-primary)' }}>『{timeline[currentNodeIndex]?.videoKeyword || 'unknown'}』</strong></p>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
               <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'video/*';
                  input.onchange = (e) => {
                    if(e.target.files.length > 0) {
                      handleAssetImport(e.target.files);
                      handleBindVideo(timeline[currentNodeIndex].id, e.target.files[0].name);
                    }
                  };
                  input.click();
                }}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-lg)', borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-primary)', color: '#fff', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '14px', boxShadow: 'var(--shadow-md)'
                }}
              >
                <LinkIcon size={16}/> 立即绑定视频
              </button>
            </div>
            <small style={{opacity: 0.7, color: 'var(--color-text-muted)'}}>并将视频文件存放在 <code>D:\trea\sucai\caifang</code> 目录中</small>
            {missingLogs.length > 0 && (
              <button 
                onClick={() => setShowMissingLogs(true)}
                style={{ marginTop: 'var(--spacing-md)', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                查看缺失素材日志 ({missingLogs.length})
              </button>
            )}
          </div>
        )}

        {/* Next Hint */}
        <AnimatePresence>
          {showNextHint && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ 
                position: 'absolute', bottom: '100px', right: '30px', background: 'rgba(0,0,0,0.6)', 
                color: '#fff', padding: 'var(--spacing-sm) var(--spacing-lg)', borderRadius: 'var(--radius-xl)', zIndex: 10, 
                fontSize: '14px', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' 
              }}
            >
              即将进入下一题 <SkipForward size={14} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* End Overlay */}
        <AnimatePresence>
          {isEnded && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ 
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 11, 
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                color: '#fff', backdropFilter: 'blur(8px)' 
              }}
            >
              <h3 style={{ fontSize: '28px', marginBottom: 'var(--spacing-md)', fontWeight: 'var(--font-weight-bold)' }}>完成 {currentNodeIndex + 1} / {timeline.length}</h3>
              <p style={{ color: '#ccc', marginBottom: 'var(--spacing-xxl)' }}>当前采访片段已结束</p>
              <div style={{ display: 'flex', gap: 'var(--spacing-xl)' }}>
                <button 
                  aria-label="重播"
                  onClick={() => { setIsEnded(false); if(videoRef.current) videoRef.current.currentTime = 0; setIsPlaying(true); }} 
                  style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderRadius: 'var(--radius-xl)', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '16px', transition: 'background 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} 
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                >
                  <RotateCcw size={20} /> 重播
                </button>
                {currentNodeIndex < timeline.length - 1 && (
                  <button 
                    aria-label="下一题"
                    onClick={() => { handleNext(); setIsPlaying(true); }} 
                    style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderRadius: 'var(--radius-xl)', background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '16px', transition: 'background 0.3s', boxShadow: 'var(--shadow-glow)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-hover)'} 
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary)'}
                  >
                    下一题 <SkipForward size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay Controls */}
        <div 
          className="controls-overlay" 
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            paddingTop: 'var(--spacing-xl)',
            paddingBottom: 'calc(var(--spacing-xxl) + env(safe-area-inset-bottom))',
            paddingLeft: 'calc(var(--spacing-xl) + env(safe-area-inset-left))',
            paddingRight: 'calc(var(--spacing-xl) + env(safe-area-inset-right))',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
            display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)',
            opacity: showControls || !isPlaying ? 1 : 0,
            pointerEvents: showControls || !isPlaying ? 'auto' : 'none',
            zIndex: 2,
            transition: 'opacity 0.3s'
          }}
          onMouseEnter={revealControls}
          onWheel={handleWheel}
        >
          {/* Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', width: '100%', padding: '0 10px' }}>
            <span style={{ color: '#fff', fontSize: '12px', minWidth: '40px' }}>{formatTime(currentTime)}</span>
            <div 
              style={{ 
                flex: 1, height: '6px', background: 'rgba(255,255,255,0.3)', 
                borderRadius: 'var(--radius-sm)', cursor: 'pointer', position: 'relative'
              }}
              onClick={handleProgressClick}
            >
              <div style={{ 
                position: 'absolute', left: 0, top: 0, bottom: 0, 
                width: `${duration ? (currentTime / duration) * 100 : 0}%`, 
                background: 'var(--color-primary)', borderRadius: 'var(--radius-sm)',
                transition: 'width 0.1s linear'
              }} />
            </div>
            <span style={{ color: '#fff', fontSize: '12px', minWidth: '40px' }}>{formatTime(duration)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--spacing-xxl)', position: 'relative' }}>
            {/* Prev Button */}
            <button 
              onClick={handlePrev} 
              disabled={currentNodeIndex === 0}
              aria-label="上一题"
              title="上一题 (←)"
              onFocus={revealControls}
              style={{
                background: 'none', border: 'none', cursor: currentNodeIndex === 0 ? 'not-allowed' : 'pointer',
                color: '#fff', opacity: currentNodeIndex === 0 ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '48px', minHeight: '48px',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => currentNodeIndex > 0 && (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <SkipBack fill="#fff" size={24} />
            </button>

            {/* Play/Pause Button */}
            <button onClick={togglePlay} 
            aria-label={isPlaying ? "暂停" : "播放"} 
            title={isPlaying ? "暂停 (空格)" : "播放 (空格)"}
            onFocus={revealControls}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#fff', transform: 'scale(1.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: '48px', minHeight: '48px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.4)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            >
              {isPlaying ? <Pause fill="#fff" size={32} /> : <Play fill="#fff" size={32} />}
            </button>

            {/* Next Button */}
            <button 
              onClick={handleNext} 
              disabled={currentNodeIndex === timeline.length - 1}
              aria-label="下一题"
              title="下一题 (→)"
              onFocus={revealControls}
              style={{
                background: 'none', border: 'none', cursor: currentNodeIndex === timeline.length - 1 ? 'not-allowed' : 'pointer',
                color: '#fff', opacity: currentNodeIndex === timeline.length - 1 ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minWidth: '48px', minHeight: '48px',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => currentNodeIndex < timeline.length - 1 && (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <SkipForward fill="#fff" size={24} />
            </button>

            {/* Right Side Controls Container */}
            <div style={{ position: 'absolute', right: '10px', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
              
              {/* Volume Control */}
              <div 
                style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  aria-label={isMuted ? "取消静音" : "静音"}
                  title="音量"
                  onFocus={revealControls}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: isMuted ? 'var(--color-primary)' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minWidth: '48px', minHeight: '48px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {isMuted ? <VolumeX size={20}/> : <Volume2 size={20}/>}
                </button>
                
                {/* Volume Slider (Vertical pop-up) */}
                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={{
                        position: 'absolute', bottom: '35px', left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(0,0,0,0.8)', padding: 'var(--spacing-lg) var(--spacing-md)', borderRadius: 'var(--radius-md)',
                        height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 'var(--spacing-md)'
                      }}
                    >
                      <div style={{ fontSize: '10px', color: '#fff' }}>{Math.round((isMuted ? 0 : volume) * 100)}%</div>
                      <input 
                        type="range" min="0" max="1" step="0.01" 
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          if (parseFloat(e.target.value) > 0) setIsMuted(false);
                        }}
                        style={{
                          writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical', width: '4px', height: '100%',
                          accentColor: 'var(--color-primary)', cursor: 'pointer'
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Fullscreen Toggle */}
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)} 
                aria-label={isFullscreen ? "退出全屏" : "全屏播放"}
                onFocus={revealControls}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: '48px', minHeight: '48px',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title={isFullscreen ? "退出全屏 (Esc)" : "全屏播放 (F)"}
              >
                 {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Timeline Area */}
      <div className="timeline-area" style={{
        position: 'absolute', bottom: '0', left: 0, right: 0, height: '30%',
        background: isFullscreen ? 'transparent' : 'linear-gradient(to top, var(--color-bg) 95%, transparent)',
        zIndex: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
        pointerEvents: isFullscreen ? 'none' : 'auto',
        opacity: isFullscreen ? 0 : 1, transition: 'opacity 0.3s'
      }}>
        
        {/* Controls Bar */}
        <div style={{ width: '90%', marginBottom: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <button 
              onClick={() => setIsFreeMode(!isFreeMode)}
              style={{ 
                padding: 'var(--spacing-sm) var(--spacing-lg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)',
                background: isFreeMode ? '#fff' : 'var(--color-primary)',
                color: isFreeMode ? 'var(--color-text-muted)' : '#fff',
                display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {isFreeMode ? <Unlock size={14}/> : <Lock size={14}/>}
              {isFreeMode ? "自由探索" : "心动顺序"}
            </button>

            {!isFreeMode && (
              <button 
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                style={{ 
                  padding: 'var(--spacing-sm) var(--spacing-lg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)',
                  background: isAutoPlay ? 'var(--color-surface-hover)' : '#fff',
                  color: isAutoPlay ? '#ff6b81' : 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {isAutoPlay ? <Play size={14}/> : <Pause size={14}/>}
                自动连播
              </button>
            )}

            <button 
              onClick={() => setShowAssetManager(true)}
              style={{ 
                padding: 'var(--spacing-sm) var(--spacing-lg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)',
                background: 'var(--color-surface)', color: 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              title="管理视频素材 (支持文件夹扫描)"
            >
              <FolderInput size={14}/> 素材
            </button>

            <button 
              onClick={() => setShowLibrary(true)}
              style={{ 
                padding: 'var(--spacing-sm) var(--spacing-lg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)',
                background: 'var(--color-surface)', color: 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              <List size={14}/> 问题库
            </button>

            {timeline.some(t => t.isCompleted) && (
              <button 
                onClick={() => {
                  const completed = timeline.filter(t => t.isCompleted);
                  const uncompleted = timeline.filter(t => !t.isCompleted);
                  setTimeline([...uncompleted, ...completed]);
                  // Adjust current index
                  if (currentNodeIndex < timeline.length) {
                     const currentId = timeline[currentNodeIndex].id;
                     const newIdx = [...uncompleted, ...completed].findIndex(t => t.id === currentId);
                     if (newIdx !== -1) setCurrentNodeIndex(newIdx);
                  }
                }}
                style={{ 
                  padding: 'var(--spacing-sm) var(--spacing-lg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)', color: 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer',
                  transition: 'all 0.3s', fontSize: '12px'
                }}
                title="将已完成移至末尾"
              >
                整理列表
              </button>
            )}
            
            <button 
              onClick={() => {
                if (window.confirm("确定要恢复默认顺序并清空状态吗？")) {
                  setTimeline(INTERVIEW_TIMELINE);
                  setCurrentNodeIndex(0);
                  setIsEnded(false);
                }
              }}
              style={{ 
                padding: 'var(--spacing-sm) var(--spacing-lg)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)',
                background: 'var(--color-surface)', color: 'var(--color-danger)',
                display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', cursor: 'pointer',
                transition: 'all 0.3s', fontSize: '12px'
              }}
              title="恢复默认顺序/清空选择"
            >
              <RotateCcw size={14}/> 重置
            </button>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-hint)' }}>
            拖拽可调整顺序 • {timeline.length} 个问题
          </div>
        </div>

        {/* Reorderable Timeline Track */}
        <Reorder.Group 
          axis="x" 
          values={timeline} 
          onReorder={setTimeline}
          className="timeline-track"
          style={{ 
            width: '100%', height: '120px', 
            display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)',
            overflowX: 'auto', padding: '0 40px',
            listStyle: 'none', scrollbarWidth: 'none'
          }}
        >
          {timeline.map((node, index) => (
            <Reorder.Item 
              key={node.id}
              value={node}
              style={{ position: 'relative', flexShrink: 0, cursor: 'grab' }}
              whileDrag={{ scale: 1.1, zIndex: 10 }}
            >
              <div 
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  opacity: node.isCompleted && index !== currentNodeIndex ? 0.4 : (index === currentNodeIndex || isFreeMode ? 1 : 0.6),
                  filter: node.isCompleted && index !== currentNodeIndex ? 'grayscale(50%)' : 'none',
                  transition: 'all 0.3s'
                }}
              >
                {/* Status Icons */}
                <div style={{ position: 'absolute', top: -15, display: 'flex', gap: 'var(--spacing-sm)', zIndex: 5 }}>
                  {node.isStarred && <Star size={12} fill="#fbbf24" color="#fbbf24" />}
                  {node.isCompleted && <CheckCircle size={12} fill="#34d399" color="#fff" />}
                </div>

                <div 
                  onClick={() => handleNodeClick(index)}
                  style={{ 
                    width: index === currentNodeIndex ? '48px' : '36px', 
                    height: index === currentNodeIndex ? '48px' : '36px',
                    borderRadius: '50%', 
                    background: node.color || 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: index === currentNodeIndex ? `0 0 15px ${node.color || 'var(--color-primary)'}` : 'none',
                    transition: 'all 0.3s',
                    marginBottom: 'var(--spacing-md)',
                    border: node.isStarred ? '3px dashed #fbbf24' : '2px solid transparent'
                  }}>
                  {node.isCompleted ? <CheckCircle size={24} fill="#fff" color={node.color || 'var(--color-primary)'}/> : 
                   (node.nodeType === 'heart' ? <Heart size={18} fill="#fff" color="#fff"/> : <Star size={18} fill="#fff" color="#fff"/>)}
                </div>
                
                <div 
                  onClick={() => handleNodeClick(index)}
                  style={{ 
                    fontSize: '12px', color: 'var(--color-text)', 
                    width: '100px', textAlign: 'center',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    fontWeight: index === currentNodeIndex ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)',
                    textDecoration: node.isCompleted ? 'line-through' : 'none'
                  }}>
                  {node.question}
                </div>

                {/* Quick actions for hover or selected */}
                {index === currentNodeIndex && !isPlaying && (
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newT = [...timeline];
                        newT[index] = { ...newT[index], isStarred: !newT[index].isStarred };
                        setTimeline(newT);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      title={node.isStarred ? "取消标星" : "标星"}
                    >
                      <Star size={14} fill={node.isStarred ? "#fbbf24" : "none"} color={node.isStarred ? "#fbbf24" : "#999"} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newT = [...timeline];
                        newT[index] = { ...newT[index], isCompleted: !newT[index].isCompleted };
                        setTimeline(newT);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      title={node.isCompleted ? "标为未完成" : "标为已完成"}
                    >
                      <CheckCircle size={14} fill={node.isCompleted ? "#34d399" : "none"} color={node.isCompleted ? "#34d399" : "#999"} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'video/*';
                        input.onchange = (ev) => {
                           if(ev.target.files.length > 0) {
                             handleAssetImport(ev.target.files);
                             handleBindVideo(node.id, ev.target.files[0].name);
                           }
                        };
                        input.click();
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      title="绑定/更换视频"
                    >
                      <LinkIcon size={14} color="var(--color-primary)" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Connector Line (Visual only) */}
              {index < timeline.length - 1 && (
                <div style={{ 
                  position: 'absolute', top: index === currentNodeIndex ? '24px' : '18px', 
                  left: '50%', width: 'calc(100% + 20px)', height: '2px', 
                  background: '#eee', zIndex: -1,
                  transform: 'translateX(50%)'
                }} />
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>

      {/* Invisible preloader for next video metadata */}
      {nextVideo && (
        <video src={nextVideo.url} preload="metadata" style={{ display: 'none' }} />
      )}

      {/* Library Modal */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 200, 
              background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)',
              display: 'flex', justifyContent: 'center', alignItems: 'center' 
            }}
            onClick={(e) => e.target === e.currentTarget && setShowLibrary(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              style={{ 
                width: 'min(90vw, 900px)', height: 'min(85vh, 750px)', 
                background: 'rgba(255, 255, 255, 0.65)', 
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '32px', 
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2) inset',
                padding: 'var(--spacing-xl)', 
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
               {/* Header Area */}
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                 <div>
                   <h3 style={{ margin: 0, fontSize: '22px', fontFamily: THEME_CONFIG.fonts.title, color: 'var(--color-text)' }}>采访问题库</h3>
                   <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                     已选 <strong style={{ color: 'var(--color-primary)' }}>{timeline.length}</strong> / 100 题
                   </p>
                 </div>
                 <div style={{ display: 'flex', gap: '8px' }}>
                   <button 
                     onClick={() => setShowSmartGen(true)}
                     style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563', transition: 'all 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}
                     onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
                   >
                     <Shuffle size={14} /> 智能生成
                   </button>
                   <button 
                     onClick={() => setShowPlanManager(true)}
                     style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563', transition: 'all 0.2s' }}
                     onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.8)'}
                     onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.5)'}
                   >
                     <FolderOpen size={14} /> 方案管理
                   </button>
                   <button 
                     onClick={() => setShowLibrary(false)} 
                     style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)' }}
                     onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                     onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                   >
                     <X size={18} />
                   </button>
                 </div>
               </div>

               {/* Dynamic Island Search Bar */}
               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-lg)', position: 'relative', zIndex: 10 }}>
                 <motion.div 
                   layout
                   style={{ 
                     background: 'rgba(20, 20, 20, 0.85)', 
                     backdropFilter: 'blur(10px)',
                     borderRadius: '100px', 
                     padding: '6px 6px 6px 16px',
                     display: 'flex', alignItems: 'center', gap: '10px',
                     boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                     width: 'min(400px, 90%)',
                     transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                   }}
                 >
                   <Search size={16} color="rgba(255,255,255,0.6)" />
                   <input 
                     type="text" 
                     placeholder="搜索问题..." 
                     value={librarySearch}
                     onChange={(e) => setLibrarySearch(e.target.value)}
                     style={{ 
                       background: 'transparent', border: 'none', outline: 'none', 
                       color: '#fff', fontSize: '14px', flex: 1, padding: '4px 0'
                     }}
                   />
                   {librarySearch && (
                     <button 
                        onClick={() => setLibrarySearch('')}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', padding: 0 }}
                     >
                       <X size={12} />
                     </button>
                   )}
                 </motion.div>
               </div>

               {/* Filter Pills */}
               <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
                 {['All', 'Deep', 'Fun', 'Future', 'Custom'].map(cat => (
                   <button
                     key={cat}
                     onClick={() => setLibraryFilter(cat)}
                     style={{
                       padding: '6px 16px', borderRadius: '100px', border: 'none', cursor: 'pointer',
                       background: libraryFilter === cat ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                       color: libraryFilter === cat ? '#fff' : 'var(--color-text-muted)',
                       fontSize: '13px', fontWeight: 500,
                       boxShadow: libraryFilter === cat ? '0 4px 12px rgba(var(--color-primary-rgb), 0.3)' : 'none',
                       transition: 'all 0.2s',
                       border: libraryFilter === cat ? 'none' : '1px solid rgba(255,255,255,0.2)'
                     }}
                   >
                     {cat === 'All' ? '全部' : cat === 'Deep' ? '深情' : cat === 'Fun' ? '趣味' : cat === 'Future' ? '未来' : '自定义'}
                   </button>
                 ))}
               </div>

               {/* Content Area */}
               <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', margin: '0 -8px', padding: '0 8px' }}>
                 
                 {/* Custom Add Input (Visible when Custom tab is active) */}
                 {libraryFilter === 'Custom' && (
                    <div style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.3)', padding: '16px', borderRadius: '16px', border: '1px dashed rgba(0,0,0,0.1)' }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: 'var(--color-text-muted)' }}>添加自定义问题</h4>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          type="text" 
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          placeholder="输入你的采访问题..."
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCustomQuestion()}
                          style={{ 
                            flex: 1, padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', 
                            background: 'rgba(255,255,255,0.8)', outline: 'none', fontSize: '14px'
                          }}
                        />
                        <button 
                          onClick={handleAddCustomQuestion}
                          disabled={!newQuestionText.trim()}
                          style={{ 
                            padding: '0 20px', borderRadius: '12px', border: 'none', 
                            background: newQuestionText.trim() ? 'var(--color-primary)' : '#ccc', 
                            color: '#fff', cursor: newQuestionText.trim() ? 'pointer' : 'not-allowed',
                            fontWeight: 600, fontSize: '14px', transition: 'all 0.2s'
                          }}
                        >
                          添加
                        </button>
                      </div>
                    </div>
                 )}

                 {['Deep', 'Fun', 'Future', 'Custom'].filter(c => libraryFilter === 'All' || libraryFilter === c).map(category => {
                   const source = category === 'Custom' ? customQuestions : QUESTION_LIBRARY.filter(q => q.category === category);
                   const filteredQuestions = source.filter(q => q.question.toLowerCase().includes(librarySearch.toLowerCase()));
                   
                   if (filteredQuestions.length === 0) return null;

                   return (
                     <div key={category} style={{ marginBottom: '24px' }}>
                       <h4 style={{ 
                         marginBottom: '12px', fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                         color: category === 'Deep' ? 'var(--color-primary)' : category === 'Fun' ? '#f59e0b' : category === 'Future' ? '#3b82f6' : '#8b5cf6'
                       }}>
                         {category === 'Deep' ? '❤️ 深情回忆' : category === 'Fun' ? '😄 趣味默契' : category === 'Future' ? '🌟 未来规划' : '✏️ 自定义'} 
                         <span style={{ fontSize: '12px', opacity: 0.6, fontWeight: 400 }}>({filteredQuestions.length})</span>
                       </h4>
                       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                         {filteredQuestions.map(q => {
                            const isActive = timeline.some(t => t.id === q.id);
                            return (
                              <div 
                                key={q.id} 
                                onClick={() => {
                                  if (isActive) {
                                     setTimeline(timeline.filter(t => t.id !== q.id));
                                  } else {
                                     if (timeline.length >= 100) {
                                       alert("最多只能选择100题哦！");
                                       return;
                                     }
                                     setTimeline([...timeline, { 
                                       ...q, 
                                       videoKeyword: `q_${q.id}`, 
                                       nodeType: category === 'Deep' ? 'heart' : 'star', 
                                       color: category === 'Deep' ? 'var(--color-primary)' : category === 'Fun' ? '#fad0c4' : 'var(--color-secondary)',
                                       isCompleted: false,
                                       isStarred: false
                                     }]);
                                  }
                                }}
                                style={{ 
                                  padding: '12px 16px', borderRadius: '16px', 
                                  border: isActive ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.4)', 
                                  background: isActive ? 'rgba(var(--color-primary-rgb), 0.05)' : 'rgba(255,255,255,0.6)', 
                                  cursor: 'pointer', position: 'relative',
                                  transition: 'all 0.2s', display: 'flex', alignItems: 'flex-start', gap: '10px',
                                  boxShadow: isActive ? '0 4px 12px rgba(var(--color-primary-rgb), 0.15)' : '0 2px 4px rgba(0,0,0,0.02)'
                                }}
                                onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.9)')}
                                onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'rgba(255,255,255,0.6)')}
                              >
                                <div style={{ color: isActive ? 'var(--color-primary)' : '#ccc', marginTop: '2px' }}>
                                  {isActive ? <CheckCircle size={16} /> : <Plus size={16} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '14px', color: 'var(--color-text)', fontWeight: isActive ? 600 : 400, marginBottom: '4px', lineHeight: 1.4 }}>{q.question}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--color-text-hint)' }}>建议回答: {q.defaultSpeaker}</div>
                                </div>
                                {category === 'Custom' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (confirm('确定要删除这个问题吗？')) handleDeleteCustomQuestion(q.id);
                                    }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444', opacity: 0.6 }}
                                    title="删除"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            )
                         })}
                       </div>
                     </div>
                   );
                 })}
                 
                 {(librarySearch && ['Deep', 'Fun', 'Future', 'Custom'].every(c => {
                    const source = c === 'Custom' ? customQuestions : QUESTION_LIBRARY.filter(q => q.category === c);
                    return source.filter(q => q.question.toLowerCase().includes(librarySearch.toLowerCase())).length === 0;
                 })) && (
                   <div style={{ textAlign: 'center', color: 'var(--color-text-hint)', padding: '40px 0', background: 'rgba(255,255,255,0.3)', borderRadius: '16px', margin: '20px 0' }}>
                     没有找到匹配的问题
                     {libraryFilter !== 'Custom' && (
                       <button 
                         onClick={() => setLibraryFilter('Custom')}
                         style={{ display: 'block', margin: '10px auto', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                       >
                         去添加自定义问题?
                       </button>
                     )}
                   </div>
                 )}
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plan Manager Modal */}
      <AnimatePresence>
        {showPlanManager && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 210, 
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
              display: 'flex', justifyContent: 'center', alignItems: 'center' 
            }}
            onClick={(e) => e.target === e.currentTarget && setShowPlanManager(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ 
                width: 'min(90vw, 500px)', background: 'var(--color-surface)', borderRadius: 'var(--radius-xxl)', padding: 'var(--spacing-xxl)', 
                display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h3 style={{ margin: 0, fontSize: '20px' }}>方案管理</h3>
                <button onClick={() => setShowPlanManager(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-hint)' }}><X size={20} /></button>
              </div>

              <div style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', gap: 'var(--spacing-md)' }}>
                <input 
                  type="text" 
                  placeholder="新方案名称 (如: 三周年特别版)" 
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  style={{ flex: 1, padding: 'var(--spacing-md) var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid #e5e7eb', outline: 'none' }}
                />
                <button 
                  onClick={() => {
                    if (!newPlanName.trim()) return;
                    setPlans([...plans, { id: Date.now(), name: newPlanName, timeline: [...timeline] }]);
                    setNewPlanName('');
                  }}
                  style={{ padding: 'var(--spacing-md) var(--spacing-xl)', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
                >
                  <Save size={16} /> 保存当前
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '300px', marginBottom: 'var(--spacing-xl)' }}>
                {plans.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--color-text-hint)', margin: 'var(--spacing-xl) 0' }}>暂无保存的方案</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {plans.map(plan => (
                      <div key={plan.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-lg)', background: '#f9fafb', borderRadius: 'var(--radius-lg)' }}>
                        <div>
                          <div style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>{plan.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>包含 {plan.timeline.length} 个问题</div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                          <button 
                            onClick={() => {
                              setTimeline(plan.timeline);
                              setCurrentNodeIndex(0);
                              setIsEnded(false);
                              setShowPlanManager(false);
                              setShowLibrary(false);
                            }}
                            style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: '12px' }}
                          >加载</button>
                          <button 
                            onClick={() => setPlans(plans.filter(p => p.id !== plan.id))}
                            style={{ padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-sm)', background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                          >删除</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--spacing-md)', paddingTop: '20px', borderTop: '1px solid #f0f0f0' }}>
                <button 
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(timeline, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const dlAnchorElem = document.createElement('a');
                    dlAnchorElem.setAttribute("href", url);
                    dlAnchorElem.setAttribute("download", "interview_plan.json");
                    document.body.appendChild(dlAnchorElem);
                    dlAnchorElem.click();
                    document.body.removeChild(dlAnchorElem);
                    URL.revokeObjectURL(url);
                  }}
                  style={{ flex: 1, padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--spacing-sm)', color: '#4b5563' }}
                >
                  <Download size={16} /> 导出当前配置
                </button>
                <label style={{ flex: 1, padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--spacing-sm)', color: '#4b5563', margin: 0 }}>
                  <Upload size={16} /> 导入配置
                  <input 
                    type="file" 
                    accept=".json" 
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const imported = JSON.parse(event.target.result);
                          if (Array.isArray(imported)) {
                            setTimeline(imported);
                            setCurrentNodeIndex(0);
                            setIsEnded(false);
                            setShowPlanManager(false);
                            setShowLibrary(false);
                          }
                        } catch (err) {
                          alert("文件格式错误");
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Generation Modal */}
      <AnimatePresence>
        {showSmartGen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 210, 
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)',
              display: 'flex', justifyContent: 'center', alignItems: 'center' 
            }}
            onClick={(e) => e.target === e.currentTarget && setShowSmartGen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ 
                width: 'min(90vw, 400px)', background: 'var(--color-surface)', borderRadius: 'var(--radius-xxl)', padding: 'var(--spacing-xxl)', 
                display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-xl)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h3 style={{ margin: 0, fontSize: '20px' }}>智能生成题单</h3>
                <button onClick={() => setShowSmartGen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-hint)' }}><X size={20} /></button>
              </div>

              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '14px', color: 'var(--color-text-muted)' }}>总题数 (最多100题)</label>
                <input 
                  type="number" min="1" max="100" 
                  value={genConfig.total} 
                  onChange={e => setGenConfig({...genConfig, total: parseInt(e.target.value) || 10})}
                  style={{ width: '100%', padding: 'var(--spacing-md) var(--spacing-lg)', borderRadius: 'var(--radius-md)', border: '1px solid #e5e7eb', outline: 'none', marginBottom: 'var(--spacing-lg)' }}
                />

                <label style={{ display: 'block', marginBottom: 'var(--spacing-sm)', fontSize: '14px', color: 'var(--color-text-muted)' }}>题目配比 (深情 : 趣味 : 未来)</label>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  <input type="number" min="0" value={genConfig.deep} onChange={e => setGenConfig({...genConfig, deep: parseInt(e.target.value) || 0})} style={{ flex: 1, padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid #e5e7eb', textAlign: 'center' }} title="深情回忆" />
                  <span style={{ display: 'flex', alignItems: 'center' }}>:</span>
                  <input type="number" min="0" value={genConfig.fun} onChange={e => setGenConfig({...genConfig, fun: parseInt(e.target.value) || 0})} style={{ flex: 1, padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid #e5e7eb', textAlign: 'center' }} title="趣味默契" />
                  <span style={{ display: 'flex', alignItems: 'center' }}>:</span>
                  <input type="number" min="0" value={genConfig.future} onChange={e => setGenConfig({...genConfig, future: parseInt(e.target.value) || 0})} style={{ flex: 1, padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid #e5e7eb', textAlign: 'center' }} title="未来规划" />
                </div>
              </div>

              <button 
                onClick={() => {
                  const totalRatio = genConfig.deep + genConfig.fun + genConfig.future;
                  if (totalRatio === 0) { alert("配比总和不能为0"); return; }
                  
                  const deepCount = Math.round((genConfig.deep / totalRatio) * genConfig.total);
                  const funCount = Math.round((genConfig.fun / totalRatio) * genConfig.total);
                  const futureCount = genConfig.total - deepCount - funCount; // Ensure exact total

                  const getRand = (cat, count) => {
                    const pool = QUESTION_LIBRARY.filter(q => q.category === cat);
                    return [...pool].sort(() => 0.5 - Math.random()).slice(0, count).map(q => ({
                      ...q,
                      videoKeyword: `q_${q.id}`, 
                      nodeType: cat === 'Deep' ? 'heart' : 'star', 
                      color: cat === 'Deep' ? 'var(--color-primary)' : cat === 'Fun' ? '#fad0c4' : 'var(--color-secondary)',
                      isCompleted: false,
                      isStarred: false
                    }));
                  };

                  const newList = [
                    ...getRand('Deep', deepCount),
                    ...getRand('Fun', funCount),
                    ...getRand('Future', futureCount)
                  ].sort(() => 0.5 - Math.random()); // Mix them up

                  setTimeline(newList);
                  setCurrentNodeIndex(0);
                  setIsEnded(false);
                  setShowSmartGen(false);
                  setShowLibrary(false);
                }}
                style={{ width: '100%', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'var(--font-weight-bold)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--spacing-sm)' }}
              >
                <Shuffle size={18} /> 生成清单
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Asset Manager Modal */}
      <AnimatePresence>
        {showAssetManager && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 200, 
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
              display: 'flex', justifyContent: 'center', alignItems: 'center' 
            }}
            onClick={() => setShowAssetManager(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ 
                width: 'min(95vw, 900px)', height: 'min(90vh, 800px)', 
                background: 'rgba(255, 255, 255, 0.65)', 
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: '32px', 
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2) inset',
                display: 'flex', flexDirection: 'column', overflow: 'hidden'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', color: '#333' }}>素材管理器</h3>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.5)', color: '#666', border: '1px solid rgba(0,0,0,0.05)' }}>
                    已加载: {localAssets.length} | 已关联: {Object.keys(videoMappings).length}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                  <button 
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.webkitdirectory = true;
                        input.onchange = (e) => handleAssetImport(e.target.files);
                        input.click();
                    }}
                    style={{ 
                      padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-md)', 
                      background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      boxShadow: '0 4px 12px rgba(255, 107, 129, 0.3)'
                    }}
                  >
                    <FolderInput size={16}/> 扫描文件夹
                  </button>
                  <button onClick={() => setShowAssetManager(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={20} /></button>
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-lg)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ color: '#666', borderBottom: '1px solid rgba(0,0,0,0.1)', textAlign: 'left' }}>
                      <th style={{ padding: 'var(--spacing-md)' }}>序号</th>
                      <th style={{ padding: 'var(--spacing-md)' }}>问题</th>
                      <th style={{ padding: 'var(--spacing-md)' }}>关键字/关联状态</th>
                      <th style={{ padding: 'var(--spacing-md)' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.map((item, idx) => {
                      const mapping = videoMappings[item.id];
                      const status = mapping 
                        ? (mapping.type === 'file' ? (localAssets.find(a => a.name === mapping.value) ? 'valid' : 'missing') : 'url')
                        : (localAssets.find(a => a.name.includes(item.videoKeyword || '-----')) ? 'auto-match' : 'empty');
                      
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', transition: 'background 0.2s' }} 
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: 'var(--spacing-md)', color: '#888' }}>{idx + 1}</td>
                          <td style={{ padding: 'var(--spacing-md)', fontWeight: '600', color: '#333' }}>{item.question}</td>
                          <td style={{ padding: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {mapping ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: status === 'missing' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                  <LinkIcon size={12}/> 
                                  {mapping.value}
                                  {status === 'missing' && <span style={{fontSize:'10px', background:'var(--color-danger-bg)', padding:'0 4px', borderRadius:'4px'}}>文件丢失</span>}
                                </div>
                              ) : (
                                <span style={{ color: '#999', fontStyle: 'italic' }}>
                                  关键字: {item.videoKeyword || '无'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: 'var(--spacing-md)' }}>
                             <div style={{ display: 'flex', gap: '8px' }}>
                               <button 
                                 onClick={() => {
                                   const input = document.createElement('input');
                                   input.type = 'file';
                                   input.accept = 'video/*';
                                   input.onchange = (e) => {
                                      if(e.target.files.length > 0) {
                                        handleAssetImport(e.target.files);
                                        handleBindVideo(item.id, e.target.files[0].name);
                                      }
                                   };
                                   input.click();
                                 }}
                                 title="选择文件绑定"
                                 style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                               >
                                 <Paperclip size={14} color="#555"/>
                               </button>
                               {mapping && (
                                 <button 
                                   onClick={() => {
                                      const newMap = {...videoMappings};
                                      delete newMap[item.id];
                                      setVideoMappings(newMap);
                                   }}
                                   title="解绑"
                                   style={{ padding: '6px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', background: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                 >
                                   <X size={14}/>
                                 </button>
                               )}
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Missing Logs Modal */}
      <AnimatePresence>
        {showMissingLogs && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowMissingLogs(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              style={{ width: 'min(90vw, 400px)', background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-xl)', color: 'var(--color-text)' }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ margin: 0, color: 'var(--color-danger)' }}>素材匹配日志</h3>
                <button onClick={() => setShowMissingLogs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }}>
                以下关键字未在 `media/sucai/caifang` 目录中匹配到视频文件，请检查文件名：
              </p>
              <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'var(--color-bg)', padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-md)' }}>
                {missingLogs.map((log, i) => (
                  <div key={i} style={{ padding: 'var(--spacing-sm)', borderBottom: '1px solid var(--color-border)', fontSize: '14px', fontFamily: 'monospace' }}>
                    {log}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const btnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)',
  padding: 'var(--spacing-sm)', borderRadius: '50%', transition: 'background 0.2s'
};

export default InterviewMode;

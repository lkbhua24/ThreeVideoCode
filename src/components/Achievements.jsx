import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Image as ImageIcon, Camera, Video, Calendar, Sparkles, Lock, Clock, Map as MapIcon, BookOpen } from 'lucide-react';

const Achievements = ({ variant = 'overview', refreshKey, extraDefs = [] }) => {
  const [badges, setBadges] = React.useState([]);
  const [open, setOpen] = React.useState(false);

  const computeAchievements = (stats) => {
    const defs = [
      { id: 'city1', label: '初探', desc: '创建1个城市相册', icon: Trophy, unlocked: stats.cityCount >= 1, color: '#4CAF50' },
      { id: 'city3', label: '行者', desc: '创建3个城市相册', icon: Award, unlocked: stats.cityCount >= 3, color: '#66BB6A' },
      { id: 'media20', label: '影集', desc: '累计媒体≥20', icon: ImageIcon, unlocked: stats.totalMedia >= 20, color: '#42A5F5' },
      { id: 'photo', label: '摄影', desc: '包含照片', icon: Camera, unlocked: stats.hasPhoto, color: '#FF9800' },
      { id: 'video', label: '剪影', desc: '包含视频', icon: Video, unlocked: stats.hasVideo, color: '#AB47BC' },
      { id: 'anniv', label: '纪念', desc: '设置纪念日', icon: Calendar, unlocked: stats.hasAnniversary, color: '#EF5350' },
      { id: 'cover', label: '封面', desc: '设置自定义封面', icon: ImageIcon, unlocked: stats.hasCustomCover, color: '#26C6DA' },
      { id: 'active', label: '活跃', desc: '7天内更新', icon: Sparkles, unlocked: stats.updatedWithin7d, color: '#FF7043' },
      { id: 'city5', label: '城市5', desc: '探索5座城市', icon: MapIcon, unlocked: stats.cityCount >= 5, color: '#5C6BC0' },
      { id: 'city10', label: '城市10', desc: '探索10座城市', icon: MapIcon, unlocked: stats.cityCount >= 10, color: '#3949AB' },
      { id: 'year3', label: '跨年', desc: '覆盖3个年份', icon: Clock, unlocked: stats.yearCount >= 3, color: '#00897B' },
      { id: 'stories3', label: '故事3', desc: '故事数量≥3', icon: BookOpen, unlocked: stats.storyCount >= 3, color: '#8D6E63' },
      { id: 'stories10', label: '故事10', desc: '故事数量≥10', icon: BookOpen, unlocked: stats.storyCount >= 10, color: '#6D4C41' }
    ];
    return [...defs, ...extraDefs];
  };

  const load = async () => {
    try {
      const res = await fetch('/api/travel-pins-all');
      const cities = await res.json();
      let stories = [];
      try {
        const sRes = await fetch('/api/stories');
        if (sRes.ok) stories = await sRes.json();
      } catch (e) {}
      const now = Date.now();
      const totalMedia = cities.reduce((sum, c) => sum + (c.mediaCount || (c.photos ? c.photos.length : 0) || 0), 0);
      const hasVideo = cities.some(c => c.tags && c.tags.includes('Video'));
      const hasPhoto = cities.some(c => c.tags && c.tags.includes('Photo'));
      const hasAnniversary = cities.some(c => !!c.anniversary);
      const hasCustomCover = cities.some(c => !!c.customCover);
      const updatedWithin7d = cities.some(c => Math.abs(now - (c.lastUpdate || 0)) < 7 * 24 * 60 * 60 * 1000);
      const yearSet = new Set();
      cities.forEach(c => {
        if (Array.isArray(c.tags)) {
          c.tags.forEach(t => { if (/^\d{4}$/.test(t)) yearSet.add(t); });
        }
      });
      const stats = { cityCount: cities.length, totalMedia, hasVideo, hasPhoto, hasAnniversary, hasCustomCover, updatedWithin7d, yearCount: yearSet.size, storyCount: stories.length };
      const defs = computeAchievements(stats);
      let seen = {};
      try {
        seen = JSON.parse(localStorage.getItem('achievements_seen_v1') || '{}');
      } catch (e) {}
      const withFlags = defs.map(d => {
        const justUnlocked = d.unlocked && !seen[d.id];
        return { ...d, justUnlocked };
      });
      const updatedSeen = { ...seen };
      withFlags.forEach(d => { if (d.unlocked) updatedSeen[d.id] = true; });
      try {
        localStorage.setItem('achievements_seen_v1', JSON.stringify(updatedSeen));
      } catch (e) {}
      setBadges(withFlags);
    } catch (e) {
      setBadges([]);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const size = variant === 'sidebar' ? 46 : 56;
  const iconSize = variant === 'sidebar' ? 14 : 16;
  const fontSize = variant === 'sidebar' ? 10 : 11;

  if (variant === 'sidebar') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {badges.map(b => {
          const Icon = b.icon;
          const locked = !b.unlocked;
          return (
            <motion.div
              key={b.id}
              title={`${b.label} · ${b.desc}`}
              style={{
                position: 'relative',
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.35)',
                border: `1px solid ${b.color}33`,
                boxShadow: `0 4px 12px ${b.color}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: locked ? 'grayscale(100%)' : 'none',
                opacity: locked ? 0.7 : 1,
                backdropFilter: 'blur(6px)',
                flex: '0 0 auto'
              }}
              initial={b.justUnlocked ? { scale: 0.85, opacity: 0.8 } : false}
              animate={b.justUnlocked ? { scale: [1, 1.15, 1], opacity: [0.9, 1, 1] } : {}}
              transition={b.justUnlocked ? { duration: 0.8, repeat: 2 } : {}}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, gap: '2px' }}>
                <Icon size={iconSize} color={b.color} />
                <span style={{ fontSize: `${fontSize}px`, color: '#333', fontWeight: 600 }}>{b.label}</span>
              </div>
              {locked && (
                <Lock size={12} color="#666" style={{ position: 'absolute', right: '-2px', bottom: '-2px', opacity: 0.7 }} />
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalCount = badges.length;
  const sorted = [...badges].sort((a, b) => (b.unlocked === a.unlocked) ? 0 : (b.unlocked ? 1 : -1)).reverse();
  const hasNew = badges.some(b => b.justUnlocked);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        animate={hasNew ? { scale: [1, 1.08, 1] } : {}}
        transition={hasNew ? { duration: 0.6, repeat: 2 } : {}}
        style={{
          border: 'none',
          background: 'rgba(255,255,255,0.35)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(6px)',
          position: 'relative'
        }}
        title="成就徽章"
      >
        <Trophy size={16} color="#4CAF50" />
        <span style={{
          position: 'absolute',
          right: '-4px',
          bottom: '-4px',
          background: '#4CAF50',
          color: '#fff',
          borderRadius: '9px',
          fontSize: '9px',
          padding: '2px 5px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}>
          {unlockedCount}/{totalCount}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 10, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(255, 255, 255, 0.96)',
                borderRadius: '20px',
                width: '90%',
                maxWidth: '800px',
                padding: '20px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                color: '#333'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Trophy size={20} color="#4CAF50" />
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>成就徽章</span>
                  <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>已点亮 {unlockedCount} / {totalCount}</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem', color: '#666' }}
                  title="关闭"
                >
                  ×
                </button>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '14px'
              }}>
                {sorted.map(b => {
                  const Icon = b.icon;
                  const locked = !b.unlocked;
                  return (
                    <motion.div key={b.id} title={`${b.label} · ${b.desc}`} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px',
                      background: 'rgba(0,0,0,0.02)',
                      borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                    initial={b.justUnlocked ? { scale: 0.85, opacity: 0.8 } : false}
                    animate={b.justUnlocked ? { scale: [1, 1.12, 1], opacity: [0.9, 1, 1] } : {}}
                    transition={b.justUnlocked ? { duration: 0.7, repeat: 2 } : {}}
                    >
                      <div style={{
                        position: 'relative',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        filter: locked ? 'grayscale(100%)' : 'none',
                        opacity: locked ? 0.6 : 1
                      }}>
                        <Icon size={20} color={b.color} />
                        {locked && (
                          <Lock size={14} color="#666" style={{ position: 'absolute', right: '-2px', bottom: '-2px', opacity: 0.7 }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#222' }}>{b.label}</span>
                        <span style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>{b.desc}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Achievements;

import React from 'react';

const BackgroundMedia = ({
  src,
  kind = 'image',
  opacity = 0.45,
  blendMode = 'soft-light',
  filter = 'contrast(1.05) saturate(.95) brightness(.9)'
}) => {
  const containerStyle = {
    position: 'fixed',
    inset: 0, // Ensures it touches all edges regardless of vh/vw quirks
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden'
  };

  const mediaStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block', // Prevents inline spacing issues
    maxHeight: 'none',
    maxWidth: 'none',
    borderRadius: 0,
    opacity,
    mixBlendMode: blendMode,
    filter
  };

  return (
    <div className="background-media-container" style={containerStyle}>
      {kind === 'video' ? (
        <video 
          src={src} 
          autoPlay 
          loop 
          muted 
          playsInline 
          style={mediaStyle} 
        />
      ) : (
        <img 
          src={src} 
          style={mediaStyle} 
          alt="" 
        />
      )}
    </div>
  );
};

export default BackgroundMedia;

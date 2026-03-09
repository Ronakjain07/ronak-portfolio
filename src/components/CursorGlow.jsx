import React, { useEffect, useRef } from 'react';

const CursorGlow = () => {
  const glowRef = useRef(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const handleMouseMove = (e) => {
      glow.style.background = `radial-gradient(700px circle at ${e.clientX}px ${e.clientY}px, rgba(63, 131, 248, 0.15), rgba(63, 131, 248, 0.06) 40%, transparent 70%)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={glowRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        transition: 'background 0.15s ease',
      }}
    />
  );
};

export default CursorGlow;

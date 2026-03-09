import React, { useEffect, useRef } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef(null);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e) => {
      if (e.target.closest('a, button, .dot, input, [role="button"], .interactive')) {
        dotRef.current?.classList.add('hovering');
        ringRef.current?.classList.add('hovering');
      }
    };

    const onOut = (e) => {
      if (e.target.closest('a, button, .dot, input, [role="button"], .interactive')) {
        dotRef.current?.classList.remove('hovering');
        ringRef.current?.classList.remove('hovering');
      }
    };

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.left = `${pos.current.x}px`;
        dotRef.current.style.top = `${pos.current.y}px`;
      }
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top = `${ringPos.current.y}px`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    return null;
  }

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
};

export default CustomCursor;

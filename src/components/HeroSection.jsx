import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './HeroSection.css';

const HeroSection = () => {
  const sectionRef = useRef(null);
  const tiltRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.from('.hero-name-char', {
        y: 120,
        opacity: 0,
        rotateX: -90,
        stagger: 0.035,
        duration: 0.9,
        ease: 'power4.out',
      })
      .from('.hero-subtitle', {
        y: 30, opacity: 0, duration: 0.7, ease: 'power3.out',
      }, '-=0.3')
      .from('.hero-tagline', {
        y: 20, opacity: 0, duration: 0.6, ease: 'power3.out',
      }, '-=0.2')
      .from('.hero-photo-side', {
        scale: 0.85, opacity: 0, duration: 0.8, ease: 'power3.out',
      }, '-=0.5')
      .from('.hero-cta-group > *', {
        y: 20, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'power3.out',
      }, '-=0.3')
      .from('.scroll-indicator', { opacity: 0, duration: 0.5 }, '-=0.2')
      .from('.hero-socials > *', {
        x: 20, opacity: 0, stagger: 0.06, duration: 0.4, ease: 'power3.out',
      }, '-=0.3');
    }, sectionRef);

    // 3D Tilt parallax
    const section = sectionRef.current;
    const tiltEl = tiltRef.current;

    const handleMouseMove = (e) => {
      if (!tiltEl) return;
      const rect = section.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const mouseX = e.clientX - rect.left - centerX;
      const mouseY = e.clientY - rect.top - centerY;

      gsap.to(tiltEl, {
        rotateX: (mouseY / centerY) * -4,
        rotateY: (mouseX / centerX) * 4,
        duration: 0.8, ease: 'power2.out', transformPerspective: 1000,
      });
      gsap.to('.hero-photo', {
        x: (mouseX / centerX) * 20, y: (mouseY / centerY) * 15,
        duration: 0.8, ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(tiltEl, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power2.out' });
      gsap.to('.hero-photo', { x: 0, y: 0, duration: 0.6, ease: 'power2.out' });
    };

    section?.addEventListener('mousemove', handleMouseMove);
    section?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      ctx.revert();
      section?.removeEventListener('mousemove', handleMouseMove);
      section?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const scrollToTerminal = () => {
    const el = document.getElementById('terminal-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const renderName = (text) => {
    return text.split('').map((char, i) => (
      <span key={i} className="hero-name-char">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <section id="hero-section" className="section hero-section" ref={sectionRef}>
      <div className="hero-layout">
        <div className="hero-text-side" ref={tiltRef}>
          <div className="hero-greeting">
            <span className="hero-line" />
            <span className="hero-greeting-text">Hello, I'm</span>
          </div>

          <h1 className="hero-name">
            <span className="hero-name-row">{renderName('RONAK')}</span>
            <span className="hero-name-row">{renderName('JAIN')}</span>
          </h1>

          <p className="hero-subtitle">
            AI & Full-Stack Developer · Exploring Intelligent Systems & Startup Tech
          </p>

          <p className="hero-tagline">
            Curious about how technology can simplify real-world problems.
            I explore AI, automation, and emerging tech — building smarter
            digital products and turning ideas into practical solutions.
          </p>

          <div className="hero-cta-group">
            <button className="hero-cta-primary interactive" onClick={scrollToTerminal}>
              Explore Terminal
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12,5 19,12 12,19" />
              </svg>
            </button>
            <a
              href="https://drive.google.com/file/d/1Zo9k3T3tXdwudKpH_VhQyiGkkIjYkH0N/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-cta-secondary interactive"
            >
              Resume
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15,3 21,3 21,9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>

        <div className="hero-photo-side">
          <img src="/ronak.png" alt="Ronak Jain" className="hero-photo" />
        </div>
      </div>

      <div className="scroll-indicator interactive" onClick={scrollToTerminal}>
        <div className="scroll-line" />
        <span className="scroll-label">SCROLL</span>
      </div>

      <div className="hero-socials">
        <a href="https://github.com/Ronakjain07" target="_blank" rel="noopener noreferrer" className="social-link interactive" aria-label="GitHub">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <a href="https://www.linkedin.com/in/ronak-jain-rj07/" target="_blank" rel="noopener noreferrer" className="social-link interactive" aria-label="LinkedIn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <a href="mailto:ronaktjain07@gmail.com" className="social-link interactive" aria-label="Email">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>
        </a>
        <div className="social-line-v" />
      </div>
    </section>
  );
};

export default HeroSection;

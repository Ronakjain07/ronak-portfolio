import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './RevealSection.css';

gsap.registerPlugin(ScrollTrigger);

const RevealSection = () => {
  const sectionRef = useRef(null);
  const wordsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Word-by-word 3D reveal
      wordsRef.current.forEach((word, i) => {
        if (!word) return;
        gsap.from(word, {
          scrollTrigger: {
            trigger: word,
            start: 'top 88%',
            end: 'top 60%',
            toggleActions: 'play none none none',
          },
          y: 80,
          opacity: 0,
          rotateX: -60,
          filter: 'blur(8px)',
          duration: 0.9,
          delay: i * 0.05,
          ease: 'power3.out',
        });
      });

      // CTA and footer fade in
      gsap.from('.reveal-cta', {
        scrollTrigger: { trigger: '.reveal-cta', start: 'top 85%' },
        y: 30, opacity: 0, duration: 0.7, ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const statement = "LET'S CREATE SOMETHING EXTRAORDINARY";

  return (
    <section id="reveal-section" className="section reveal-section" ref={sectionRef}>
      <div className="reveal-content">
        {/* Statement */}
        <div className="reveal-statement">
          {statement.split(' ').map((word, i) => (
            <span
              key={i}
              className="reveal-word"
              ref={el => wordsRef.current[i] = el}
            >
              {word}
            </span>
          ))}
        </div>

        <p className="reveal-sub">
          Building, experimenting, and pushing technology forward.
          Always open to connecting — let's turn ideas into something useful.
        </p>

        {/* CTA */}
        <div className="reveal-cta">
          <a href="mailto:ronaktjain07@gmail.com" className="reveal-cta-btn interactive">
            Get In Touch
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12,5 19,12 12,19" />
            </svg>
          </a>
          <a
            href="https://drive.google.com/file/d/1Zo9k3T3tXdwudKpH_VhQyiGkkIjYkH0N/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="reveal-cta-outline interactive"
          >
            View Resume
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <a href="https://github.com/Ronakjain07" target="_blank" rel="noopener noreferrer" className="footer-link interactive">GitHub</a>
          <span className="footer-sep">·</span>
          <a href="https://www.linkedin.com/in/ronak-jain-rj07/" target="_blank" rel="noopener noreferrer" className="footer-link interactive">LinkedIn</a>
          <span className="footer-sep">·</span>
          <a href="https://www.instagram.com/ronak_jainnn" target="_blank" rel="noopener noreferrer" className="footer-link interactive">Instagram</a>
          <span className="footer-sep">·</span>
          <a href="mailto:ronaktjain07@gmail.com" className="footer-link interactive">Email</a>
        </div>
        <p className="footer-credit">Designed & Built by Ronak Jain</p>
      </footer>
    </section>
  );
};

export default RevealSection;

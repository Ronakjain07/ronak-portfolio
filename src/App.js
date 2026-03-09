import clarity from '@microsoft/clarity';
import React, { useState, useEffect, useRef } from 'react';
import ReactGA from 'react-ga4';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

import CustomCursor from './components/CustomCursor';
import CursorGlow from './components/CursorGlow';
import ParticleBackground from './components/ParticleBackground';
import HeroSection from './components/HeroSection';
import Terminal from './components/Terminal';
import RevealSection from './components/RevealSection';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

// --- Firebase ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

const CLARITY_ID = process.env.REACT_APP_CLARITY_PROJECT_ID;
if (CLARITY_ID) clarity.init(CLARITY_ID);
const GA_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
if (GA_ID) ReactGA.initialize(GA_ID);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Text Scramble Loader ---
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
const TARGET = 'RONAK JAIN';

const Loader = ({ onLoaded }) => {
  const [displayText, setDisplayText] = useState('');
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 60;
    const framesPerChar = totalFrames / TARGET.length;
    let resolved = 0;

    intervalRef.current = setInterval(() => {
      frame++;
      resolved = Math.min(Math.floor(frame / framesPerChar), TARGET.length);
      let result = '';
      for (let i = 0; i < TARGET.length; i++) {
        if (i < resolved) result += TARGET[i];
        else if (TARGET[i] === ' ') result += ' ';
        else result += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setDisplayText(result);
      setProgress(Math.min((frame / totalFrames) * 100, 100));

      if (frame >= totalFrames) {
        clearInterval(intervalRef.current);
        setDisplayText(TARGET);
        setProgress(100);
        setTimeout(() => {
          setExiting(true);
          setTimeout(onLoaded, 800);
        }, 500);
      }
    }, 33);

    return () => clearInterval(intervalRef.current);
  }, [onLoaded]);

  return (
    <div className={`loader ${exiting ? 'loader-exit' : ''}`}>
      <div className="loader-inner">
        <h1 className="loader-name">{displayText}</h1>
        <div className="loader-progress-track">
          <div className="loader-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="loader-label">Loading portfolio</p>
      </div>
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  const handleLoaded = () => {
    window.scrollTo(0, 0);
    setLoading(false);
  };

  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  }, [loading]);

  return (
    <>
      <CustomCursor />
      {loading && <Loader onLoaded={handleLoaded} />}
      <div className={`app-wrapper ${loading ? 'hidden' : 'visible'}`}>
        {/* Global interactive backgrounds */}
        <ParticleBackground />
        <div className="global-noise" />
        <CursorGlow />
        <HeroSection />
        <Terminal db={db} addDoc={addDoc} collection={collection} />
        <RevealSection />
      </div>
    </>
  );
}

export default App;

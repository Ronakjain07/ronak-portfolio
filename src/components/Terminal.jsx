import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Terminal.css';

// --- Resume Data ---
const personalInfo = {
  resumeUrl: 'https://drive.google.com/file/d/1Zo9k3T3tXdwudKpH_VhQyiGkkIjYkH0N/view?usp=sharing',
  githubUrl: 'https://github.com/Ronakjain07',
  insta: 'https://www.instagram.com/ronak_jainnn',
  linkedinUrl: 'https://www.linkedin.com/in/ronak-jain-rj07/',
  email: 'ronaktjain07@gmail.com',
  website: 'ronakjainn.netlify.app',
  phone: '9328087529',
  projects: [
    {
      name: 'VHM Tex Ind Pvt. Ltd. Website',
      tech: 'HTML5, CSS3, JavaScript, Firebase, Hostinger',
      period: 'June 2025 - July 2025',
      link: 'https://vhmtex.com/',
      bullets: [
        'Designed professional business website from scratch, increasing site traffic by 140% and generating 38 qualified business inquiries within first 8 weeks.',
        'Implemented responsive design achieving compatibility across devices, reducing bounce rate by 42% and improving Google PageSpeed from 67 to 91.',
      ],
    },
    {
      name: 'Secure RFID Vehicle Access Control System',
      tech: 'Arduino, Node.js, C++, RFID Module',
      period: 'March 2025 - April 2025',
      link: '',
      bullets: [
        'Developed IoT-based RFID access system using Arduino Uno and RC522 module, processing 480+ successful authentications with 99.6% accuracy.',
        'Built real-time monitoring dashboard using Node.js and WebSocket protocol for remote vehicle entry/exit tracking.',
      ],
    },
    {
      name: 'JTM Inventory Manager',
      tech: 'ReactJS, HTML5, CSS3, Vercel',
      period: 'April 2024 - May 2024',
      link: 'https://jtm-inventory-manager.vercel.app/',
      bullets: [
        'Built inventory management web app using ReactJS, managing 520+ SKUs across 8 quality categories, improving accuracy from 76% to 93%.',
        'Designed dashboard with data visualization and mobile-responsive layout using React Hooks and Context API, reducing training time by 45%.',
      ],
    },
  ],
  achievements: [
    {
      name: 'Winner at Hack-off V4.0 Hackathon',
      org: 'IET VIT Vellore',
      link: 'https://drive.google.com/file/d/170TqQWe_2Xrl_O64CZ5svf8u2Xvvhexo/view?usp=sharing',
      description: 'Won Hack-off V4.0 by IET for an innovative solution, highlighting problem-solving, teamwork, and presentation skills.',
    },
    {
      name: 'Best UI/UX Award at WomenTechies Hackathon',
      org: 'GDSC VIT Vellore',
      link: '',
      description: 'Won Best UI/UX at WomenTechies Hackathon (GDSC VIT) for designing an intuitive, user-friendly, and impactful interface.',
    },
    {
      name: 'Rajya Puraskar – Bharat Scouts & Guides',
      org: 'Vedant International School',
      link: 'https://drive.google.com/file/d/1G6tpJsqKv0bhfaJ-OPbPJVNMf_rveHiD/view?usp=sharing',
      description: 'Received the prestigious Rajya Puraskar from the Honorable Governor of Gujarat for excellence in scouting and community service.',
    },
  ],
};

const Terminal = ({ db, addDoc, collection }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTerminalLocked, setTerminalLocked] = useState(false);
  const [contactStep, setContactStep] = useState(0);
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);
  const welcomeShown = useRef(false);
  const typingRef = useRef(null);
  const bodyRef = useRef(null);

  // Scroll within terminal body only — prevents outer page scroll
  const scrollToBottom = useCallback(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [history, scrollToBottom]);
  useEffect(() => {
    if (!isTerminalLocked && !isTyping && inputRef.current) inputRef.current.focus();
  }, [isTerminalLocked, isTyping]);

  // Welcome
  useEffect(() => {
    if (!welcomeShown.current) {
      setHistory([
        { type: 'system', content: '┌─────────────────────────────────────────────┐' },
        { type: 'system', content: '│  Welcome to Ronak\'s Interactive Terminal     │' },
        { type: 'system', content: '│  Type \'help\' to see available commands       │' },
        { type: 'system', content: '└─────────────────────────────────────────────┘' },
        { type: 'empty' },
      ]);
      welcomeShown.current = true;
    }
  }, []);

  const addToHistory = useCallback((entries) => {
    const items = Array.isArray(entries) ? entries : [entries];
    setHistory(prev => [...prev, ...items]);
  }, []);

  const typeOutput = useCallback((lines, callback) => {
    setIsTyping(true);
    let i = 0;
    const next = () => {
      if (i < lines.length) {
        addToHistory(lines[i]);
        i++;
        typingRef.current = setTimeout(next, 25);
      } else {
        setIsTyping(false);
        if (callback) callback();
      }
    };
    next();
  }, [addToHistory]);

  const handleCommand = useCallback(async (command) => {
    const cmd = command.toLowerCase().trim();
    if (command) {
      setCommandHistory(prev => [command, ...prev]);
      setHistoryIndex(-1);
    }
    addToHistory({ type: 'prompt', content: command });
    if (cmd.startsWith('cd ')) { handleCommand(cmd.split(' ')[1]); return; }

    let output = [];

    switch (cmd) {
      case 'help':
        output = [
          { type: 'header', content: '── Available Commands ──' },
          { type: 'help', cmd: 'about', desc: 'Who is Ronak?' },
          { type: 'help', cmd: 'experience', desc: 'Professional experience' },
          { type: 'help', cmd: 'projects', desc: 'Featured work' },
          { type: 'help', cmd: 'education', desc: 'Academic background' },
          { type: 'help', cmd: 'skills', desc: 'Technical skills' },
          { type: 'help', cmd: 'achievements', desc: 'Awards & wins' },
          { type: 'help', cmd: 'contact', desc: 'Get in touch' },
          { type: 'help', cmd: 'get-in-touch', desc: 'Send a message' },
          { type: 'help', cmd: 'resume', desc: 'View resume' },
          { type: 'help', cmd: 'clear', desc: 'Clear terminal' },
        ];
        break;

      case 'about':
        output = [
          { type: 'header', content: '── About ──' },
          { type: 'about-photo' },
          { type: 'text', content: 'Final Year CSE student at VIT Vellore. AI & Full-Stack Developer exploring intelligent systems, automation, and startup tech.' },
          { type: 'empty' },
          { type: 'text', content: 'Curious about how technology can simplify real-world problems. I spend most of my time exploring AI, automation, and emerging tech trends — understanding how intelligent systems can improve everyday experiences, from automating workflows to building smarter digital products.' },
          { type: 'empty' },
          { type: 'text', content: 'Particularly interested in the intersection of AI, startups, and entrepreneurship. I like working on ideas, prototyping solutions, and learning how technology can scale impact for businesses and users.' },
          { type: 'empty' },
          { type: 'text', content: 'Always open to connecting with people who are building, experimenting, and pushing technology forward.' },
        ];
        break;

      case 'experience':
        output = [
          { type: 'header', content: '── Experience ──' },
          { type: 'empty' },
          { type: 'exp-title', content: 'Krenko Technologies Pvt. Ltd.', role: 'Full Stack Developer Intern', period: 'May 2025 – June 2025 · Remote' },
          { type: 'exp-bullet', content: 'Built and deployed 12 responsive web layouts with ReactJS, HTML5, and CSS3, improving user engagement by 28% and reducing page load time by 1.8 seconds.' },
          { type: 'exp-bullet', content: 'Translated business requirements into scalable frontend features, collaborating with designers and backend teams across mobile, tablet, and desktop platforms.' },
          { type: 'exp-bullet', content: 'Integrated Firebase authentication and REST APIs, implemented CI/CD pipelines using Git and Vercel, ensuring 99.2% uptime.' },
          { type: 'exp-bullet', content: 'Collaborated directly with business stakeholders to digitize previously manual workflows.' },
          { type: 'empty' },
          { type: 'exp-title', content: 'JTM Textile Industries LLP', role: 'Software Development Engineer Intern', period: 'June 2024 – July 2024 · Ahmedabad' },
          { type: 'exp-bullet', content: 'Built scalable inventory management system using ReactJS and Firebase, managing 850+ daily transactions, reducing stock tracking time from 45 min to 18 min.' },
          { type: 'exp-bullet', content: 'Architected modular React components with clean code practices, reducing development time for new features by 30%.' },
          { type: 'exp-bullet', content: 'Designed responsive UI with mobile-first approach, reducing data entry errors by 32% through intuitive dashboards.' },
          { type: 'exp-bullet', content: 'Contributed to acquisition of 3 new B2B clients through improved digital presence.' },
        ];
        break;

      case 'education':
        output = [
          { type: 'header', content: '── Education ──' },
          { type: 'empty' },
          { type: 'edu', school: 'Vellore Institute of Technology, Vellore', period: '2022 – Present', detail: 'B.Tech in Computer Science & Engineering (Blockchain Technology) · CGPA: 8.72' },
          { type: 'empty' },
          { type: 'edu', school: 'Vedant International School, Ahmedabad', period: '2020 – 2022', detail: 'Higher Secondary Education · Class 12th: 88% · Class 10th: 89%' },
        ];
        break;

      case 'projects':
        output = [{ type: 'header', content: '── Projects ──' }, { type: 'empty' }];
        personalInfo.projects.forEach(p => {
          output.push({ type: 'project', name: p.name, tech: p.tech, link: p.link, period: p.period });
          p.bullets.forEach(b => output.push({ type: 'exp-bullet', content: b }));
          output.push({ type: 'empty' });
        });
        break;

      case 'achievements':
        output = [{ type: 'header', content: '── Achievements ──' }, { type: 'empty' }];
        personalInfo.achievements.forEach(a => {
          output.push({ type: 'achievement', name: a.name, org: a.org, link: a.link });
          output.push({ type: 'text', content: `  ${a.description}` });
          output.push({ type: 'empty' });
        });
        break;

      case 'skills':
        output = [
          { type: 'header', content: '── Technical Skills ──' },
          { type: 'empty' },
          { type: 'skill', label: 'Languages', value: 'Java, JavaScript, C, C++, Python' },
          { type: 'skill', label: 'Web Dev', value: 'ReactJS, Node.js, Next.js, HTML5, CSS3, Bootstrap, TailwindCSS, REST APIs' },
          { type: 'skill', label: 'AI & Auto', value: 'Prompt Engineering, OpenAI API, Workflow Automation, Python Scripting' },
          { type: 'skill', label: 'Databases', value: 'SQL, PostgreSQL, Firebase, Supabase, SheetsDB' },
          { type: 'skill', label: 'Tools', value: 'Git, GitHub, Vercel, Figma, Arduino, RFID, CI/CD' },
          { type: 'skill', label: 'Concepts', value: 'DSA, OS, Computer Networks, SDLC, OOP' },
        ];
        break;

      case 'contact':
        output = [
          { type: 'header', content: '── Contact ──' },
          { type: 'empty' },
          { type: 'contact-row', label: 'Email', value: personalInfo.email, href: `mailto:${personalInfo.email}` },
          { type: 'contact-row', label: 'LinkedIn', value: 'ronak-jain-rj07', href: personalInfo.linkedinUrl },
          { type: 'contact-row', label: 'GitHub', value: 'Ronakjain07', href: personalInfo.githubUrl },
          { type: 'contact-row', label: 'Website', value: personalInfo.website, href: `https://${personalInfo.website}` },
          { type: 'contact-row', label: 'Phone', value: personalInfo.phone, href: `tel:${personalInfo.phone}` },
        ];
        break;

      case 'resume':
        output = [{ type: 'success', content: '→ Opening resume...' }];
        window.open(personalInfo.resumeUrl, '_blank');
        break;

      case 'get-in-touch':
        output = [{ type: 'success', content: '→ Opening Gmail...' }];
        window.open('mailto:ronaktjain07@gmail.com?subject=Hey%20Ronak!&body=Hi%20Ronak,%0A%0A', '_blank');
        break;

      case 'clear':
        setHistory([
          { type: 'system', content: '┌─────────────────────────────────────────────┐' },
          { type: 'system', content: '│  Terminal cleared. Type \'help\' for commands  │' },
          { type: 'system', content: '└─────────────────────────────────────────────┘' },
          { type: 'empty' },
        ]);
        return;

      case 'sudo hire-me':
        output = [
          { type: 'success', content: '✓ Request approved. Sending offer letter... 📧' },
          { type: 'text', content: 'Just kidding — but let\'s talk!' },
          { type: 'text', content: `Type 'get-in-touch' or email ${personalInfo.email}` },
        ];
        break;

      case 'whoami':
        output = [{ type: 'text', content: 'guest — visiting ronak\'s portfolio. Type \'about\' to learn more.' }];
        break;

      case '':
        return;

      default:
        output = [
          { type: 'error', content: `command not found: ${command}` },
          { type: 'text', content: 'Type \'help\' for available commands.' },
        ];
        break;
    }
    typeOutput(output);
  }, [addToHistory, typeOutput]);

  const handleContactInput = useCallback(async (value) => {
    if (contactStep === 1) {
      setContactInfo(prev => ({ ...prev, name: value }));
      addToHistory({ type: 'contact-response', content: value });
      addToHistory({ type: 'contact-prompt', content: 'Your email:' });
      setContactStep(2);
    } else if (contactStep === 2) {
      setContactInfo(prev => ({ ...prev, email: value }));
      addToHistory({ type: 'contact-response', content: value });
      addToHistory({ type: 'contact-prompt', content: `Hey ${contactInfo.name}! Leave your message:` });
      setContactStep(3);
    } else if (contactStep === 3) {
      if (isSubmitting) return;
      setIsSubmitting(true);
      addToHistory({ type: 'contact-response', content: value });
      addToHistory({ type: 'text', content: 'Sending...' });

      try {
        const data = { name: contactInfo.name, email: contactInfo.email, message: value };
        if (db && addDoc && collection) {
          await addDoc(collection(db, 'contacts'), { ...data, timestamp: new Date() });
        }
        await fetch('/.netlify/functions/sendMessage', { method: 'POST', body: JSON.stringify(data) });
        addToHistory({ type: 'success', content: '✓ Message sent! I\'ll get back to you soon.' });
      } catch (error) {
        console.error('Error:', error);
        addToHistory({ type: 'error', content: 'Failed to send. Try again later.' });
      } finally {
        setContactStep(0);
        setContactInfo({ name: '', email: '', message: '' });
        setTerminalLocked(false);
        setIsSubmitting(false);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  }, [contactStep, contactInfo, isSubmitting, db, addDoc, collection, addToHistory]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const idx = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(idx);
        setInput(commandHistory[idx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = historyIndex <= 0 ? -1 : historyIndex - 1;
      setHistoryIndex(idx);
      setInput(idx === -1 ? '' : commandHistory[idx]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isTyping) return;
    if (isTerminalLocked) await handleContactInput(input);
    else await handleCommand(input);
    setInput('');
  };

  const renderLine = (item, index) => {
    switch (item.type) {
      case 'empty': return <p key={index}>&nbsp;</p>;
      case 'system': return <p key={index} className="t-system">{item.content}</p>;
      case 'prompt': return <p key={index} className="t-prompt"><span className="t-user">guest@ronak:~$</span> {item.content}</p>;
      case 'header': return <p key={index} className="t-header">{item.content}</p>;
      case 'help': return (
        <p key={index} className="t-help">
          <span className="t-cmd">{item.cmd}</span>
          <span className="t-desc">— {item.desc}</span>
        </p>
      );
      case 'text': return <p key={index} className="t-text">{item.content}</p>;
      case 'error': return <p key={index} className="t-error">{item.content}</p>;
      case 'success': return <p key={index} className="t-success">{item.content}</p>;
      case 'about-photo': return (
        <div key={index} className="t-photo-row">
          <img src="/ronak.png" alt="Ronak Jain" className="t-photo" />
        </div>
      );
      case 'exp-title': return (
        <div key={index} className="t-exp-title">
          <span className="t-company">{item.content}</span>
          <span className="t-role"> · {item.role}</span>
          <span className="t-period"> · {item.period}</span>
        </div>
      );
      case 'exp-bullet': return <p key={index} className="t-bullet">  • {item.content}</p>;
      case 'edu': return (
        <div key={index} className="t-edu">
          <span className="t-edu-school">▸ {item.school}</span>
          <span className="t-period"> · {item.period}</span>
          <p className="t-edu-detail">{item.detail}</p>
        </div>
      );
      case 'project': return (
        <div key={index} className="t-project">
          <span className="t-project-name">▸ {item.name}</span>
          <span className="t-project-tech"> [{item.tech}]</span>
          <span className="t-period"> · {item.period}</span>
          {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="t-link interactive"> [Live ↗]</a>}
        </div>
      );
      case 'achievement': return (
        <div key={index} className="t-achievement">
          <span className="t-achievement-name">🏆 {item.name}</span>
          <span className="t-achievement-org"> · {item.org}</span>
          {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="t-link interactive"> [View ↗]</a>}
        </div>
      );
      case 'skill': return (
        <p key={index} className="t-skill">
          <span className="t-skill-label">{item.label}</span>
          <span className="t-skill-value">{item.value}</span>
        </p>
      );
      case 'contact-row': return (
        <p key={index} className="t-contact">
          <span className="t-contact-label">{item.label}</span>
          <a href={item.href} target="_blank" rel="noopener noreferrer" className="t-contact-value interactive">{item.value}</a>
        </p>
      );
      case 'contact-prompt': return <p key={index} className="t-cprompt">{item.content}</p>;
      case 'contact-response': return <p key={index} className="t-cresponse">▸ {item.content}</p>;
      default: return <p key={index}>{item.content}</p>;
    }
  };

  // Prevent scroll from propagating to the outer page
  const handleWheel = (e) => {
    const el = bodyRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const atTop = scrollTop === 0 && e.deltaY < 0;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;
    if (atTop || atBottom) {
      // Allow outer scroll only at boundaries
    } else {
      e.stopPropagation();
    }
  };

  return (
    <section id="terminal-section" className="section terminal-section">
      {/* Marquee behind the terminal */}
      <div className="terminal-marquee">
        <div className="marquee-row">
          <div className="marquee-track">
            <span className="marquee-item">DEVELOPER <span className="separator">·</span></span>
            <span className="marquee-item">REACT <span className="separator">·</span></span>
            <span className="marquee-item">NODE.JS <span className="separator">·</span></span>
            <span className="marquee-item">FULL STACK <span className="separator">·</span></span>
            <span className="marquee-item">JAVASCRIPT <span className="separator">·</span></span>
            <span className="marquee-item">CREATIVE <span className="separator">·</span></span>
            <span className="marquee-item">PROBLEM SOLVER <span className="separator">·</span></span>
            <span className="marquee-item">DEVELOPER <span className="separator">·</span></span>
            <span className="marquee-item">REACT <span className="separator">·</span></span>
            <span className="marquee-item">NODE.JS <span className="separator">·</span></span>
            <span className="marquee-item">FULL STACK <span className="separator">·</span></span>
            <span className="marquee-item">JAVASCRIPT <span className="separator">·</span></span>
            <span className="marquee-item">CREATIVE <span className="separator">·</span></span>
            <span className="marquee-item">PROBLEM SOLVER <span className="separator">·</span></span>
          </div>
        </div>
        <div className="marquee-row">
          <div className="marquee-track">
            <span className="marquee-item">SCALABLE <span className="separator">·</span></span>
            <span className="marquee-item">FIREBASE <span className="separator">·</span></span>
            <span className="marquee-item">CLEAN CODE <span className="separator">·</span></span>
            <span className="marquee-item">PRODUCT <span className="separator">·</span></span>
            <span className="marquee-item">AUTOMATION <span className="separator">·</span></span>
            <span className="marquee-item">DESIGN <span className="separator">·</span></span>
            <span className="marquee-item">INNOVATION <span className="separator">·</span></span>
            <span className="marquee-item">SCALABLE <span className="separator">·</span></span>
            <span className="marquee-item">FIREBASE <span className="separator">·</span></span>
            <span className="marquee-item">CLEAN CODE <span className="separator">·</span></span>
            <span className="marquee-item">PRODUCT <span className="separator">·</span></span>
            <span className="marquee-item">AUTOMATION <span className="separator">·</span></span>
            <span className="marquee-item">DESIGN <span className="separator">·</span></span>
            <span className="marquee-item">INNOVATION <span className="separator">·</span></span>
          </div>
        </div>
      </div>

      <div className="terminal-frame" onClick={() => inputRef.current?.focus()}>
        <div className="crt-scanlines" />
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot red interactive" onClick={() => window.location.reload()} />
            <span className="dot yellow interactive" onClick={() => setHistory([
              { type: 'system', content: '┌─────────────────────────────────────────────┐' },
              { type: 'system', content: '│  Terminal cleared. Type \'help\' for commands  │' },
              { type: 'system', content: '└─────────────────────────────────────────────┘' },
              { type: 'empty' },
            ])} />
            <span className="dot green interactive" onClick={() => {
              if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
              else document.exitFullscreen?.();
            }} />
          </div>
          <span className="terminal-title">ronak@portfolio — bash</span>
        </div>
        <div className="terminal-body" ref={bodyRef} onWheel={handleWheel}>
          {history.map((item, i) => renderLine(item, i))}
          {!isTyping && (
            <div className="terminal-input-row">
              <span className="t-user">{isTerminalLocked ? '▸' : 'guest@ronak:~$'}</span>
              <form onSubmit={onSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="terminal-input"
                  autoFocus
                  autoComplete="off"
                  disabled={isSubmitting}
                  spellCheck={false}
                />
              </form>
            </div>
          )}
          {isTyping && <div className="typing-dots"><span/><span/><span/></div>}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </section>
  );
};

export default Terminal;

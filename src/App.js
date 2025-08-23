import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import ReactGA from "react-ga4";

// --- Personal Information & Firebase Config ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
};

// --- Initialize Google Analytics ---
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID;
if (GA_MEASUREMENT_ID) {
  ReactGA.initialize(GA_MEASUREMENT_ID);
}

// --- Content for the commands ---
const personalInfo = {
  resumeUrl:
    "https://drive.google.com/file/d/1Zo9k3T3tXdwudKpH_VhQyiGkkIjYkH0N/view?usp=sharing",
  githubUrl: "https://github.com/Ronakjain07",
  insta: "https://www.instagram.com/ronak_jainnn",
  linkedinUrl: "https://www.linkedin.com/in/ronak-jain-rj07/",
  email: "ronaktjain07@gmail.com",
  projects: [
    {
      name: "VHM Tex Ind Pvt. Ltd. Website | HTML, CSS, Javascript, Firebase, Hostinger",
      link: "https://vhmtex.com/",
      description: `
  • Developed a new user interface from scratch to enhance visual appeal and professionalism.<br/>
  • Improved responsiveness, navigation, and user experience across all devices and screen sizes.<br/>
  • Successfully attracted more business inquiries through a modern, engaging online presence.`,
    },
    {
      name: "JTM Inventory Manager",
      link: "https://jtm-inventory-manager.vercel.app/",
      description: `
  • Developed a responsive web app to manage cloth stock flow by quality, improving inventory accuracy by 40%.<br/>
  • Designed clean, modular React components with dashboard views for real-time tracking.<br/>
  • Enhanced usability for factory teams through intuitive UI/UX and mobile-friendly layouts.`,
    },
    {
      name: "Secure RFID Vehicle Access + Live Monitoring",
      link: "",
      description: `
  • Developed a secure RFID-based car access system using Arduino for keyless vehicle entry.<br/>
  • Created a real-time web interface to monitor door status remotely, enhancing visibility and safety.<br/>
  • Integrated hardware with web tech, applying full-stack IoT and embedded systems problem-solving skills.`,
    },
    {
      name: "Simon-Says Game",
      link: "",
      description: `
  • Developed a secure RFID-based car access system using Arduino for keyless vehicle entry.<br/>
  • Created a real-time web interface to monitor door status remotely, enhancing visibility and safety.<br/>
  • Integrated hardware with web tech, applying full-stack IoT and embedded systems problem-solving skills.`,
    },
    {
      name: "Hoodeye Web",
      link: "",
      description: `
  • Developed a secure RFID-based car access system using Arduino for keyless vehicle entry.<br/>
  • Created a real-time web interface to monitor door status remotely, enhancing visibility and safety.<br/>
  • Integrated hardware with web tech, applying full-stack IoT and embedded systems problem-solving skills.`,
    },
  ],
  achievements: [
    {
      name: "Winner at Hack-off -V4.0 Hackathon | IET",
      link: "https://drive.google.com/file/d/170TqQWe_2Xrl_O64CZ5svf8u2Xvvhexo/view?usp=sharing",
      description:
        "Won for an innovative solution, highlighting problem-solving and teamwork.",
    },
    {
      name: "Best UI/UX Award at Women Techies Hackathon | GDSC VIT",
      description:
        "Won for designing an intuitive, user-friendly, and impactful interface.",
    },
    {
      name: "Rajya Puraskar – Bharat Scouts & Guides",
      description:
        "Received the prestigious Rajya Puraskar from the Governor of Gujarat for excellence in scouting.",
    },
  ],
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Glitch Background Component ---
const GlitchBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}()[]<>!#%&*+-=/;:,_";
    const colors = ["#006fcaff", "#98c379", "#abb2bf", "#e06c75", "#a0b501ff"];
    let columns, rows, letters;

    const initialize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / 16);
      rows = Math.ceil(canvas.height / 16) + 1;
      letters = [];
      for (let i = 0; i < rows * columns; i++) {
        letters.push({
          char: chars[Math.floor(Math.random() * chars.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const draw = () => {
      ctx.fillStyle = "rgba(40, 44, 52, 1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "bold 18px monospace";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        const x = (i % columns) * 16;
        const y = Math.floor(i / columns) * 16;
        ctx.fillStyle = letter.color;
        ctx.fillText(letter.char, x, y);
      }

      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    const animate = () => {
      const updateCount = Math.floor(letters.length * 0.01);
      for (let i = 0; i < updateCount; i++) {
        const index = Math.floor(Math.random() * letters.length);
        letters[index].char = chars[Math.floor(Math.random() * chars.length)];
      }
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      cancelAnimationFrame(animationFrameId);
      initialize();
      animate();
    };

    initialize();
    animate();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="glitch-background" />;
};

// --- Loader Component ---
const Loader = ({ onLoaded }) => {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExit(true);
      setTimeout(onLoaded, 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onLoaded]);

  return (
    <div className={`loader-container ${exit ? "exit" : ""}`}>
      <div className="split-pane left"></div>
      <div className="split-pane right"></div>
      <img src="/logo.png" alt="Ronak Jain Logo" className="logo" />
    </div>
  );
};

// --- Terminal Component ---
const Terminal = () => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isTerminalLocked, setTerminalLocked] = useState(false);
  const [contactStep, setContactStep] = useState(0);
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    message: "",
  }); // UPDATED
  const [isSubmitting, setIsSubmitting] = useState(false);

  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);
  const welcomeMessageShown = useRef(false);

  useEffect(() => {
    if (!isTerminalLocked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isTerminalLocked]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex =
          historyIndex >= commandHistory.length - 1
            ? commandHistory.length - 1
            : historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex >= 0) {
        const newIndex = historyIndex <= 0 ? -1 : historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(newIndex === -1 ? "" : commandHistory[newIndex]);
      }
    }
  };

  const handleCommand = async (command) => {
    const lowerCaseCommand = command.toLowerCase().trim();
    let output = [];

    if (command) {
      setCommandHistory([command, ...commandHistory]);
      setHistoryIndex(-1);
    }

    addHistory(
      `<span class="prompt-history">guest@ronak-portfolio:~$ ${command}</span>`
    );

    if (lowerCaseCommand.startsWith("cd ")) {
      const dir = lowerCaseCommand.split(" ")[1];
      await handleCommand(dir);
      return;
    }

    switch (lowerCaseCommand) {
      case "help":
        output = [
          `<span class="output-header">Available commands:</span>`,
          `  about          - Who is Ronak?`,
          `  experience     - View my professional experience.`,
          `  projects       - Check out my work.`,
          `  skills         - See my list of technical skills.`,
          `  achievements   - View my awards and achievements.`,
          `  contact        - Display my contact information.`,
          `  get-in-touch   - Leave a message for me.`,
          `  resume         - Download my resume.`,
          `  clear          - Clear the terminal screen.`,
          `  exit           - Reload the portfolio.`,
        ];
        break;
      case "about":
        output = [
          "Hello! I'm Ronak Jain.",
          `<div class="about-container"><img src="/ronak.png" alt="A photo of Ronak Jain" class="profile-photo" /><div class="about-text"> - Web Developer with a strong foundation in web technologies and expertise in modern frameworks. With a solid academic background in Computer Science, I have developed a deep understanding of software development principles, allowing me to approach projects with both technical precision and creative problem-solving.</br> - Fueled by an entrepreneurial spirit, I’m passionate about identifying meaningful problems and transforming them into scalable, impactful solutions. I thrive on turning complex concepts into real-world applications—blending strong technical skills with a sharp, results-driven mindset.</br> - Always eager to collaborate and innovate, I’d love to connect with professionals who are equally excited about technology, startups, and building solutions that truly make a difference.</div></div>`,
        ];
        break;
      case "experience":
        output = [
          `<span class="output-header">--- Experience ---</span>`,
          "",
          `<span class="experience-title">Krenko Technologies Pvt. Ltd. | Full Stack Intern (May 2025 - June 2025)</span>`,
          `<p class="experience-item">• Developed responsive website layouts and interactive features, ensuring seamless navigation and engaging user experience.</p>`,
          `<p class="experience-item">• Converted UI/UX designs from Figma/Canva into functional web pages, fixed frontend bugs, and enhanced cross-device performance.</p>`,
          `<p class="experience-item">• Optimized web pages for speed and scalability, maintained clean code, conducted testing, and supported feature deployments.</p>`,
          `<span class="experience-title">VHM Tex Ind Pvt. Ltd. | Software Development Engineer Intern (June 2024 - July 2024)</span>`,
          `<p class="experience-item">• Built a scalable inventory management system using React.js, enhancing UI/UX and reducing stock tracking time by 40%.</p>`,
          `<p class="experience-item">• Developed a modular, reusable front-end architecture for long-term performance and maintainability.</p>`,
          `<p class="experience-item">• Improved internal workflows through clean component-based design and responsive UI implementation.</p>`,
          `<p class="experience-item">• Revamped digital assets and social handles, increasing brand engagement and contributing to 3+ new B2B client acquisitions.</p>`,
          "",
        ];
        break;
      case "projects":
        output = [`<span class="output-header">--- Projects ---</span>`, ""];
        personalInfo.projects.forEach((p) => {
          // Check if a link exists
          if (p.link) {
            // If yes, wrap the entire title in a link
            output.push(
              `<span class="experience-title">> <a href="${p.link}" target="_blank">${p.name}</a></span>`
            );
          } else {
            // If no, just display the title
            output.push(`<span class="experience-title">> ${p.name}</span>`);
          }

          // Split the description into individual, correctly styled bullet points
          const bulletPoints = p.description
            .split("<br/>")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

          bulletPoints.forEach((point) => {
            output.push(`<p class="experience-item">${point}</p>`);
          });

          output.push(""); // Add a space after each project
        });
        break;
      case "achievements":
        output = [
          `<span class="output-header">--- Achievements ---</span>`,
          "",
        ];
        personalInfo.achievements.forEach((a) => {
          output.push(`> ${a.name}`);
          if (a.link)
            output.push(
              `  Link: <a href="${a.link}" target="_blank">${a.link}</a>`
            );
          output.push(`  Description: ${a.description}`);
          output.push("");
        });
        break;
      case "skills":
        output = [
          `<span class="output-header">--- Skills ---</span>`,
          "",
          `<span><span class="skill-label">Languages:</span> Java, Javascript, C, C++, Python</span>`,
          `<span><span class="skill-label">Web Dev:</span> ReactJS, NodeJS, HTML, CSS, Bootstrap, TailwindCSS, Figma, Canva</span>`,
          `<span><span class="skill-label">Databases:</span> SQL, Firebase, Supabase, SheetsDB</span>`,
          `<span><span class="skill-label">Version Control:</span> Git, GitHub, Vercel</span>`,
          `<span><span class="skill-label">Concepts:</span> SDLC, OOP, Operating Systems, Computer Networks</span>`,
          `<span><span class="skill-label">Other Skills:</span> Generative AI, Microsoft Tools, Business Analysis, Customer Acquisition</span>`,
        ];
        break;
      case "contact":
        output = [
          `<span class="output-header">--- Contact Me ---</span>`,
          `Email:      <a href="mailto:${personalInfo.email}">${personalInfo.email}</a>`,
          `Instagram:  <a href="${personalInfo.insta}" target="_blank">${personalInfo.insta}</a>`,
          `LinkedIn:   <a href="${personalInfo.linkedinUrl}" target="_blank">${personalInfo.linkedinUrl}</a>`,
          `GitHub:     <a href="${personalInfo.githubUrl}" target="_blank">${personalInfo.githubUrl}</a>`,
        ];
        break;
      case "resume":
        output = [`Downloading resume...`];
        window.open(personalInfo.resumeUrl, "_blank");
        break;
      case "get-in-touch":
        setTerminalLocked(true);
        setContactStep(1);
        addHistory("Starting contact form...");
        addHistory("Enter your name:");
        return;
      case "clear":
        setHistory([
          "Welcome to Ronak's Portfolio!",
          "Open this in a laptop for better experience.",
          "Press F11 or Fn + F11 for better experience.",
          "Type 'help' to see a list of available commands.",
        ]);
        return;
      case "exit":
        addHistory("Bye! Thanks for visiting...");
        setTimeout(() => {
          document.body.innerHTML = `
            <div style="
              display: flex;
              flex-direction: column; /* Stack items vertically */
              justify-content: center;
              align-items: center;
              height: 100vh;
              width: 100vw;
              background-color: #282c34;
              color: #abb2bf;
              font-family: 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace;
              font-size: 1.5rem;
              margin: 0;
              text-align: center;
            ">
              <p>Thanks for visiting...</p>
              <p style="font-size: 1rem; color: #788399ff;margin-top: -1rem">Made with ❤️ by <b>Ronak Tilokchand Jain</b></p>              
            </div>
          `;
        }, 2000); // Wait 2 seconds
        return;
      default:
        output = [
          `<span class="error-message">Command not found: ${command}</span>`,
          "Type 'help' for a list of available commands.",
        ];
        break;
    }
    addHistory(output);
  };

  const handleContactInput = async (value) => {
    // UPDATED: Added step 2 for email
    if (contactStep === 1) {
      // User entered name
      setContactInfo({ ...contactInfo, name: value });
      addHistory(`> ${value}`);
      addHistory(`Enter your email:`);
      setContactStep(2);
    } else if (contactStep === 2) {
      // User entered email
      setContactInfo({ ...contactInfo, email: value });
      addHistory(`> ${value}`);
      addHistory(
        `Hello, ${contactInfo.name}! Please leave your message below.`
      );
      setContactStep(3);
    } else if (contactStep === 3) {
      // User entered message
      if (isSubmitting) return;

      setIsSubmitting(true);
      addHistory(`> ${value}`);
      addHistory("Thank you for your message! Submitting...");

      try {
        const finalContactInfo = { ...contactInfo, message: value };

        // 1. Save to Firebase
        await addDoc(collection(db, "contacts"), {
          name: finalContactInfo.name,
          email: finalContactInfo.email, // UPDATED
          message: finalContactInfo.message,
          timestamp: new Date(),
        });

        // 2. Send to Telegram
        await fetch("/.netlify/functions/sendMessage", {
          method: "POST",
          body: JSON.stringify(finalContactInfo),
        });

        addHistory("Message sent successfully!");
      } catch (error) {
        console.error("Error submitting form: ", error);
        addHistory("Error: Could not send message. Please try again later.");
      } finally {
        setContactStep(0);
        setContactInfo({ name: "", email: "", message: "" }); // UPDATED
        setTerminalLocked(false);
        setIsSubmitting(false);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    }
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    if (isTerminalLocked) {
      await handleContactInput(input);
    } else {
      await handleCommand(input);
    }
    setInput("");
  };

  const addHistory = (lines) => {
    const linesToAdd = Array.isArray(lines) ? lines : [lines];
    setHistory((prev) => [...prev, ...linesToAdd]);
  };

  useEffect(() => {
    if (!welcomeMessageShown.current) {
      addHistory([
        "Welcome to Ronak's Portfolio!",
        "Open this in a laptop for better experience.",
        "Press F11 or Fn + F11 for better experience",
        "Type 'help' to see a list of available commands.",
        "",
      ]);
      welcomeMessageShown.current = true;
    }
  }, []);

  return (
    <div
      className="terminal-container"
      onClick={() => inputRef.current.focus()}
    >
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
        <div className="terminal-title">guest@ronak-portfolio</div>
      </div>
      <div className="terminal-body">
        {history.map((line, index) => (
          <p key={index} dangerouslySetInnerHTML={{ __html: line }} />
        ))}
        {!isTerminalLocked && (
          <div className="terminal-prompt">
            <span>guest@ronak-portfolio:~$</span>
            <form onSubmit={onFormSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="terminal-input"
                autoFocus
                autoComplete="off"
              />
            </form>
          </div>
        )}
        {isTerminalLocked && contactStep > 0 && !isSubmitting && (
          <div className="terminal-prompt">
            {/* UPDATED: Prompt logic for new step */}
            <span>{contactStep === 1 ? "" : ">"}</span>
            <form onSubmit={onFormSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="terminal-input"
                autoFocus
                autoComplete="off"
              />
            </form>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

// --- Main App component to handle loading logic ---
function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <GlitchBackground />
      {loading && <Loader onLoaded={() => setLoading(false)} />}
      <div className={`terminal-wrapper ${loading ? "hidden" : "visible"}`}>
        <Terminal />
      </div>
    </>
  );
}

export default App;

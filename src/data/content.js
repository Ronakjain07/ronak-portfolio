// ─────────────────────────────────────────────────────────────
//  All portfolio content lives here — edit this file to update
//  the site without touching any component code.
//
//  TODO(Ronak): tighten the Yellow.ai bullets + exact dates with
//  specifics from your LinkedIn — the current copy is intentionally
//  general since those details aren't public.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: 'Ronak Jain',
  firstName: 'Ronak',
  role: 'AI Engineer',
  tagline: 'from prompt to production',
  location: 'Vellore / Ahmedabad, India',
  email: 'ronaktjain07@gmail.com',
  phone: '+91 93280 87529',
  availability: 'Open to AI Engineer roles — graduating 2026',
  intro:
    'I build intelligent products end-to-end — LLM pipelines, agentic workflows and the full-stack engineering that ships them. Currently doing exactly that at Yellow.ai.',
  about: [
    "I'm Ronak Jain — an AI Intern at Yellow.ai, one of the world's leading agentic AI platforms, and a Computer Science engineer (Blockchain Technology) at VIT Vellore, CGPA 8.72. I work where LLMs meet production: prompts, pipelines, evaluations, and the full-stack scaffolding that turns models into real products.",
    'My toolkit pairs the AI layer — OpenAI API, prompt engineering, conversational flows, workflow automation, Python — with a solid engineering base: React, Node.js, PostgreSQL and Firebase. That combination is why my work ships: I have cut page loads by nearly 2 seconds, lifted engagement 28%, and replaced 45-minute manual workflows with 18-minute automated ones.',
    'Away from the editor you’ll find me at hackathons — where I’ve taken home a win at Hack-off V4.0 and the Best UI/UX award at WomenTechies.',
  ],
  stats: [
    { value: 8.72, decimals: 2, suffix: '', label: 'CGPA at VIT Vellore' },
    { value: 15, decimals: 0, suffix: '+', label: 'Projects & layouts shipped' },
    { value: 2, decimals: 0, suffix: '', label: 'Hackathon awards' },
    { value: 99.2, decimals: 1, suffix: '%', label: 'Deployment uptime maintained' },
  ],
  socials: [
    { label: 'GitHub', url: 'https://github.com/Ronakjain07' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/ronak-jain-rj07' },
    { label: 'Email', url: 'mailto:ronaktjain07@gmail.com' },
    { label: 'Instagram', url: 'https://www.instagram.com/ronak_jainnn/' },
  ],
  resumeUrl: '/Ronak_Jain_Resume.pdf',
}

export const skillGroups = [
  {
    title: 'AI & LLMs',
    items: ['OpenAI API', 'Prompt Engineering', 'LLM Integrations', 'Conversational AI', 'Agentic Workflows'],
  },
  {
    title: 'Automation & Scripting',
    items: ['Workflow Automation', 'Python', 'REST APIs', 'WebSockets'],
  },
  {
    title: 'Frontend',
    items: ['React', 'Next.js', 'TailwindCSS', 'HTML5', 'CSS3'],
  },
  {
    title: 'Backend & Data',
    items: ['Node.js', 'PostgreSQL', 'SQL', 'Firebase', 'Supabase'],
  },
  {
    title: 'Languages',
    items: ['Python', 'JavaScript', 'Java', 'C++', 'C'],
  },
  {
    title: 'Tools & Platforms',
    items: ['Git & GitHub', 'Vercel', 'CI/CD', 'Figma', 'Arduino & RFID'],
  },
]

export const marqueeSkills = [
  'OpenAI API', 'Prompt Engineering', 'LLMs', 'Conversational AI', 'Agentic Workflows',
  'Workflow Automation', 'Python', 'React', 'Next.js', 'Node.js', 'PostgreSQL',
  'Firebase', 'Supabase', 'Three.js', 'GSAP', 'REST APIs', 'CI/CD', 'Vercel',
]

export const experience = [
  {
    company: 'Yellow.ai',
    role: 'AI Intern',
    period: '2026 — Present',
    location: 'India',
    points: [
      'Working on one of the world’s leading agentic AI platforms — building prompts, conversation flows and automations that power enterprise customer experiences at scale.',
      'Hands-on with production LLM pipelines: prompt engineering, evaluation and integration of models into real customer-facing workflows.',
      'Collaborating with engineering and product teams shipping AI features used by global brands.',
    ],
    tags: ['LLMs', 'Agentic AI', 'Prompt Engineering', 'Automation'],
  },
  {
    company: 'Krenko Technologies',
    role: 'Full-Stack Developer Intern',
    period: 'May — Jun 2025',
    location: 'Remote',
    points: [
      'Shipped 12 responsive web layouts in React, lifting user engagement by 28% and cutting page load time by 1.8s through code optimisation.',
      'Integrated Firebase authentication and REST APIs, with Git + Vercel CI/CD pipelines maintaining 99.2% uptime.',
      'Translated business requirements into scalable frontend features alongside designers and backend engineers.',
    ],
    tags: ['React', 'Firebase', 'REST APIs', 'CI/CD'],
  },
  {
    company: 'JTM Textile Industries',
    role: 'Software Development Engineer Intern',
    period: 'Jun — Jul 2024',
    location: 'Ahmedabad, India',
    points: [
      'Built a scalable inventory management system handling 850+ daily transactions — stock tracking time dropped from 45 to 18 minutes.',
      'Architected modular React components that cut new-feature development time by 30%.',
      'Mobile-first dashboards reduced data-entry errors by 32% and helped win 3 new B2B clients.',
    ],
    tags: ['React', 'Firebase', 'Dashboards', 'B2B'],
  },
]

export const projects = [
  {
    index: '01',
    title: 'VHM Tex Industries',
    category: 'Business Website',
    year: '2025',
    description:
      'A professional business website designed and built from scratch — site traffic up 140%, 38 qualified inquiries in 8 weeks, PageSpeed score raised from 67 to 91.',
    tags: ['JavaScript', 'Firebase', 'SEO', 'Hostinger'],
    url: 'https://www.vhmtex.com/',
    gradient: ['#f5c26b', '#c2542a'],
  },
  {
    index: '02',
    title: 'RFID Vehicle Access',
    category: 'IoT System',
    year: '2025',
    description:
      'IoT-based secure vehicle access control with Arduino + RC522 — 480+ authentications at 99.6% accuracy, with a real-time Node.js/WebSocket monitoring dashboard.',
    tags: ['Arduino', 'C++', 'Node.js', 'WebSockets'],
    url: 'https://github.com/Ronakjain07',
    gradient: ['#e88b6a', '#7c3fae'],
  },
  {
    index: '03',
    title: 'JTM Inventory Manager',
    category: 'Web Application',
    year: '2024',
    description:
      'React inventory platform managing 520+ SKUs across 8 quality categories — accuracy up from 76% to 93%, and 45% faster onboarding for factory teams.',
    tags: ['React', 'Context API', 'Data Viz', 'Vercel'],
    url: 'https://jtm-inventory-manager.vercel.app',
    gradient: ['#c98bde', '#2f4fd8'],
  },
  {
    index: '04',
    title: 'This Portfolio',
    category: 'Interactive 3D',
    year: '2026',
    description:
      'The site you are on — a scroll-driven WebGL experience with a morphing GPU particle field, custom GLSL shaders, GSAP choreography and buttery Lenis scrolling.',
    tags: ['Three.js', 'R3F', 'GSAP', 'GLSL'],
    url: 'https://github.com/Ronakjain07',
    gradient: ['#8fb8ff', '#b78bff'],
  },
]

export const achievements = [
  {
    title: 'Winner — Hack-off V4.0',
    org: 'IET',
    description:
      'Took first place for an innovative end-to-end solution, judged on problem-solving, engineering and presentation.',
  },
  {
    title: 'Best UI/UX — WomenTechies',
    org: 'GDSC VIT',
    description:
      'Awarded for designing the most intuitive, user-friendly and impactful interface at the hackathon.',
  },
]

export const education = {
  school: 'Vellore Institute of Technology',
  degree: 'B.Tech — Computer Science & Engineering (Blockchain Technology)',
  period: '2022 — 2026',
  detail: 'CGPA 8.72',
}

export const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
]

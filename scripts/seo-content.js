// Build-time SEO/GEO/AEO generator. Reads the single content source
// (src/data/content.js) and produces:
//   1. a semantic, crawler-visible HTML block injected into the page, so
//      AI answer engines (ChatGPT, Perplexity, Claude, Gemini) and any
//      non-JS crawler read the full content — not an empty React root
//   2. a JSON-LD @graph: Person, ProfilePage, WebSite, FAQPage
// Used by the seoPrerender() Vite plugin in vite.config.js.

import {
  profile,
  experience,
  skillGroups,
  projects,
  achievements,
  education,
} from '../src/data/content.js'

const SITE = 'https://ronakjainn.netlify.app'

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// ── 1. Semantic content block (visually hidden, fully crawlable) ──────
export function buildContentHtml() {
  const exp = experience
    .map(
      (job) => `
      <article>
        <h3>${esc(job.role)} — ${esc(job.company)}</h3>
        <p>${esc(job.period)} · ${esc(job.location)}</p>
        <ul>${job.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        <p>Skills: ${job.tags.map(esc).join(', ')}</p>
      </article>`,
    )
    .join('')

  const skills = skillGroups
    .map((g) => `<li><strong>${esc(g.title)}:</strong> ${g.items.map(esc).join(', ')}</li>`)
    .join('')

  const work = projects
    .map(
      (p) => `
      <article>
        <h3>${esc(p.title)} — ${esc(p.category)} (${esc(p.year)})</h3>
        <p>${esc(p.description)}</p>
        <p>Built with: ${p.tags.map(esc).join(', ')}. <a href="${esc(p.url)}">${esc(p.title)}</a></p>
      </article>`,
    )
    .join('')

  const awards = achievements
    .map((a) => `<li><strong>${esc(a.title)}</strong> (${esc(a.org)}) — ${esc(a.description)}</li>`)
    .join('')

  return `
    <div id="seo-content" inert style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:normal;border:0;">
      <h1>${esc(profile.name)} — ${esc(profile.role)} &amp; Full-Stack Developer</h1>
      <p>${esc(profile.intro)}</p>
      <section>
        <h2>About ${esc(profile.name)}</h2>
        ${profile.about.map((p) => `<p>${esc(p)}</p>`).join('')}
        <p>Based in ${esc(profile.location)}. Contact: <a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>.</p>
      </section>
      <section>
        <h2>Experience</h2>
        ${exp}
      </section>
      <section>
        <h2>Skills &amp; Technologies</h2>
        <ul>${skills}</ul>
      </section>
      <section>
        <h2>Projects</h2>
        ${work}
      </section>
      <section>
        <h2>Achievements &amp; Certifications</h2>
        <ul>${awards}</ul>
      </section>
      <section>
        <h2>Education</h2>
        <p>${esc(education.degree)}, ${esc(education.school)} (${esc(education.period)}) — ${esc(education.detail)}.</p>
      </section>
    </div>`
}

// ── 2. JSON-LD @graph ────────────────────────────────────────────────
export function buildJsonLd() {
  const person = {
    '@type': 'Person',
    '@id': `${SITE}/#person`,
    name: profile.name,
    url: SITE,
    image: `${SITE}/ronak-jain.jpg`,
    jobTitle: profile.role,
    description: profile.intro,
    email: `mailto:${profile.email}`,
    worksFor: { '@type': 'Organization', name: 'Yellow.ai', url: 'https://yellow.ai' },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: education.school,
      url: 'https://vit.ac.in',
    },
    address: { '@type': 'PostalAddress', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat', addressCountry: 'IN' },
    nationality: { '@type': 'Country', name: 'India' },
    knowsLanguage: ['English', 'Hindi'],
    hasOccupation: {
      '@type': 'Occupation',
      name: 'AI Engineer',
      occupationalCategory: '15-1252.00',
      skills: skillGroups.flatMap((g) => g.items).join(', '),
    },
    knowsAbout: [
      ...new Set([
        'Artificial Intelligence',
        'Large Language Models',
        'Agentic AI',
        'Agentic RAG',
        'Prompt Engineering',
        'Tool Calling',
        'Conversational AI',
        'Workflow Automation',
        'OpenAI API',
        'FastAPI',
        'React',
        'Next.js',
        'Node.js',
        'Python',
        'TypeScript',
        'PostgreSQL',
        'MongoDB',
        'Full-Stack Development',
      ]),
    ],
    sameAs: profile.socials
      .filter((s) => s.url.startsWith('http'))
      .map((s) => s.url),
  }

  const profilePage = {
    '@type': 'ProfilePage',
    '@id': `${SITE}/#webpage`,
    url: SITE,
    name: `${profile.name} — ${profile.role} & Full-Stack Developer`,
    dateModified: new Date().toISOString().slice(0, 10),
    mainEntity: { '@id': `${SITE}/#person` },
    about: { '@id': `${SITE}/#person` },
    isPartOf: { '@id': `${SITE}/#website` },
  }

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: SITE,
    name: `${profile.name} — Portfolio`,
    description: profile.intro,
    inLanguage: 'en',
    publisher: { '@id': `${SITE}/#person` },
  }

  // AEO: direct answers answer engines can lift verbatim
  const faq = {
    '@type': 'FAQPage',
    '@id': `${SITE}/#faq`,
    mainEntity: [
      {
        q: 'Who is Ronak Jain?',
        a: `Ronak Jain is an AI Engineer and full-stack developer from India. He is an AI Intern at Yellow.ai and a Computer Science engineer (Blockchain Technology) at VIT Vellore with a CGPA of 8.72, graduating in 2026. He builds LLM pipelines, agentic AI workflows and production web applications.`,
      },
      {
        q: 'What does Ronak Jain do?',
        a: `Ronak Jain builds AI-powered products end to end — LLM pipelines, agentic RAG, prompt engineering and conversational AI — alongside full-stack engineering with React, Next.js, FastAPI, Node.js, Python, PostgreSQL and MongoDB.`,
      },
      {
        q: 'Where does Ronak Jain work?',
        a: `Ronak Jain works at Yellow.ai, one of the world's leading agentic AI platforms, as an AI Intern since March 2026, building prompts, conversation flows and automations for enterprise customer experiences.`,
      },
      {
        q: 'What are Ronak Jain’s key skills?',
        a: `His core skills span AI & GenAI (LLMs, Agentic RAG, Tool Calling, Prompt Engineering, Ollama, Claude Code, Cursor), frontend (React, Next.js, Angular), backend (FastAPI, Node.js, Express, REST APIs), databases (PostgreSQL, MongoDB) and languages (Python, JavaScript, TypeScript, Java, C++).`,
      },
      {
        q: 'How can I contact Ronak Jain?',
        a: `You can reach Ronak Jain by email at ${profile.email}, or connect on GitHub (github.com/Ronakjain07) and LinkedIn (linkedin.com/in/ronak-jain-rj07).`,
      },
    ].map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [person, profilePage, website, faq],
  }
  return `<script type="application/ld+json">\n${JSON.stringify(graph)}\n</script>`
}

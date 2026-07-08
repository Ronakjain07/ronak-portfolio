# Ronak Jain — 3D Portfolio

An immersive, scroll-driven portfolio built with a WebGL particle field that
morphs between formations as you move through the page:

**golden dunes → ember globe → DNA helix → vortex ring → starfield**

## Stack

- **React 19 + Vite** — app shell
- **Three.js + @react-three/fiber** — WebGL scene, custom GLSL point shaders
- **GSAP + ScrollTrigger** — entrance choreography & scroll-linked reveals
- **Lenis** — buttery smooth scrolling
- Hand-crafted CSS design system (no UI framework) — theme *“Obsidian & Ember”*
- Fonts: Syne (display), Manrope (body), Instrument Serif (accents)

## Run it

```bash
npm install
npm run dev        # local dev at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Editing content

**All text/data lives in [`src/data/content.js`](src/data/content.js)** —
profile, about paragraphs, stats, skills, experience, projects, achievements,
socials. Edit that one file to update the site; no component changes needed.

### Things you'll probably want to tweak

- **Project links** — the resume PDF didn't expose the real URLs, so all
  projects currently point to your GitHub profile. Replace each `url` in
  `content.js` with the live project links.
- **Résumé** — the download button serves `public/Ronak_Jain_Resume.pdf`.
  Replace that file whenever your resume updates.
- **Particle scene** — formations, per-section colors, spin and brightness
  live in `src/three/sceneState.js` (`SCENES` array). Shapes are generated in
  `src/three/shapes.js`.
- **Theme** — colors/typography tokens are CSS variables at the top of
  `src/index.css`.

## SEO

The head of [`index.html`](index.html) carries the full SEO layer: title/description
tuned for "Ronak Jain" + AI Engineer queries, canonical URL, Open Graph + Twitter
cards with a generated share image (`public/og.png`), and JSON-LD
`ProfilePage`/`Person` structured data (Yellow.ai, VIT, knowsAbout topics).
`public/robots.txt` and `public/sitemap.xml` are served from the root.

- **If the domain changes**, search-replace `ronakjainn.netlify.app` across
  `index.html`, `public/robots.txt` and `public/sitemap.xml` (one sweep).
- Regenerate the share card after editing `scripts/og-template.html`:
  `node scripts/og.mjs`
- three.js loads lazily (`React.lazy`) so first paint ships ~120KB gzip of JS
  instead of ~357KB — keep it that way: **never import `three` in
  `src/three/sceneState.js`** (it's pulled by the main bundle).

## Deploying

Any static host works. Zero-config options:

- **Vercel** — `vercel` (or import the repo at vercel.com). Build command
  `npm run build`, output `dist`.
- **Netlify** — build `npm run build`, publish directory `dist`.

## Dev utilities

`scripts/screenshot.mjs` drives headless Chrome (via `puppeteer-core`) over
the running preview server and saves full-page screenshots per section —
handy for quick visual regression checks:

```bash
npm run preview          # in one terminal
node scripts/screenshot.mjs ./shots
```

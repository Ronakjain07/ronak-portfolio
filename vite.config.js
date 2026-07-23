import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { buildContentHtml, buildJsonLd } from './scripts/seo-content.js'

// Injects a crawler-visible semantic content block + full JSON-LD graph
// into the HTML at build time, generated from src/data/content.js. This
// is what makes the SPA legible to AI answer engines and non-JS crawlers.
function seoPrerender() {
  return {
    name: 'seo-prerender',
    transformIndexHtml(html) {
      return html
        .replace('</head>', `${buildJsonLd()}\n  </head>`)
        .replace('<div id="root"></div>', `<div id="root"></div>\n    ${buildContentHtml()}`)
    },
  }
}

export default defineConfig({
  plugins: [react(), seoPrerender()],
  build: {
    sourcemap: true, // Best Practices: ship source maps for first-party JS
    target: 'es2022', // avoid shipping legacy transpilation to modern browsers
    rollupOptions: {
      output: {
        // three.js dominates the bundle — splitting vendors keeps
        // repeat visits cached even when site code changes.
        manualChunks: {
          three: ['three', '@react-three/fiber'],
          react: ['react', 'react-dom'],
          motion: ['gsap', 'lenis'],
        },
      },
    },
  },
})

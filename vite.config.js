import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
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

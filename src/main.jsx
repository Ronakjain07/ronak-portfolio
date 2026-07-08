import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// No StrictMode: double-mounting in dev churns the WebGL context and
// duplicates GSAP/Lenis side effects for no benefit in this app.
createRoot(document.getElementById('root')).render(<App />)

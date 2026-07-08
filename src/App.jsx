import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneState } from './three/sceneState'

// three.js is ~235KB gzipped — split it out so first paint doesn't wait.
// It streams in behind the preloader, which exists to cover exactly this.
const Scene = lazy(() => import('./three/Scene'))
import { initSmoothScroll, getLenis } from './utils/smooth'
import {
  initSceneTriggers,
  initGlobalAnimations,
  initMagnetic,
  initTilt,
  prefersReducedMotion,
} from './utils/animations'
import { tick } from './utils/sound'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Achievements from './components/Achievements'
import Contact from './components/Contact'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const lenis = initSmoothScroll()
    lenis.stop() // no scrolling behind the preloader
    window.scrollTo(0, 0)

    const setPointer = (x, y) => {
      sceneState.mouse.x = (x / window.innerWidth) * 2 - 1
      sceneState.mouse.y = (y / window.innerHeight) * 2 - 1
      sceneState.hasPointer = true
    }
    const onMouse = (e) => setPointer(e.clientX, e.clientY)
    const onTouch = (e) => {
      const t = e.touches[0]
      if (t) setPointer(t.clientX, t.clientY)
    }
    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })

    // soft UI tick on interactive hovers (no-op unless sound is enabled)
    const onHover = (e) => {
      if (e.target.closest?.('a, button, [data-hover]')) tick()
    }
    window.addEventListener('pointerover', onHover, { passive: true })

    initSceneTriggers()
    initGlobalAnimations()
    const cleanupMagnetic = initMagnetic()
    const cleanupTilt = initTilt()

    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('pointerover', onHover)
      cleanupMagnetic()
      cleanupTilt()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  const onPreloaderDone = useCallback(() => {
    setReady(true)
    sceneState.opacity = 1 // fade the particle field in with the curtain lift

    // signature moment: the field assembles into "RONAK", holds,
    // then bursts into the golden dunes as the headline slides in
    if (!prefersReducedMotion()) {
      sceneState.nameMix = 1
      gsap.delayedCall(2.6, () => {
        sceneState.nameMix = 0
      })
    }

    getLenis()?.start()
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
      <Cursor />
      <Preloader onComplete={onPreloaderDone} />
      <Navbar ready={ready} />

      <main>
        <Hero ready={ready} />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Achievements />
        <Contact />
      </main>

      <div className="grain" aria-hidden="true" />
    </>
  )
}

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
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
import { tick, thump } from './utils/sound'
import { gyroSupported, gyroNeedsPermission, startGyro, requestGyro } from './utils/gyro'
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
import SecretToast from './components/SecretToast'
import { recordSecret } from './utils/secrets'

export default function App() {
  const [ready, setReady] = useState(false)
  // hero entrance is choreographed against the name intro, which on slow
  // networks starts later than the preloader — separate signal
  const [showHero, setShowHero] = useState(false)
  // iOS gates device-orientation behind a user-gesture permission —
  // show a small chip; Android needs nothing and starts silently
  const [motionChip, setMotionChip] = useState(false)
  // Under prefers-reduced-motion the preloader completes synchronously in
  // the CHILD effect phase — before this component's effect creates Lenis.
  // Its start() call hits nothing, so we must not stop() afterwards or
  // scrolling locks forever (html.lenis-stopped → overflow: hidden).
  const preloaderDone = useRef(false)

  useEffect(() => {
    const lenis = initSmoothScroll()
    if (!preloaderDone.current) lenis.stop() // no scrolling behind the preloader
    window.scrollTo(0, 0)

    // belt & braces: whatever happens, never leave the page scroll-locked
    const failsafe = setTimeout(() => getLenis()?.start(), 8000)

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

    // device-tilt parallax for touch devices
    if (!prefersReducedMotion() && gyroSupported()) {
      if (gyroNeedsPermission()) setMotionChip(true)
      else startGyro()
    }

    // easter egg: linger on the hero for 12s without input and the
    // dunes whisper a hint
    let idleTimer
    const armIdle = () => {
      clearTimeout(idleTimer)
      if (prefersReducedMotion()) return
      idleTimer = setTimeout(() => {
        if ((getLenis()?.scroll ?? 0) < 100 && document.visibilityState === 'visible') {
          // forms low, in the open dune area — the big title is above
          sceneState.formationRequest = { kind: 'text', text: 'SCROLL', hold: 1.6, tag: 'idle', y: -1.05 }
          recordSecret('idle')
        }
        armIdle() // re-arm for the truly mesmerised
      }, 12000)
    }
    const idleEvents = ['scroll', 'pointerdown', 'keydown', 'wheel', 'touchstart']
    idleEvents.forEach((ev) => window.addEventListener(ev, armIdle, { passive: true }))
    armIdle()

    // click/tap → shockwave through the particle field from that point
    const reduced = prefersReducedMotion()
    const onClick = (e) => {
      if (reduced) return
      sceneState.shockRequest = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      }
      thump()
    }
    window.addEventListener('click', onClick, { passive: true })

    // console whisper for the developers & recruiters who peek
    console.log(
      '%c✦ psst%c — the logo likes being clicked. five times, fast.\n' +
        'There are 3 secrets on this page. Happy hunting.\n' +
        '%c— Ronak · built with R3F, GSAP & GLSL · github.com/Ronakjain07/ronak-portfolio',
      'color:#eeb96b;font-size:18px;font-weight:700;font-style:italic;font-family:Georgia,serif',
      'color:#cfc8bc;font-size:12px;font-family:sans-serif',
      'color:#8f887c;font-size:11px;font-family:sans-serif',
    )

    initSceneTriggers()
    initGlobalAnimations()
    const cleanupMagnetic = initMagnetic()
    const cleanupTilt = initTilt()

    return () => {
      clearTimeout(failsafe)
      clearTimeout(idleTimer)
      idleEvents.forEach((ev) => window.removeEventListener(ev, armIdle))
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('pointerover', onHover)
      window.removeEventListener('click', onClick)
      cleanupMagnetic()
      cleanupTilt()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  const onPreloaderDone = useCallback(() => {
    preloaderDone.current = true
    setReady(true)
    sceneState.opacity = 1 // fade the particle field in with the curtain lift

    // signature moment: the field assembles into "RONAK", holds, then
    // bursts into the golden dunes as the headline slides in. On mobile
    // networks the three.js chunk can arrive AFTER the preloader, so the
    // sequence waits for the sampled name targets instead of racing them.
    if (!prefersReducedMotion()) {
      const beginIntro = () => {
        sceneState.nameMix = 1
        setShowHero(true) // hero timeline starts its 1.9s delay now
        gsap.delayedCall(2.6, () => {
          sceneState.nameMix = 0
          sceneState.formationTag = '' // intro done — eggs may use the slot
        })
      }
      if (sceneState.nameReady) beginIntro()
      else {
        const started = Date.now()
        const waiter = setInterval(() => {
          if (sceneState.nameReady) {
            clearInterval(waiter)
            beginIntro()
          } else if (Date.now() - started > 8000) {
            clearInterval(waiter) // hopeless connection — skip the intro
            sceneState.formationTag = ''
            setShowHero(true)
          }
        }, 100)
      }
    } else {
      setShowHero(true)
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
        <Hero ready={showHero} />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Achievements />
        <Contact />
      </main>

      <SecretToast />

      {motionChip && (
        <button
          className="motion-chip"
          onClick={async () => {
            await requestGyro()
            setMotionChip(false)
          }}
        >
          <span aria-hidden="true">✦</span> Enable tilt effects
        </button>
      )}

      <div className="grain" aria-hidden="true" />
    </>
  )
}

import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { sceneState } from '../three/sceneState'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

export function initSmoothScroll() {
  if (lenis) return lenis

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let lastSayHi = 0

  lenis.on('scroll', (e) => {
    sceneState.velocity = e.velocity
    // if the visitor scrolls off during the intro name formation, release
    // it — but leave easter-egg formations (which happen mid-page) alone
    if (e.scroll > 240 && sceneState.formationTag === 'intro') {
      sceneState.nameMix = 0
      sceneState.formationTag = ''
    }
    // easter egg: reaching the very bottom makes the starfield say hi
    if (!reducedMotion && e.scroll >= e.limit - 6 && Date.now() - lastSayHi > 40000) {
      lastSayHi = Date.now()
      sceneState.formationRequest = { kind: 'text', text: 'SAY HI', hold: 2, tag: 'sayhi' }
    }
    ScrollTrigger.update()
  })

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function getLenis() {
  return lenis
}

export function scrollToTarget(target) {
  if (!lenis) return
  lenis.scrollTo(target, { offset: 0, duration: 1.6 })
}

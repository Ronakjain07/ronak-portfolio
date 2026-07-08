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

  lenis.on('scroll', (e) => {
    sceneState.velocity = e.velocity
    // if the visitor scrolls off during the name formation, release it
    if (e.scroll > 240) sceneState.nameMix = 0
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

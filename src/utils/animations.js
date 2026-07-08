import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setScene } from '../three/sceneState'
import { whoosh } from './sound'

gsap.registerPlugin(ScrollTrigger)

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Wire every [data-scene] section to the WebGL particle formation.
export function initSceneTriggers() {
  const sections = gsap.utils.toArray('[data-scene]')
  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (self.isActive) {
          setScene(Number(section.dataset.scene))
          whoosh() // no-op unless the visitor enabled sound
        }
      },
    })
  })
}

// Scroll-driven reveals for everything below the hero.
// The hero choreographs its own entrance after the preloader.
export function initGlobalAnimations() {
  const reduced = prefersReducedMotion()

  // Split-word headline reveals
  document.querySelectorAll('[data-split]').forEach((el) => {
    const words = el.querySelectorAll('.sw-inner')
    if (reduced) {
      gsap.set(words, { yPercent: 0 })
      return
    }
    gsap.fromTo(
      words,
      { yPercent: 115 },
      {
        yPercent: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.055,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      },
    )
  })

  // Generic fade-up elements (optional data-delay in seconds)
  document.querySelectorAll('.fade-up').forEach((el) => {
    if (reduced) return
    gsap.fromTo(
      el,
      { y: 44, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 1.05,
        ease: 'power3.out',
        delay: parseFloat(el.dataset.delay || 0),
        // drop the inline transform afterwards or it would override
        // CSS :hover lifts on cards forever
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      },
    )
  })

  // Horizontal rules that draw themselves
  document.querySelectorAll('.line-grow').forEach((el) => {
    if (reduced) return
    gsap.fromTo(
      el,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.4,
        ease: 'power3.inOut',
        scrollTrigger: { trigger: el, start: 'top 92%' },
      },
    )
  })

  // Numeric counters
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const target = parseFloat(el.dataset.counter)
    const decimals = parseInt(el.dataset.decimals || 0, 10)
    if (reduced) {
      el.textContent = target.toFixed(decimals)
      return
    }
    const obj = { v: 0 }
    gsap.to(obj, {
      v: target,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => {
        el.textContent = obj.v.toFixed(decimals)
      },
    })
  })
}

// 3D tilt + glare for cards marked [data-tilt]. The rotated element is
// [data-tilt-inner] (or the card itself); the glare position is exposed
// as --gx/--gy custom properties for a CSS radial-gradient overlay.
export function initTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return () => {}

  const cleanups = []
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    const inner = el.querySelector('[data-tilt-inner]') || el
    gsap.set(el, { perspective: 900 })
    gsap.set(inner, { transformStyle: 'preserve-3d' })
    const rotX = gsap.quickTo(inner, 'rotationX', { duration: 0.5, ease: 'power2.out' })
    const rotY = gsap.quickTo(inner, 'rotationY', { duration: 0.5, ease: 'power2.out' })

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      rotX(-py * 10)
      rotY(px * 10)
      el.style.setProperty('--gx', `${px * 100 + 50}%`)
      el.style.setProperty('--gy', `${py * 100 + 50}%`)
    }
    const onLeave = () => {
      rotX(0)
      rotY(0)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    cleanups.push(() => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    })
  })

  return () => cleanups.forEach((fn) => fn())
}

// Magnetic pull for buttons/links marked [data-magnetic]
export function initMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches) return () => {}

  const cleanups = []
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || 0.35)
    const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'elastic.out(1, 0.4)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'elastic.out(1, 0.4)' })

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      xTo(relX * strength)
      yTo(relY * strength)
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    cleanups.push(() => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    })
  })

  return () => cleanups.forEach((fn) => fn())
}

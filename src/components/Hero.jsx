import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { profile } from '../data/content'
import { prefersReducedMotion } from '../utils/animations'
import { sceneState } from '../three/sceneState'
import { scrollToTarget } from '../utils/smooth'

gsap.registerPlugin(ScrollTrigger)

export default function Hero({ ready }) {
  const root = useRef()

  // Cinematic exit: hero content drifts up and dims as you scroll away,
  // and the title takes a slight velocity skew while the page moves.
  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.to('.hero-inner', {
        yPercent: -16,
        autoAlpha: 0.14,
        scale: 0.975,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 38%', scrub: true },
      })
      gsap.to('.hero-bottom', {
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '25% top', scrub: true },
      })
    }, root)

    const skewTo = gsap.quickTo('.hero-title', 'skewX', { duration: 0.4, ease: 'power2.out' })
    const onTick = () => skewTo(gsap.utils.clamp(-3, 3, sceneState.velocity * 0.06))
    gsap.ticker.add(onTick)

    return () => {
      gsap.ticker.remove(onTick)
      ctx.revert()
    }
  }, [])

  // Entrance choreography — delayed so the headline slides in exactly
  // as the "RONAK" particle formation bursts into dunes (~2s after load).
  useEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(['.hero-line-inner', '.hero-el'], { yPercent: 0, y: 0, autoAlpha: 1 })
        return
      }
      const tl = gsap.timeline({ delay: 2.3 })
      tl.fromTo(
        '.hero-line-inner',
        { yPercent: 112 },
        { yPercent: 0, duration: 1.35, ease: 'power4.out', stagger: 0.14 },
      ).fromTo(
        '.hero-el',
        { y: 34, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', stagger: 0.09 },
        '-=0.85',
      )
    }, root)
    return () => ctx.revert()
  }, [ready])

  return (
    <section className="hero" id="top" data-scene="0" ref={root}>
      <div className="container hero-inner">
        <p className="hero-eyebrow hero-el">
          <span className="pulse-dot" aria-hidden="true" />
          {profile.availability}
        </p>

        <h1 className="hero-title">
          {/* name lives in the h1 for search engines & screen readers */}
          <span className="sr-only">Ronak Jain — </span>
          <span className="hero-line">
            <span className="hero-line-inner">AI Engineer</span>
          </span>
          <span className="hero-line">
            <span className="hero-line-inner hero-line-outline">&amp; Developer</span>
          </span>
        </h1>

        <p className="hero-tagline hero-el">
          <em>{profile.tagline}</em> — hi, I&apos;m {profile.name}.
        </p>

        <div className="hero-row">
          <p className="hero-sub hero-el">{profile.intro}</p>
          <div className="hero-ctas hero-el">
            <a
              className="btn"
              href="#work"
              onClick={(e) => {
                e.preventDefault()
                scrollToTarget('#work')
              }}
              data-magnetic="0.25"
              data-hover
            >
              View my work
              <span className="btn-arrow" aria-hidden="true">
                ↓
              </span>
            </a>
            <a
              className="btn btn-ghost"
              href={profile.resumeUrl}
              download
              data-magnetic="0.25"
              data-cursor="PDF ↓"
            >
              Résumé
            </a>
          </div>
        </div>
      </div>

      <div className="hero-bottom hero-el">
        <span className="hero-scroll-hint">
          <span className="hero-scroll-line" aria-hidden="true" />
          Scroll to explore
        </span>
        <span className="hero-location">{profile.location}</span>
      </div>
    </section>
  )
}

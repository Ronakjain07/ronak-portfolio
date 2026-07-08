import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import SectionHeading from './SectionHeading'
import { skillGroups, marqueeSkills } from '../data/content'
import { sceneState } from '../three/sceneState'
import { prefersReducedMotion } from '../utils/animations'

function MarqueeRow({ items }) {
  const row = [...items, ...items] // duplicated for a seamless loop
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((item, i) => (
          <span className="marquee-item" key={i}>
            {item}
            <span className="marquee-star">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Skills() {
  const root = useRef()

  // GSAP-driven marquee so scroll velocity can bend it: rows speed up
  // and the whole band skews while the page is in motion.
  useEffect(() => {
    if (prefersReducedMotion()) return

    const tracks = root.current.querySelectorAll('.marquee-track')
    const tweens = [...tracks].map((el, i) =>
      gsap.fromTo(
        el,
        { xPercent: i % 2 ? -50 : 0 },
        { xPercent: i % 2 ? 0 : -50, repeat: -1, ease: 'none', duration: 30 },
      ),
    )
    const skewTo = gsap.quickTo('.marquee-band', 'skewX', { duration: 0.4, ease: 'power2.out' })

    const onTick = () => {
      const v = sceneState.velocity
      const boost = 1 + Math.min(Math.abs(v) * 0.02, 1) * 2.2
      tweens.forEach((tween) => tween.timeScale(boost))
      skewTo(gsap.utils.clamp(-6, 6, v * 0.12))
    }
    gsap.ticker.add(onTick)

    return () => {
      gsap.ticker.remove(onTick)
      tweens.forEach((tween) => tween.kill())
    }
  }, [])

  return (
    <section className="section skills" id="skills" data-scene="2" ref={root}>
      <div className="container">
        <SectionHeading number="02" label="Capabilities" title="An AI-first" serif="arsenal" />

        <div className="skills-grid">
          {skillGroups.map((group, i) => (
            <div className="skill-card fade-up" data-delay={(i % 3) * 0.08} key={group.title}>
              <p className="skill-card-index">0{i + 1}</p>
              <h3 className="skill-card-title">{group.title}</h3>
              <ul className="skill-chips">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="marquee-band fade-up">
        <MarqueeRow items={marqueeSkills} />
        <MarqueeRow items={[...marqueeSkills].reverse()} />
      </div>
    </section>
  )
}

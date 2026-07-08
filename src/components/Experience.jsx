import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from './SectionHeading'
import { experience } from '../data/content'
import { prefersReducedMotion } from '../utils/animations'

gsap.registerPlugin(ScrollTrigger)

export default function Experience() {
  const root = useRef()

  // The timeline spine draws itself with scroll; each entry's dot
  // ignites as it crosses into view.
  useEffect(() => {
    if (prefersReducedMotion()) {
      root.current.querySelectorAll('.timeline-item').forEach((el) => el.classList.add('is-lit'))
      return
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.timeline-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'center top',
          scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 45%', scrub: 0.6 },
        },
      )
      gsap.utils.toArray('.timeline-item').forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 70%',
          onEnter: () => item.classList.add('is-lit'),
          onLeaveBack: () => item.classList.remove('is-lit'),
        })
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section experience" id="experience" data-scene="3" ref={root}>
      <div className="container">
        <SectionHeading number="03" label="Experience" title="Where I've" serif="shipped" />

        <div className="timeline">
          <span className="timeline-line" aria-hidden="true" />
          {experience.map((job) => (
            <article className="timeline-item fade-up" key={job.company}>
              <div className="timeline-marker" aria-hidden="true">
                <span className="timeline-dot" />
              </div>

              <div className="timeline-meta">
                <p className="timeline-period">{job.period}</p>
                <p className="timeline-location">{job.location}</p>
              </div>

              <div className="timeline-card" data-hover>
                <h3 className="timeline-role">{job.role}</h3>
                <p className="timeline-company">{job.company}</p>
                <ul className="timeline-points">
                  {job.points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
                <ul className="tag-list">
                  {job.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

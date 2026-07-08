import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from './SectionHeading'
import { projects } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

// Desktop: the section pins while oversized project cards scrub
// horizontally. Mobile: the same cards stack vertically, no pin.
export default function Projects() {
  const section = useRef()
  const track = useRef()
  const fill = useRef()
  const [current, setCurrent] = useState(1)
  const total = projects.length

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px)', () => {
      const getAmount = () => track.current.scrollWidth - window.innerWidth

      gsap.to(track.current, {
        x: () => -getAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: () => '+=' + getAmount(),
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setCurrent(Math.min(total, 1 + Math.round(self.progress * (total - 1))))
            if (fill.current) fill.current.style.transform = `scaleX(${self.progress})`
          },
        },
      })
    })

    return () => mm.revert()
  }, [total])

  return (
    <section className="section projects" id="work" data-scene="4" ref={section}>
      <div className="container projects-head">
        <SectionHeading number="04" label="Selected Work" title="Projects with" serif="real impact" />
      </div>

      <div className="work-viewport">
        <div className="work-track" ref={track}>
          {projects.map((project, i) => (
            <article className="work-card fade-up" data-delay={(i % 4) * 0.06} key={project.index}>
              <a
                className="work-card-link"
                href={project.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.title} — ${project.category}`}
                data-cursor="View ↗"
              >
                <div
                  className="work-card-banner"
                  style={{ '--grad-a': project.gradient[0], '--grad-b': project.gradient[1] }}
                >
                  <span className="work-card-index">{project.index}</span>
                  <span className="work-card-chip">{project.category}</span>
                </div>
                <div className="work-card-body">
                  <h3 className="work-card-title">{project.title}</h3>
                  <p className="work-card-desc">{project.description}</p>
                  <div className="work-card-foot">
                    <span className="tag-list work-card-tags">
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </span>
                    <span className="work-card-year">{project.year}</span>
                  </div>
                </div>
              </a>
            </article>
          ))}

          <article className="work-card work-card-more fade-up">
            <a
              className="work-card-link work-more-link"
              href="https://github.com/Ronakjain07"
              target="_blank"
              rel="noreferrer"
              data-cursor="Open ↗"
            >
              <span className="work-more-star" aria-hidden="true">
                ✦
              </span>
              <span className="work-more-text">
                More experiments
                <br />
                on GitHub
              </span>
              <span className="project-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          </article>
        </div>
      </div>

      <div className="work-progress" aria-hidden="true">
        <span className="work-progress-label">
          0{current} — 0{total}
        </span>
        <span className="work-progress-bar">
          <span className="work-progress-fill" ref={fill} />
        </span>
        <span className="work-progress-hint">Scroll</span>
      </div>
    </section>
  )
}

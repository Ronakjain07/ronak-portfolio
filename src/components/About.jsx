import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import SectionHeading from './SectionHeading'
import { profile, education } from '../data/content'
import { prefersReducedMotion } from '../utils/animations'

const AvatarCard = lazy(() => import('./AvatarCard'))

// The real photo — used as the card's back face and as the fallback
// while the 3D chunk streams in (and for reduced-motion visitors).
function PhotoFace() {
  return (
    <>
      <picture>
        <source srcSet="/ronak-jain.webp" type="image/webp" />
        <img
          className="about-photo"
          src="/ronak-jain.jpg"
          alt="Ronak Jain — AI Engineer"
          loading="lazy"
          width="720"
          height="730"
        />
      </picture>
      <span className="photo-grade" aria-hidden="true" />
    </>
  )
}

export default function About() {
  const portrait = useRef()
  const [flipped, setFlipped] = useState(false)
  const [avatarOn, setAvatarOn] = useState(false)
  const [inView, setInView] = useState(false)

  // Mount the 3D chunk just-in-time as About approaches, and pause its
  // render loop whenever the card is off-screen.
  useEffect(() => {
    if (prefersReducedMotion()) return // photo only — no 3D, no flip
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAvatarOn(true)
          near.disconnect()
        }
      },
      { rootMargin: '900px' },
    )
    const visible = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '120px',
    })
    near.observe(portrait.current)
    visible.observe(portrait.current)
    return () => {
      near.disconnect()
      visible.disconnect()
    }
  }, [])

  return (
    <section className="section about" id="about" data-scene="1">
      <div className="container">
        <SectionHeading number="01" label="About" title="Turning ideas into" serif="living products" />

        <div className="about-grid">
          <div
            className={`about-portrait fade-up ${flipped ? 'is-flipped' : ''}`}
            ref={portrait}
            data-hover
          >
            <div className="about-flip">
              <div className="flip-face flip-front">
                <PhotoFace />
              </div>
              <div className="flip-face flip-back">
                {avatarOn && (
                  <Suspense fallback={<PhotoFace />}>
                    {/* renders only while flipped & on-screen — no idle GPU */}
                    <AvatarCard paused={!inView || !flipped} />
                  </Suspense>
                )}
              </div>
            </div>

            <span className="about-portrait-role">{profile.role}</span>

            {avatarOn && (
              <button
                className="flip-btn"
                onClick={() => setFlipped((f) => !f)}
                aria-pressed={flipped}
                aria-label={flipped ? 'Show real photo' : 'Show 3D avatar'}
              >
                {flipped ? '✦ real me' : '✦ 3D me'}
              </button>
            )}
          </div>

          <div className="about-body">
            {profile.about.map((para, i) => (
              <p className="about-para fade-up" data-delay={i * 0.08} key={i}>
                {para}
              </p>
            ))}

            <div className="about-edu fade-up">
              <span className="about-edu-label">Education</span>
              <p className="about-edu-school">{education.school}</p>
              <p className="about-edu-degree">
                {education.degree} · {education.detail} · {education.period}
              </p>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          {profile.stats.map((stat) => (
            <div className="stat fade-up" key={stat.label}>
              <p className="stat-value">
                <span data-counter={stat.value} data-decimals={stat.decimals}>
                  0
                </span>
                {stat.suffix}
              </p>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

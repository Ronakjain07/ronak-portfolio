import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitWords from './SplitWords'
import { profile } from '../data/content'
import { scrollToTarget } from '../utils/smooth'
import { prefersReducedMotion } from '../utils/animations'

gsap.registerPlugin(ScrollTrigger)

function LocalTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const time = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(now)
  return (
    <p className="footer-time">
      Ahmedabad · {time.toUpperCase()} <abbr title="Indian Standard Time">IST</abbr>
    </p>
  )
}

export default function Contact() {
  const root = useRef()

  // The giant name pours its gold fill in as you scroll to the very end.
  useEffect(() => {
    const fillEl = root.current.querySelector('.footer-name-fill')
    if (prefersReducedMotion()) {
      gsap.set(fillEl, { clipPath: 'inset(0% 0% 0% 0%)' })
      return
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fillEl,
        { clipPath: 'inset(0% 100% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          // the name rests ~69% down the viewport at max scroll — the end
          // must sit below that or the fill can never reach 100%
          scrollTrigger: { trigger: '.footer-name', start: 'top 96%', end: 'top 76%', scrub: 0.5 },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="section contact" id="contact" data-scene="6" ref={root}>
      <div className="shooting-stars" aria-hidden="true">
        <span className="shooting-star" />
        <span className="shooting-star" />
        <span className="shooting-star" />
      </div>

      <div className="container contact-inner">
        <p className="eyebrow fade-up">
          <span className="eyebrow-number">06</span>
          <span className="eyebrow-line" />
          Contact
        </p>

        <h2 className="contact-title" data-split>
          <SplitWords text="Let's build" />
          <br />
          <em className="serif-accent">
            <SplitWords text="something great" />
          </em>
        </h2>

        <p className="contact-sub fade-up">
          Have a project in mind, a role to fill, or just want to say hi? My inbox is always open.
        </p>

        <a
          className="btn btn-large contact-mail"
          href={`mailto:${profile.email}`}
          data-magnetic="0.2"
          data-cursor="Say hi ✦"
        >
          {profile.email}
          <span className="btn-arrow" aria-hidden="true">
            ↗
          </span>
        </a>

        <div className="contact-links fade-up">
          {profile.socials.map((social) => (
            <a key={social.label} href={social.url} target="_blank" rel="noreferrer" data-hover>
              {social.label} ↗
            </a>
          ))}
          <a href={profile.resumeUrl} download data-cursor="PDF ↓">
            Résumé ↓
          </a>
        </div>
      </div>

      <div className="footer-name" aria-hidden="true">
        <span className="footer-name-outline">Ronak Jain</span>
        <span className="footer-name-fill">Ronak Jain</span>
      </div>

      <footer className="footer">
        <div className="container footer-inner">
          <p>© 2026 {profile.name}</p>
          <LocalTime />
          <p className="footer-stack">
            Designed &amp; built with React Three Fiber, GSAP &amp; GLSL · 3 secrets hidden ✦
          </p>
          <button className="footer-top" onClick={() => scrollToTarget(0)} data-hover>
            Back to top ↑
          </button>
        </div>
      </footer>
    </section>
  )
}

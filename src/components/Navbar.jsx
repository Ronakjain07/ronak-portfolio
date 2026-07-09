import { useEffect, useRef, useState } from 'react'
import { navLinks, profile } from '../data/content'
import { getLenis, scrollToTarget } from '../utils/smooth'
import { initSound, setSound } from '../utils/sound'
import { sceneState } from '../three/sceneState'

export default function Navbar({ ready }) {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [sound, setSoundState] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    setSoundState(initSound())
  }, [])

  // Runs on [ready] — Lenis is created in the parent's effect, which fires
  // after this component's mount effect, so the instance only exists once
  // the preloader flips `ready`.
  useEffect(() => {
    const lenis = getLenis()
    if (!lenis) return
    const onScroll = ({ scroll }) => {
      setScrolled(scroll > 40)
      setHidden(scroll > lastY.current && scroll > 160)
      lastY.current = scroll
    }
    lenis.on('scroll', onScroll)
    return () => lenis.off('scroll', onScroll)
  }, [ready])

  const go = (e, href) => {
    e.preventDefault()
    setOpen(false)
    scrollToTarget(href)
  }

  // easter egg: five quick clicks on the logo → the field forms a heart
  const brandClicks = useRef([])
  const onBrand = (e) => {
    go(e, 0)
    const now = Date.now()
    brandClicks.current = [...brandClicks.current.filter((t) => now - t < 3000), now]
    if (brandClicks.current.length >= 5) {
      brandClicks.current = []
      sceneState.formationRequest = { kind: 'heart', hold: 2, tag: 'heart' }
    }
  }

  const toggleSound = () => {
    const next = !sound
    setSoundState(next)
    setSound(next)
  }

  return (
    <>
      <header
        className={[
          'nav',
          ready ? 'is-ready' : '',
          hidden && !open ? 'is-hidden' : '',
          scrolled ? 'is-scrolled' : '',
        ].join(' ')}
      >
        <a className="nav-brand" href="#top" onClick={onBrand} data-hover>
          Ronak<span className="nav-brand-dot">.</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={(e) => go(e, link.href)} data-hover>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className={`nav-sound ${sound ? 'is-on' : ''}`}
            onClick={toggleSound}
            aria-pressed={sound}
            aria-label={sound ? 'Disable ambient music & sound' : 'Enable ambient music & sound'}
            title={sound ? 'Music & sound on' : 'Music & sound off'}
          >
            <span className="nav-sound-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          <a
            className="btn btn-small nav-cta"
            href={`mailto:${profile.email}`}
            data-magnetic="0.3"
            data-hover
          >
            Let&apos;s talk
          </a>

          <button
            className={`nav-burger ${open ? 'is-open' : ''}`}
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Mobile">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              style={{ transitionDelay: open ? `${0.08 + i * 0.05}s` : '0s' }}
              onClick={(e) => go(e, link.href)}
            >
              <span className="mobile-menu-num">0{i + 1}</span>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mobile-menu-foot">
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </div>
      </div>
    </>
  )
}

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../utils/animations'

const ACCENT_A = [247, 236, 217] // #f7ecd9
const ACCENT_B = [238, 185, 107] // #eeb96b
const ACCENT_C = [194, 84, 42] // #c2542a

function lerpColor(t) {
  const [a, b] = t < 0.5 ? [ACCENT_A, ACCENT_B] : [ACCENT_B, ACCENT_C]
  const localT = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return a.map((v, i) => Math.round(v + (b[i] - v) * localT))
}

// "Molten Ignition": the wordmark fills with liquid gold as the site
// loads — the pour itself is the progress indicator, no numeric percent
// — sparking embers along the advancing edge. At 100% it bursts apart;
// onComplete() fires at that instant so the WebGL RONAK particle
// formation (App.jsx ramps sceneState.opacity/nameMix) starts appearing
// while the DOM embers are still dissolving, reading as one continuous
// handoff rather than a hard cut from "loader" to "animation". The nav
// brand's own existing fade-in (index.css, gated by .nav.is-ready) is
// what returns the name to the page — no separate FLIP clone needed.
export default function Preloader({ onComplete }) {
  const root = useRef()
  const wordmark = useRef()
  const fill = useRef()
  const canvas = useRef()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    if (prefersReducedMotion()) {
      gsap.set(root.current, { display: 'none' })
      onComplete()
      return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const ctx2d = canvas.current.getContext('2d')
    const resize = () => {
      canvas.current.width = window.innerWidth * dpr
      canvas.current.height = window.innerHeight * dpr
      canvas.current.style.width = window.innerWidth + 'px'
      canvas.current.style.height = window.innerHeight + 'px'
    }
    resize()
    window.addEventListener('resize', resize)

    // fixed-size ember pool, reused in place — no per-frame allocation
    const POOL = 90
    const embers = Array.from({ length: POOL }, () => ({ life: 0 }))
    let cursorIdx = 0
    const spawn = (x, y, opts) => {
      const e = embers[cursorIdx]
      cursorIdx = (cursorIdx + 1) % POOL
      const angle = opts.angle
      const speed = opts.speed
      e.x = x
      e.y = y
      e.vx = Math.cos(angle) * speed
      e.vy = Math.sin(angle) * speed - opts.rise
      e.r = opts.r
      e.life = 1
      e.decay = opts.decay
      e.gravity = opts.gravity
      e.hue = Math.random()
    }

    let fillProgress = 0
    let tracing = true
    let bursting = false
    let lastTraceAt = 0
    let raf

    const traceSpark = (now) => {
      if (!tracing || now - lastTraceAt < 26) return
      lastTraceAt = now
      const box = wordmark.current.getBoundingClientRect()
      spawn(box.left + box.width * fillProgress, box.top + Math.random() * box.height, {
        angle: -Math.PI / 2 + (Math.random() - 0.5) * 1.1,
        speed: 0.15 + Math.random() * 0.35,
        rise: 0.22,
        r: 1 + Math.random() * 1.6,
        decay: 0.022 + Math.random() * 0.016,
        gravity: 0.006,
      })
    }

    const loop = (now) => {
      traceSpark(now)

      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx2d.clearRect(0, 0, canvas.current.width, canvas.current.height)
      ctx2d.globalCompositeOperation = 'lighter'
      let anyAlive = false
      for (const em of embers) {
        if (em.life <= 0) continue
        em.x += em.vx
        em.y += em.vy
        em.vy += em.gravity
        em.life -= em.decay
        if (em.life <= 0) continue
        anyAlive = true
        const [r, g, b] = lerpColor(em.hue)
        const alpha = Math.max(em.life, 0)
        const radius = em.r * (0.5 + em.life * 0.5)
        const grad = ctx2d.createRadialGradient(em.x, em.y, 0, em.x, em.y, radius)
        grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx2d.fillStyle = grad
        ctx2d.beginPath()
        ctx2d.arc(em.x, em.y, radius, 0, Math.PI * 2)
        ctx2d.fill()
      }

      // self-terminate once the burst has fully decayed — this component
      // never unmounts (App.jsx keeps it in the tree at display:none), so
      // nothing else would stop this loop from running forever otherwise
      if (!tracing && !anyAlive && bursting) return
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    const burst = () => {
      tracing = false
      bursting = true
      const box = wordmark.current.getBoundingClientRect()
      for (let i = 0; i < 55; i++) {
        spawn(box.left + Math.random() * box.width, box.top + Math.random() * box.height, {
          angle: Math.random() * Math.PI * 2,
          speed: 0.8 + Math.random() * 2.2,
          rise: 0,
          r: 1.5 + Math.random() * 2.6,
          decay: 0.008 + Math.random() * 0.01,
          gravity: 0.012,
        })
      }
    }

    const tl = gsap.timeline()
    tl.fromTo(root.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' })
      .fromTo(
        wordmark.current,
        { autoAlpha: 0, scale: 0.94 },
        { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
        '-=0.1',
      )
      .fromTo(
        fill.current,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 1.55,
          ease: 'power1.inOut',
          onUpdate: function () {
            fillProgress = this.progress()
          },
        },
        '-=0.15',
      )
      .to('.preloader-role', { autoAlpha: 0, y: -10, duration: 0.35 }, '-=0.25')
      .to(wordmark.current, { filter: 'brightness(1.6)', duration: 0.16, yoyo: true, repeat: 1 })
      .call(() => {
        // unlock the app + start the WebGL formation now, before the DOM
        // has finished dissolving — the burst must never be able to block
        // interactivity if anything above throws
        try {
          onComplete()
        } finally {
          burst()
        }
      })
      .to(wordmark.current, { autoAlpha: 0, scale: 1.05, duration: 0.5, ease: 'power2.in' }, '<')
      .to(root.current, { autoAlpha: 0, duration: 0.85, ease: 'power2.inOut' }, '<0.1')
      .set(root.current, { display: 'none' })

    return () => {
      tl.kill()
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [onComplete])

  return (
    <div className="preloader" ref={root}>
      <p className="sr-only" role="status">
        Loading Ronak Jain's portfolio
      </p>
      <div className="preloader-inner">
        <div className="preloader-wordmark" ref={wordmark} aria-hidden="true">
          <span className="preloader-wordmark-outline">Ronak Jain</span>
          <span className="preloader-wordmark-fill" ref={fill}>
            Ronak Jain
          </span>
        </div>
        <p className="preloader-role">Portfolio © 2026</p>
      </div>
      <canvas className="preloader-embers" ref={canvas} aria-hidden="true" />
    </div>
  )
}

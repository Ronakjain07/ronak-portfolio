import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../utils/animations'

// Custom cursor — "Ember Comet Trail": a glowing core that leaves a wake
// of drifting, fading embers on a lightweight 2D canvas (additive blend,
// matching the WebGL particle field's look), plus a ring/pill layer that
// blooms on hover and morphs into a labelled pill over [data-cursor]
// targets ("View ↗", "PDF ↓", …) — that mechanic is unchanged from before,
// only its styling is refreshed. All position writes go straight to
// style/canvas each frame (no React re-render). Fine-pointer only; no
// ember spawning under prefers-reduced-motion.
const ACCENT_A = [247, 236, 217] // #f7ecd9
const ACCENT_B = [238, 185, 107] // #eeb96b
const ACCENT_C = [194, 84, 42] // #c2542a
const POOL_SIZE = 16
const SPAWN_DISTANCE = 14 // px moved before a new ember spawns
const IDLE_MS = 1500 // stop spawning after this long without movement

function lerpColor(t) {
  const [a, b] = t < 0.5 ? [ACCENT_A, ACCENT_B] : [ACCENT_B, ACCENT_C]
  const localT = t < 0.5 ? t * 2 : (t - 0.5) * 2
  return a.map((v, i) => Math.round(v + (b[i] - v) * localT))
}

export default function Cursor() {
  const [enabled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
  )
  const core = useRef()
  const ring = useRef()
  const label = useRef()
  const canvas = useRef()

  useEffect(() => {
    if (!enabled) return
    const reduced = prefersReducedMotion()

    const pos = { x: -100, y: -100 }
    const ringPos = { x: -100, y: -100 }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf
    let lastSpawnX = -100
    let lastSpawnY = -100
    let lastMoveAt = performance.now()

    // fixed-size ember pool, reused in place — no per-frame allocation
    const embers = Array.from({ length: POOL_SIZE }, () => ({ life: 0 }))
    let cursorIdx = 0

    const ctx2d = canvas.current?.getContext('2d')
    const resize = () => {
      if (!canvas.current) return
      canvas.current.width = window.innerWidth * dpr
      canvas.current.height = window.innerHeight * dpr
      canvas.current.style.width = window.innerWidth + 'px'
      canvas.current.style.height = window.innerHeight + 'px'
    }
    resize()
    window.addEventListener('resize', resize)

    const spawnEmber = (x, y) => {
      const e = embers[cursorIdx]
      cursorIdx = (cursorIdx + 1) % POOL_SIZE
      const angle = Math.random() * Math.PI * 2
      const speed = 0.25 + Math.random() * 0.55
      e.x = x
      e.y = y
      e.vx = Math.cos(angle) * speed
      e.vy = Math.sin(angle) * speed - 0.15 // slight upward heat drift
      e.r = 1.4 + Math.random() * 2.2
      e.life = 1
      e.decay = 0.014 + Math.random() * 0.012
      e.hue = Math.random()
    }

    const onMove = (e) => {
      const dx = e.clientX - lastSpawnX
      const dy = e.clientY - lastSpawnY
      pos.x = e.clientX
      pos.y = e.clientY
      lastMoveAt = performance.now()
      if (!reduced && Math.hypot(dx, dy) > SPAWN_DISTANCE) {
        lastSpawnX = e.clientX
        lastSpawnY = e.clientY
        spawnEmber(e.clientX, e.clientY)
      }
    }

    const onOver = (e) => {
      const labelText = e.target.closest?.('[data-cursor]')?.dataset.cursor || ''
      const hovering = !labelText && !!e.target.closest?.('a, button, [data-hover]')
      if (label.current && labelText) label.current.textContent = labelText
      ring.current?.classList.toggle('is-hover', hovering)
      ring.current?.classList.toggle('has-label', !!labelText)
      core.current?.classList.toggle('is-hidden', !!labelText)
    }

    const onClick = () => {
      core.current?.classList.remove('is-flash')
      // eslint-disable-next-line no-unused-expressions
      core.current?.offsetWidth // restart the animation on rapid clicks
      core.current?.classList.add('is-flash')
    }

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16
      ringPos.y += (pos.y - ringPos.y) * 0.16
      if (core.current) core.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      if (ring.current) ring.current.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px)`

      if (ctx2d && !reduced) {
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx2d.clearRect(0, 0, canvas.current.width, canvas.current.height)
        const idle = performance.now() - lastMoveAt > IDLE_MS
        if (!idle) {
          ctx2d.globalCompositeOperation = 'lighter'
          for (const em of embers) {
            if (em.life <= 0) continue
            em.x += em.vx
            em.y += em.vy
            em.vy += 0.004 // gentle gravity
            em.life -= em.decay
            if (em.life <= 0) continue
            const [r, g, b] = lerpColor(em.hue)
            const alpha = Math.max(em.life, 0) * 0.85
            const radius = em.r * (0.4 + em.life * 0.6)
            const grad = ctx2d.createRadialGradient(em.x, em.y, 0, em.x, em.y, radius)
            grad.addColorStop(0, `rgba(${r},${g},${b},${alpha})`)
            grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
            ctx2d.fillStyle = grad
            ctx2d.beginPath()
            ctx2d.arc(em.x, em.y, radius, 0, Math.PI * 2)
            ctx2d.fill()
          }
        }
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('click', onClick, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('click', onClick)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <canvas className="cursor-trail" ref={canvas} aria-hidden="true" />
      <div className="cursor-core" ref={core} aria-hidden="true" />
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <span className="cursor-ring-circle">
          <span className="cursor-label" ref={label} />
        </span>
      </div>
    </>
  )
}

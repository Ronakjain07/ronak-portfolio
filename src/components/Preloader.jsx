import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '../utils/animations'

// Counts to 100 while the WebGL scene warms up behind it, then the
// name flies up into the navbar brand slot as the curtain lifts.
export default function Preloader({ onComplete }) {
  const root = useRef()
  const counter = useRef()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    if (prefersReducedMotion()) {
      gsap.set(root.current, { display: 'none' })
      onComplete()
      return
    }

    // clone the name and send it to where the nav brand sits
    const handoff = () => {
      const nameEl = root.current?.querySelector('.preloader-name')
      const brand = document.querySelector('.nav-brand')
      if (!nameEl || !brand) return
      const from = nameEl.getBoundingClientRect()
      const to = brand.getBoundingClientRect()
      const clone = nameEl.cloneNode(true)
      clone.classList.add('preloader-name-clone')
      Object.assign(clone.style, {
        position: 'fixed',
        left: `${from.left}px`,
        top: `${from.top}px`,
        margin: '0',
        zIndex: 120,
        pointerEvents: 'none',
      })
      document.body.appendChild(clone)
      nameEl.style.visibility = 'hidden'
      gsap.to(clone, {
        x: to.left - from.left,
        // +14 compensates .nav's pre-ready translateY(-14px): the brand was
        // measured before the nav slid to its final resting position
        y: to.top + 14 - from.top,
        scale: to.height / from.height,
        transformOrigin: 'left top',
        autoAlpha: 0.25,
        duration: 0.95,
        ease: 'power4.inOut',
        onComplete: () => clone.remove(),
      })
    }

    const obj = { v: 0 }
    const tl = gsap.timeline()

    tl.to(obj, {
      v: 100,
      duration: 1.9,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (counter.current) counter.current.textContent = Math.round(obj.v)
      },
    })
      .to(
        ['.preloader-count', '.preloader-role'],
        { autoAlpha: 0, y: -22, duration: 0.45, ease: 'power2.in' },
        '-=0.1',
      )
      .to(root.current, {
        yPercent: -100,
        duration: 1,
        ease: 'power4.inOut',
        onStart: () => {
          handoff()
          onComplete()
        },
      })
      .set(root.current, { display: 'none' })

    return () => tl.kill()
  }, [onComplete])

  return (
    <div className="preloader" ref={root}>
      <div className="preloader-inner">
        <p className="preloader-name">Ronak Jain</p>
        <p className="preloader-role">Portfolio © 2026</p>
        <div className="preloader-count">
          <span ref={counter}>0</span>
          <span className="preloader-percent">%</span>
        </div>
      </div>
    </div>
  )
}

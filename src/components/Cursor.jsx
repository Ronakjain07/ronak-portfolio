import { useEffect, useRef, useState } from 'react'

// Custom cursor: a crisp dot + a lagging ring that swells over
// interactive elements, and becomes a labelled gold pill over
// [data-cursor] targets ("View ↗", "PDF ↓", …). The outer divs are
// positioned by JS every frame; the inner circle handles hover styling
// via CSS only (explicit sizes, no scale on the positioned wrapper) so
// the two transforms never fight. Renders nothing on touch devices.
export default function Cursor() {
  const [enabled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
  )
  const dot = useRef()
  const ring = useRef()
  const label = useRef()

  useEffect(() => {
    if (!enabled) return

    const pos = { x: -100, y: -100 }
    const ringPos = { x: -100, y: -100 }
    let raf

    const onMove = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
    }

    const onOver = (e) => {
      const labelText = e.target.closest?.('[data-cursor]')?.dataset.cursor || ''
      const hovering = !labelText && !!e.target.closest?.('a, button, [data-hover]')
      if (label.current && labelText) label.current.textContent = labelText
      ring.current?.classList.toggle('is-hover', hovering)
      ring.current?.classList.toggle('has-label', !!labelText)
      dot.current?.classList.toggle('is-hidden', !!labelText)
    }

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16
      ringPos.y += (pos.y - ringPos.y) * 0.16
      if (dot.current) dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`
      if (ring.current) ring.current.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
      <div className="cursor-ring" ref={ring} aria-hidden="true">
        <span className="cursor-ring-circle">
          <span className="cursor-label" ref={label} />
        </span>
      </div>
    </>
  )
}

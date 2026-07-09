import { useEffect, useRef, useState } from 'react'

// Small pill that appears when a visitor finds an easter egg for the
// first time: "✦ secret 2 of 3 found".
export default function SecretToast() {
  const [message, setMessage] = useState(null)
  const timer = useRef()

  useEffect(() => {
    const onSecret = (e) => {
      if (!e.detail.isNew) return
      const { count, total } = e.detail
      setMessage(
        count >= total
          ? '✦ all 3 secrets found — you absolute legend'
          : `✦ secret ${count} of ${total} found`,
      )
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setMessage(null), 3600)
    }
    window.addEventListener('rj-secret', onSecret)
    return () => {
      window.removeEventListener('rj-secret', onSecret)
      clearTimeout(timer.current)
    }
  }, [])

  return (
    <div className={`secret-toast ${message ? 'is-on' : ''}`} aria-live="polite" role="status">
      {message}
    </div>
  )
}

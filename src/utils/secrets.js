// Easter-egg bookkeeping: remembers which secrets a visitor has found
// (localStorage) and announces finds via a window event the toast
// component listens for.

const TOTAL = 3

export function recordSecret(tag) {
  let found = []
  try {
    found = JSON.parse(localStorage.getItem('rj-secrets') || '[]')
  } catch {
    found = []
  }
  const isNew = !found.includes(tag)
  if (isNew) {
    found.push(tag)
    try {
      localStorage.setItem('rj-secrets', JSON.stringify(found))
    } catch {
      // private mode — the toast still shows, it just won't persist
    }
  }
  window.dispatchEvent(
    new CustomEvent('rj-secret', {
      detail: { count: Math.min(found.length, TOTAL), total: TOTAL, isNew },
    }),
  )
}

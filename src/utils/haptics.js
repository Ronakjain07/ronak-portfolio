// Subtle haptic feedback for touch devices.
//
// Support is narrow and worth being explicit about: the Vibration API
// works on Android (Chrome/Firefox) but iOS Safari does not implement it
// at all — iPhone users simply get the visual feedback with no buzz, and
// no error. Browsers also gate the API behind user activation; the tap
// and section helpers are always called from real gestures, while the
// ignition burst below handles the cold-load case explicitly.

const canVibrate =
  typeof navigator !== 'undefined' &&
  typeof navigator.vibrate === 'function' &&
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches

function buzz(pattern) {
  if (!canVibrate) return false
  try {
    return navigator.vibrate(pattern)
  } catch {
    /* some browsers throw when the page is backgrounded — never fatal */
    return false
  }
}

// Sticky activation: has the visitor ever interacted with this document?
// Chrome exposes this directly; where it's missing we assume yes and let
// the vibrate() call itself no-op if the browser decides to block it.
function hasUserActivation() {
  return navigator.userActivation ? navigator.userActivation.hasBeenActive : true
}

// a single crisp tick — taps, shockwaves
export const tapHaptic = () => buzz(8)

// a soft double blip — crossing into a new section
export const sectionHaptic = () => buzz([5, 40, 5])

// ── Ignition: the preloader's signature moment ────────────────
// ~1.7s crescendo of quickening pulses ending in a heavy hit, so it
// *feels* like the molten pour building to the burst. Deliberately NOT
// one long continuous buzz — a flat 2-3s vibration is what phones use
// for alarms and incoming calls, and reads as "something is wrong"
// rather than as delight.
const IGNITION = [
  5, 100, 6, 95, 8, 90, 10, 85, 12, 80, 15, 75, 18, 70, 22, 65,
  28, 60, 35, 55, 45, 50, 58, 45, 75, 40, 100, 35, 300,
]

let ignitionSpent = false

// Browsers gate the Vibration API behind user activation: on a cold load
// (e.g. tapping the link from LinkedIn) nothing has been touched yet, so
// calling this at the preloader's end is silently ignored. So we try
// anyway, and also arm a one-shot fallback that fires on the visitor's
// very first touch — which lands while the particles are still forming,
// so the moment still reads as part of the intro rather than a stray buzz.
export function ignitionHaptic() {
  if (!canVibrate || ignitionSpent) return false
  // Don't burn the single shot on a call the browser will just swallow —
  // leave it for the armed first-touch fallback instead.
  if (!hasUserActivation()) return false
  ignitionSpent = true
  return buzz(IGNITION)
}

export function armIgnitionHaptic(windowMs = 15000) {
  if (!canVibrate || ignitionSpent) return () => {}

  const fire = () => {
    cleanup()
    ignitionHaptic()
  }
  const cleanup = () => {
    clearTimeout(timer)
    window.removeEventListener('touchstart', fire)
    window.removeEventListener('pointerdown', fire)
  }
  // past the window the intro moment has passed — don't buzz out of nowhere
  const timer = setTimeout(() => {
    cleanup()
    ignitionSpent = true
  }, windowMs)

  window.addEventListener('touchstart', fire, { once: true, passive: true })
  window.addEventListener('pointerdown', fire, { once: true, passive: true })
  return cleanup
}

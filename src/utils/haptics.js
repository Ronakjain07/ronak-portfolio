// Subtle haptic feedback for touch devices.
//
// Support is narrow and worth being explicit about: the Vibration API
// works on Android (Chrome/Firefox) but iOS Safari does not implement it
// at all — iPhone users simply get the visual feedback with no buzz, and
// no error. Calls also require a prior user gesture, which is always the
// case here since every call site is a tap/scroll handler.

const canVibrate =
  typeof navigator !== 'undefined' &&
  typeof navigator.vibrate === 'function' &&
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: coarse)').matches

function buzz(pattern) {
  if (!canVibrate) return
  try {
    navigator.vibrate(pattern)
  } catch {
    /* some browsers throw when the page is backgrounded — never fatal */
  }
}

// a single crisp tick — taps, shockwaves
export const tapHaptic = () => buzz(8)

// a soft double blip — crossing into a new section
export const sectionHaptic = () => buzz([5, 40, 5])

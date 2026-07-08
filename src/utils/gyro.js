// Device-tilt parallax for touch devices: tilting the phone steers the
// camera the way the mouse does on desktop. Touch input keeps driving
// the repulsion pointer separately, so the two never fight.
//
// Keeps the main bundle three-free (imports only sceneState).

import { sceneState } from '../three/sceneState'

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

let attached = false
let baseline = null

function onOrientation(e) {
  if (e.beta == null || e.gamma == null) return

  // remap axes for the current screen orientation
  const angle =
    (screen.orientation && screen.orientation.angle) ?? window.orientation ?? 0
  let x
  let y
  if (angle === 90) {
    x = e.beta
    y = -e.gamma
  } else if (angle === 270 || angle === -90) {
    x = -e.beta
    y = e.gamma
  } else {
    x = e.gamma
    y = e.beta
  }

  // baseline = how the visitor naturally holds the phone; it re-centers
  // slowly so posture changes (sitting → lying down) don't stick an offset
  if (!baseline) baseline = { x, y }
  baseline.x += (x - baseline.x) * 0.004
  baseline.y += (y - baseline.y) * 0.004

  sceneState.gyro.x = clamp((x - baseline.x) / 22, -1, 1)
  sceneState.gyro.y = clamp((y - baseline.y) / 22, -1, 1)
  sceneState.gyro.active = true
  window.__gyroActive = true // verification hook for headless checks
}

export function gyroSupported() {
  return (
    typeof window !== 'undefined' &&
    'DeviceOrientationEvent' in window &&
    window.matchMedia('(pointer: coarse)').matches
  )
}

// iOS 13+ gates orientation events behind a user-gesture permission
export function gyroNeedsPermission() {
  return typeof window.DeviceOrientationEvent?.requestPermission === 'function'
}

export function startGyro() {
  if (attached) return
  attached = true
  window.addEventListener('deviceorientation', onOrientation, { passive: true })
}

export async function requestGyro() {
  try {
    const result = await window.DeviceOrientationEvent.requestPermission()
    if (result === 'granted') {
      startGyro()
      return true
    }
  } catch {
    // user dismissed the system prompt
  }
  return false
}

export function stopGyro() {
  if (!attached) return
  attached = false
  window.removeEventListener('deviceorientation', onOrientation)
  sceneState.gyro.active = false
}

// Tiny WebAudio synth — no audio assets. Everything is a no-op until
// the visitor enables sound via the navbar toggle (off by default,
// persisted in localStorage). The AudioContext is created lazily so
// there are no autoplay-policy issues.

let ctx = null
let enabled = false
let lastTick = 0

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function initSound() {
  try {
    enabled = localStorage.getItem('rj-sound') === '1'
  } catch {
    enabled = false
  }
  return enabled
}

export function setSound(on) {
  enabled = on
  try {
    localStorage.setItem('rj-sound', on ? '1' : '0')
  } catch {
    // private mode — sound still works for this visit
  }
  if (on && ensureCtx()) tick(true)
}

export function isSoundEnabled() {
  return enabled
}

// Short glassy blip for hovers, throttled so rapid sweeps don't machine-gun.
export function tick(force = false) {
  if (!enabled) return
  const now = performance.now()
  if (!force && now - lastTick < 70) return
  lastTick = now
  const ac = ensureCtx()
  if (!ac || ac.state !== 'running') return

  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = 1250
  gain.gain.setValueAtTime(0.035, ac.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.06)
  osc.connect(gain).connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + 0.07)
}

// Soft filtered-noise sweep for section transitions.
export function whoosh() {
  if (!enabled) return
  const ac = ensureCtx()
  if (!ac || ac.state !== 'running') return

  const dur = 0.5
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  }
  const src = ac.createBufferSource()
  src.buffer = buffer
  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(900, ac.currentTime)
  filter.frequency.exponentialRampToValueAtTime(180, ac.currentTime + dur)
  const gain = ac.createGain()
  gain.gain.value = 0.05
  src.connect(filter).connect(gain).connect(ac.destination)
  src.start()
}

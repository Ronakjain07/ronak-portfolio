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
  if (enabled) {
    // returning visitor with sound on: browsers block audio until a
    // gesture, so arm a one-time listener to start the ambience
    const arm = () => {
      window.removeEventListener('pointerdown', arm)
      if (enabled && ensureCtx()) startMusic()
    }
    window.addEventListener('pointerdown', arm, { once: true })
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
  if (on && ensureCtx()) {
    tick(true)
    startMusic()
  } else {
    stopMusic()
  }
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

// ── Generative ambient music ─────────────────────────────────
// A slow A-major-add9 pad: detuned oscillator pairs breathing on
// out-of-phase LFOs, an airy filtered-noise shimmer, a feedback echo
// as a cheap reverb, and occasional distant chimes. Everything is
// synthesized — no audio files — and fades in/out with the toggle.

let music = null

const CHORD = [110, 164.81, 220, 246.94] // A2 · E3 · A3 · B3
const DRIFT_POOL = [164.81, 185, 220, 246.94, 277.18] // E · F# · A · B · C#
const CHIME_POOL = [880, 1108.73, 1318.51, 1760] // A5 · C#6 · E6 · A6

export function startMusic() {
  if (!enabled || music) return
  const ac = ensureCtx()
  if (!ac || ac.state !== 'running') return

  const now = ac.currentTime
  const timers = []

  const master = ac.createGain()
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.05, now + 3) // gentle fade-in
  const warmth = ac.createBiquadFilter()
  warmth.type = 'lowpass'
  warmth.frequency.value = 1500
  warmth.Q.value = 0.4
  warmth.connect(master).connect(ac.destination)

  // echo tail — a lowpassed feedback delay standing in for reverb
  const bus = ac.createGain()
  const delay = ac.createDelay(1)
  delay.delayTime.value = 0.46
  const feedback = ac.createGain()
  feedback.gain.value = 0.34
  const damp = ac.createBiquadFilter()
  damp.type = 'lowpass'
  damp.frequency.value = 900
  bus.connect(warmth)
  bus.connect(delay)
  delay.connect(damp).connect(feedback).connect(delay)
  delay.connect(warmth)

  const nodes = [master, warmth, bus, delay, feedback, damp]
  const voices = []

  // chord pad: each note is a detuned pair, breathing on its own LFO
  CHORD.forEach((freq, i) => {
    const voiceGain = ac.createGain()
    voiceGain.gain.value = 0.16
    const lfo = ac.createOscillator()
    lfo.frequency.value = 1 / (9 + i * 4.3) // 9s–22s breathing cycles
    const lfoDepth = ac.createGain()
    lfoDepth.gain.value = 0.09
    lfo.connect(lfoDepth).connect(voiceGain.gain)
    lfo.start()

    const pair = [-2.6, 2.6].map((cents) => {
      const osc = ac.createOscillator()
      osc.type = i === 0 ? 'sine' : 'triangle'
      osc.frequency.value = freq
      osc.detune.value = cents
      osc.connect(voiceGain)
      osc.start()
      return osc
    })
    voiceGain.connect(bus)
    nodes.push(voiceGain, lfo, lfoDepth)
    voices.push({ pair, base: freq })
  })

  // airy shimmer: looping noise through a slowly wandering bandpass
  const noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate)
  const nd = noiseBuf.getChannelData(0)
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1
  const noise = ac.createBufferSource()
  noise.buffer = noiseBuf
  noise.loop = true
  const band = ac.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 620
  band.Q.value = 2.2
  const bandLfo = ac.createOscillator()
  bandLfo.frequency.value = 0.02
  const bandDepth = ac.createGain()
  bandDepth.gain.value = 260
  bandLfo.connect(bandDepth).connect(band.frequency)
  bandLfo.start()
  const airGain = ac.createGain()
  airGain.gain.value = 0.014
  noise.connect(band).connect(airGain).connect(bus)
  noise.start()
  nodes.push(noise, band, bandLfo, bandDepth, airGain)

  // distant chimes, echoing through the delay like the shooting stars
  const scheduleChime = () => {
    const id = setTimeout(() => {
      if (!music) return
      const osc = ac.createOscillator()
      const g = ac.createGain()
      osc.type = 'sine'
      osc.frequency.value = CHIME_POOL[Math.floor(Math.random() * CHIME_POOL.length)]
      const t = ac.currentTime
      g.gain.setValueAtTime(0.018, t)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4)
      osc.connect(g).connect(bus)
      osc.start()
      osc.stop(t + 4.2)
      scheduleChime()
    }, 9000 + Math.random() * 16000)
    timers.push(id)
  }
  scheduleChime()

  // slow harmonic drift: an upper voice glides to a neighbouring tone
  const scheduleDrift = () => {
    const id = setTimeout(() => {
      if (!music) return
      const voice = voices[1 + Math.floor(Math.random() * (voices.length - 1))]
      const target = DRIFT_POOL[Math.floor(Math.random() * DRIFT_POOL.length)]
      voice.pair.forEach((osc) => osc.frequency.setTargetAtTime(target, ac.currentTime, 5))
      scheduleDrift()
    }, 22000 + Math.random() * 18000)
    timers.push(id)
  }
  scheduleDrift()

  music = { master, nodes, timers }
  window.__musicOn = true // verification hook for headless checks
}

export function stopMusic() {
  if (!music) return
  const { master, nodes, timers } = music
  music = null
  window.__musicOn = false
  timers.forEach(clearTimeout)
  if (ctx) {
    const t = ctx.currentTime
    master.gain.cancelScheduledValues(t)
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t)
    master.gain.exponentialRampToValueAtTime(0.0001, t + 0.7)
  }
  setTimeout(() => {
    nodes.forEach((node) => {
      try {
        if (typeof node.stop === 'function') node.stop()
      } catch {
        /* already stopped */
      }
      try {
        node.disconnect()
      } catch {
        /* already disconnected */
      }
    })
  }, 800)
}

// Low, soft thump for the click shockwave.
export function thump() {
  if (!enabled) return
  const ac = ensureCtx()
  if (!ac || ac.state !== 'running') return

  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(120, ac.currentTime)
  osc.frequency.exponentialRampToValueAtTime(45, ac.currentTime + 0.18)
  gain.gain.setValueAtTime(0.09, ac.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.22)
  osc.connect(gain).connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + 0.24)
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

// Samples text glyphs from an offscreen canvas into particle positions.
// Used for the "RONAK" formation the field assembles into on load, and
// for the easter-egg formations (SAY HI, SCROLL, the heart).

// Filled parametric heart, denser toward the outline.
export function sampleHeartPositions(count, worldWidth, yOffset = 0.25) {
  const out = new Float32Array(count * 3)
  const scale = worldWidth / 32 // curve spans x ≈ ±16
  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2
    const r = Math.pow(Math.random(), 0.35) // fill, biased to the edge
    const x = 16 * Math.pow(Math.sin(t), 3) * r
    const y =
      (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r
    out[i * 3] = x * scale + (Math.random() - 0.5) * 0.05
    out[i * 3 + 1] = y * scale + yOffset + (Math.random() - 0.5) * 0.05
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.3
  }
  return out
}

export async function sampleTextPositions(text, count, worldWidth, yOffset = 0.35) {
  try {
    await Promise.race([
      document.fonts.load('800 140px Syne'),
      new Promise((resolve) => setTimeout(resolve, 3500)), // slow networks: wait for the real font
    ])
  } catch {
    // fall through — a fallback bold sans still reads fine as particles
  }

  const fontSize = 140
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.font = `800 ${fontSize}px Syne, sans-serif`
  canvas.width = Math.ceil(ctx.measureText(text).width) + 40
  canvas.height = Math.ceil(fontSize * 1.5)
  // resizing the canvas resets context state — set the font again
  ctx.font = `800 ${fontSize}px Syne, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.fillText(text, 20, canvas.height / 2)

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const points = []
  const step = 2
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      if (data[(y * canvas.width + x) * 4 + 3] > 128) points.push(x, y)
    }
  }
  if (points.length < 6) return null

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (let i = 0; i < points.length; i += 2) {
    if (points[i] < minX) minX = points[i]
    if (points[i] > maxX) maxX = points[i]
    if (points[i + 1] < minY) minY = points[i + 1]
    if (points[i + 1] > maxY) maxY = points[i + 1]
  }

  const scale = worldWidth / (maxX - minX)
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const sampleCount = points.length / 2

  // Syne 800 is ~9:1 wide for a word like RONAK — width-fitted to a
  // phone the letters come out shorter than the particle glow blobs.
  // Stretch Y toward a minimum readable height (desktop hits 1×).
  const naturalH = (maxY - minY) * scale
  const yStretch = Math.min(Math.max(0.5 / Math.max(naturalH, 0.001), 1), 2.2)
  // diagnostics for the headless checks
  window.__samplerDebug = {
    text,
    inkW: maxX - minX,
    inkH: maxY - minY,
    naturalH: +naturalH.toFixed(3),
    yStretch: +yStretch.toFixed(2),
  }

  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    // random ink point, NOT sequential: points are in scanline order, so
    // with fewer particles than ink pixels (mobile) sequential assignment
    // covers only the top rows of the glyphs — an unreadable smear
    const s = Math.floor(Math.random() * sampleCount) * 2
    out[i * 3] = (points[s] - cx) * scale + (Math.random() - 0.5) * 0.03
    out[i * 3 + 1] =
      -(points[s + 1] - cy) * scale * yStretch + yOffset + (Math.random() - 0.5) * 0.03
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.18
  }
  return out
}

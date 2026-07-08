// Procedural point-cloud targets the particle system morphs between.
// Every array is index-aligned: particle i travels wave[i] → sphere[i] → …

export function generateShapes(count) {
  const wave = new Float32Array(count * 3)
  const sphere = new Float32Array(count * 3)
  const helix = new Float32Array(count * 3)
  const ring = new Float32Array(count * 3)
  const burst = new Float32Array(count * 3)
  const rand = new Float32Array(count)

  const TAU = Math.PI * 2

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    rand[i] = Math.random()

    // ── Wave: a wide dune field below the hero copy (undulation runs in the shader)
    wave[i3] = (Math.random() - 0.5) * 17
    wave[i3 + 1] = -1.6 + Math.random() * 0.5
    wave[i3 + 2] = (Math.random() - 0.5) * 11 + 1.5

    // ── Sphere: shell with slight thickness
    {
      const u = Math.random() * 2 - 1
      const theta = Math.random() * TAU
      const r = 2.35 * (0.9 + Math.random() * 0.18)
      const s = Math.sqrt(1 - u * u)
      sphere[i3] = s * Math.cos(theta) * r
      sphere[i3 + 1] = u * r
      sphere[i3 + 2] = s * Math.sin(theta) * r
    }

    // ── Helix: double strand + 18% ambient dust
    {
      if (rand[i] > 0.82) {
        const a = Math.random() * TAU
        const r = 2.4 + Math.random() * 1.4
        helix[i3] = Math.cos(a) * r
        helix[i3 + 1] = (Math.random() - 0.5) * 6
        helix[i3 + 2] = Math.sin(a) * r
      } else {
        const strand = i % 2 === 0 ? 0 : Math.PI
        const t = (i / count) * TAU * 2.6
        const r = 1.65 + (Math.random() - 0.5) * 0.28
        helix[i3] = Math.cos(t + strand) * r
        helix[i3 + 1] = (i / count - 0.5) * 5.6 + (Math.random() - 0.5) * 0.2
        helix[i3 + 2] = Math.sin(t + strand) * r
      }
    }

    // ── Ring: tilted torus vortex
    {
      const a = Math.random() * TAU
      const b = Math.random() * TAU
      const R = 2.65
      const tube = 0.28 + Math.pow(Math.random(), 2.2) * 0.85
      let x = (R + tube * Math.cos(b)) * Math.cos(a)
      let y = tube * Math.sin(b)
      let z = (R + tube * Math.cos(b)) * Math.sin(a)
      // tilt ~24° around X for depth
      const tilt = 0.42
      const y2 = y * Math.cos(tilt) - z * Math.sin(tilt)
      const z2 = y * Math.sin(tilt) + z * Math.cos(tilt)
      ring[i3] = x
      ring[i3 + 1] = y2
      ring[i3 + 2] = z2
    }

    // ── Burst: deep starfield shell for the finale
    {
      const u = Math.random() * 2 - 1
      const theta = Math.random() * TAU
      const r = 3.2 + Math.pow(Math.random(), 0.65) * 6.5
      const s = Math.sqrt(1 - u * u)
      burst[i3] = s * Math.cos(theta) * r
      burst[i3 + 1] = u * r * 0.8
      burst[i3 + 2] = s * Math.sin(theta) * r
    }
  }

  return { wave, sphere, helix, ring, burst, rand }
}

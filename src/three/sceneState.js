// Shared mutable state bridging the DOM world (GSAP / Lenis / React)
// and the WebGL world (react-three-fiber). Mutated directly to avoid
// React re-renders on every scroll tick — the render loop reads it
// each frame and eases toward the targets.
//
// Deliberately imports NOTHING from three: this module is used by the
// main bundle (nav, hero, scroll triggers), and any three import here
// would drag the whole 235KB-gzip three chunk out of its lazy split.

// One entry per page section. morph: 0 wave · 1 sphere · 2 helix · 3 ring · 4 starburst
// dim keeps the field from overpowering text-dense sections.
export const SCENES = [
  { morph: 0, colorA: '#ffd27d', colorB: '#ff7847', spin: 0.05, dim: 1 }, // hero — golden dunes
  { morph: 1, colorA: '#ffc078', colorB: '#e0529c', spin: 0.1, dim: 0.8 }, // about — ember globe
  { morph: 1, colorA: '#ff9d7a', colorB: '#c95cff', spin: 0.24, dim: 0.55 }, // skills — spinning globe
  { morph: 2, colorA: '#ff8f70', colorB: '#9d5cff', spin: 0.12, dim: 0.6 }, // experience — helix
  { morph: 3, colorA: '#c9a2ff', colorB: '#5c7cff', spin: 0.18, dim: 0.65 }, // work — vortex ring
  { morph: 3, colorA: '#ffd27d', colorB: '#ff5c8a', spin: 0.32, dim: 0.8 }, // achievements — gold ring
  { morph: 4, colorA: '#9db8ff', colorB: '#e2b96b', spin: 0.06, dim: 1 }, // contact — starfield
]

// sRGB hex → linear-space rgb floats, matching what `new THREE.Color(hex)`
// produces under three's default color management — keeps the shader
// colors identical to the pre-refactor look.
function hexToLinearRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  const toLinear = (byte) => {
    const c = byte / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return { r: toLinear((n >> 16) & 255), g: toLinear((n >> 8) & 255), b: toLinear(n & 255) }
}

const isMobile =
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || navigator.maxTouchPoints > 1)

export const sceneState = {
  particleCount: isMobile ? 6500 : 14000,
  morph: 0,
  spin: SCENES[0].spin,
  dim: SCENES[0].dim,
  opacity: 0, // faded in once the preloader finishes
  nameMix: 0, // 1 = particles form the "RONAK" glyphs
  velocity: 0, // scroll velocity → particle turbulence
  mouse: { x: 0, y: 0 },
  hasPointer: false, // no repulsion until real input arrives
  pointer3: { x: 999, y: 999, z: 0 }, // cursor on the z=0 world plane
  repel: 0,
  colorA: hexToLinearRgb(SCENES[0].colorA),
  colorB: hexToLinearRgb(SCENES[0].colorB),
}

export function setScene(index) {
  const s = SCENES[Math.max(0, Math.min(index, SCENES.length - 1))]
  sceneState.morph = s.morph
  sceneState.spin = s.spin
  sceneState.dim = s.dim
  sceneState.colorA = hexToLinearRgb(s.colorA)
  sceneState.colorB = hexToLinearRgb(s.colorB)
}

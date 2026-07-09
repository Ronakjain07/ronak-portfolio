import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { generateShapes } from './shapes'
import { sampleTextPositions, sampleHeartPositions } from './textTarget'
import { sceneState } from './sceneState'

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uNameMix;
  uniform float uSize;
  uniform float uVelocity;
  uniform vec3 uPointer;
  uniform float uRepel;
  uniform vec3 uShock;
  uniform float uShockTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  attribute vec3 aSphere;
  attribute vec3 aHelix;
  attribute vec3 aRing;
  attribute vec3 aBurst;
  attribute vec3 aName;
  attribute float aRand;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float m1 = smoothstep(0.0, 1.0, clamp(uMorph, 0.0, 1.0));
    float m2 = smoothstep(0.0, 1.0, clamp(uMorph - 1.0, 0.0, 1.0));
    float m3 = smoothstep(0.0, 1.0, clamp(uMorph - 2.0, 0.0, 1.0));
    float m4 = smoothstep(0.0, 1.0, clamp(uMorph - 3.0, 0.0, 1.0));

    vec3 p = position;

    // rolling dunes while in wave formation
    float waveAmp = 1.0 - m1;
    p.y += waveAmp * (
      sin(p.x * 0.65 + uTime * 0.85) * 0.5 +
      cos(p.z * 0.85 + uTime * 0.6) * 0.38 +
      sin((p.x + p.z) * 0.4 + uTime * 0.45) * 0.25
    );

    p = mix(p, aSphere, m1);
    p = mix(p, aHelix, m2);
    p = mix(p, aRing, m3);
    p = mix(p, aBurst, m4);

    // the name formation overrides whatever shape scroll picked
    p = mix(p, aName, uNameMix);

    // organic per-particle drift, stirred by scroll velocity,
    // damped while the letters hold so they stay crisp
    float t = uTime * (0.35 + aRand * 0.45);
    p += vec3(
      sin(t + aRand * 6.2831 + p.y * 0.6),
      cos(t * 0.9 + aRand * 12.566 + p.x * 0.5),
      sin(t * 0.8 + aRand * 9.42 + p.z * 0.7)
    ) * (0.05 + 0.09 * aRand + uVelocity * 0.12) * (1.0 - uNameMix * 0.85);

    // cursor repulsion — the field bends away from the pointer
    vec3 toP = p - uPointer;
    float pd = length(toP);
    float force = uRepel * smoothstep(1.7, 0.0, pd);
    p += (toP / max(pd, 0.001)) * force * 0.55;

    // click shockwave: a gaussian ring races outward from the click,
    // pushing particles as the front passes, amplitude decaying with time
    float sd = length(p - uShock);
    float sFront = uShockTime * 5.5;
    float sRing = exp(-pow((sd - sFront) * 2.4, 2.0));
    float sDecay = exp(-uShockTime * 1.7);
    p += (p - uShock) / max(sd, 0.001) * sRing * sDecay * 0.85;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    // letters pack thousands of particles into a small area — shrink and
    // dim each one while forming or the additive glow smears the glyphs
    gl_PointSize = uSize * (0.5 + aRand * 0.95) * (30.0 / -mv.z) * (1.0 - uNameMix * 0.38);

    vAlpha = (0.35 + 0.65 * aRand) * (1.0 - uNameMix * 0.22);
    // particles flare briefly as the shock front passes through them
    vAlpha += sRing * sDecay * 0.7;
    float mixT = clamp(p.y * 0.22 + 0.5 + 0.25 * sin(aRand * 6.2831 + uTime * 0.2), 0.0, 1.0);
    vColor = mix(uColorB, uColorA, mixT);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.02, d);
    glow *= glow;
    float core = smoothstep(0.16, 0.0, d);
    vec3 col = vColor * glow + vColor * core * 0.9;
    gl_FragColor = vec4(col * vAlpha * uOpacity, 1.0);
  }
`

const Y_AXIS = new THREE.Vector3(0, 1, 0)
const pointerLocal = new THREE.Vector3()
const shockLocal = new THREE.Vector3()

export default function Particles() {
  const material = useRef()
  const points = useRef()
  const count = sceneState.particleCount

  const { wave, sphere, helix, ring, burst, rand, name } = useMemo(() => {
    const shapes = generateShapes(count)
    // placeholder until the async glyph sampling lands — mount never waits
    return { ...shapes, name: new Float32Array(shapes.burst) }
  }, [count])

  // Sample "RONAK" once fonts are ready and swap it into the aName attribute.
  useEffect(() => {
    let cancelled = false
    const aspect = window.innerWidth / Math.max(window.innerHeight, 1)
    const visibleWidth = 2 * Math.tan(THREE.MathUtils.degToRad(55 / 2)) * 7 * aspect
    const worldWidth = THREE.MathUtils.clamp(visibleWidth * 0.85, 3.4, 7.4)

    sampleTextPositions('RONAK', count, worldWidth).then((positions) => {
      window.__nameSampled = !!positions // verification hook for headless checks
      if (cancelled || !positions || !points.current) return
      const attr = points.current.geometry.getAttribute('aName')
      attr.array.set(positions)
      attr.needsUpdate = true
    })
    return () => {
      cancelled = true
    }
  }, [count])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uNameMix: { value: 0 },
      uSize: { value: 1.6 },
      uVelocity: { value: 0 },
      uPointer: { value: new THREE.Vector3(999, 999, 0) },
      uRepel: { value: 0 },
      uShock: { value: new THREE.Vector3(0, 0, 0) },
      uShockTime: { value: 1000 },
      uOpacity: { value: 0 },
      // sceneState stores pre-linearized rgb floats (it can't import three)
      uColorA: { value: new THREE.Color(sceneState.colorA.r, sceneState.colorA.g, sceneState.colorA.b) },
      uColorB: { value: new THREE.Color(sceneState.colorB.r, sceneState.colorB.g, sceneState.colorB.b) },
    }),
    [],
  )

  // Easter-egg formations: when idle, consume a request by rewriting the
  // aName attribute with new targets, then raise nameMix; release after
  // the hold and (for the heart) pop a shockwave on the way out.
  const forming = useRef(false)
  const consumeFormation = () => {
    if (forming.current || !sceneState.formationRequest) return
    if (sceneState.nameMix !== 0) return
    const req = sceneState.formationRequest
    sceneState.formationRequest = null
    forming.current = true

    const aspect = window.innerWidth / Math.max(window.innerHeight, 1)
    const visibleWidth = 2 * Math.tan(THREE.MathUtils.degToRad(55 / 2)) * 7 * aspect
    const build =
      req.kind === 'heart'
        ? Promise.resolve(
            sampleHeartPositions(count, THREE.MathUtils.clamp(visibleWidth * 0.5, 2.4, 4.2)),
          )
        : sampleTextPositions(
            req.text,
            count,
            THREE.MathUtils.clamp(visibleWidth * 0.85, 3.4, 7.4),
            req.y ?? 0.35, // some eggs form lower to dodge page content
          )

    build.then((positions) => {
      if (!positions || !points.current) {
        forming.current = false
        return
      }
      const attr = points.current.geometry.getAttribute('aName')
      attr.array.set(positions)
      attr.needsUpdate = true
      sceneState.formationTag = req.tag
      sceneState.nameMix = 1
      setTimeout(() => {
        sceneState.nameMix = 0
        if (req.tag === 'heart') sceneState.shockRequest = { x: 0, y: 0.1 }
        forming.current = false
      }, (req.hold || 1.8) * 1000 + 1300)
    })
  }

  useFrame((state, delta) => {
    const u = material.current.uniforms
    const dt = Math.min(delta, 1 / 30)
    consumeFormation()
    u.uTime.value += dt
    u.uSize.value = 1.6 * state.viewport.dpr

    // ease every uniform toward its sceneState target — frame-rate independent
    u.uMorph.value = THREE.MathUtils.damp(u.uMorph.value, sceneState.morph, 1.8, dt)
    u.uNameMix.value = THREE.MathUtils.damp(u.uNameMix.value, sceneState.nameMix, 3.4, dt)
    window.__nameMix = u.uNameMix.value // verification hook for headless checks
    u.uOpacity.value = THREE.MathUtils.damp(
      u.uOpacity.value,
      sceneState.opacity * sceneState.dim,
      1.6,
      dt,
    )
    u.uVelocity.value = THREE.MathUtils.damp(u.uVelocity.value, Math.min(Math.abs(sceneState.velocity) * 0.02, 1.2), 3, dt)
    u.uRepel.value = THREE.MathUtils.damp(u.uRepel.value, sceneState.repel, 4, dt)

    const colorEase = 1 - Math.exp(-2.2 * dt)
    const ca = u.uColorA.value
    const cb = u.uColorB.value
    ca.r += (sceneState.colorA.r - ca.r) * colorEase
    ca.g += (sceneState.colorA.g - ca.g) * colorEase
    ca.b += (sceneState.colorA.b - ca.b) * colorEase
    cb.r += (sceneState.colorB.r - cb.r) * colorEase
    cb.g += (sceneState.colorB.g - cb.g) * colorEase
    cb.b += (sceneState.colorB.b - cb.b) * colorEase

    // hold the letters level: freeze spin and unwind rotation while forming
    const nm = u.uNameMix.value
    points.current.rotation.y += dt * sceneState.spin * (1 - nm)
    if (nm > 0.01) {
      points.current.rotation.y = THREE.MathUtils.damp(points.current.rotation.y, 0, 4 * nm, dt)
    }

    // pointer is world-space; the cloud rotates, so bring it into object space
    pointerLocal
      .set(sceneState.pointer3.x, sceneState.pointer3.y, sceneState.pointer3.z)
      .applyAxisAngle(Y_AXIS, -points.current.rotation.y)
    u.uPointer.value.copy(pointerLocal)

    // shockwave clock + click point (also rotated into object space)
    sceneState.shockElapsed = Math.min(sceneState.shockElapsed + dt, 1000)
    u.uShockTime.value = sceneState.shockElapsed
    shockLocal
      .set(sceneState.shock.x, sceneState.shock.y, sceneState.shock.z)
      .applyAxisAngle(Y_AXIS, -points.current.rotation.y)
    u.uShock.value.copy(shockLocal)
  })

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[wave, 3]} />
        <bufferAttribute attach="attributes-aSphere" args={[sphere, 3]} />
        <bufferAttribute attach="attributes-aHelix" args={[helix, 3]} />
        <bufferAttribute attach="attributes-aRing" args={[ring, 3]} />
        <bufferAttribute attach="attributes-aBurst" args={[burst, 3]} />
        <bufferAttribute attach="attributes-aName" args={[name, 3]} />
        <bufferAttribute attach="attributes-aRand" args={[rand, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

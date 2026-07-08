import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Particles from './Particles'
import { sceneState } from './sceneState'

const ndc = new THREE.Vector3()
const prevPointer = new THREE.Vector2(999, 999)

// Gentle parallax camera + projection of the cursor onto the z=0 world
// plane, which drives the particle repulsion field.
function Rig() {
  useFrame((state, delta) => {
    const cam = state.camera
    const dt = Math.min(delta, 1 / 30)
    cam.position.x = THREE.MathUtils.damp(cam.position.x, sceneState.mouse.x * 0.85, 2.2, dt)
    cam.position.y = THREE.MathUtils.damp(cam.position.y, -sceneState.mouse.y * 0.55, 2.2, dt)
    cam.lookAt(0, 0, 0)

    if (!sceneState.hasPointer) return

    ndc.set(sceneState.mouse.x, sceneState.mouse.y, 0.5).unproject(cam)
    const dir = ndc.sub(cam.position).normalize()
    if (Math.abs(dir.z) < 1e-4) return
    const t = -cam.position.z / dir.z
    const px = cam.position.x + dir.x * t
    const py = cam.position.y + dir.y * t

    // first input: jump straight to the cursor so the dent doesn't
    // streak across the field from the far-away parking position
    if (sceneState.pointer3.x > 100) {
      sceneState.pointer3.x = px
      sceneState.pointer3.y = py
      sceneState.pointer3.z = 0
      prevPointer.set(px, py)
      return
    }

    // fast pointer moves push harder than a resting hover
    const speed = Math.hypot(px - prevPointer.x, py - prevPointer.y) / Math.max(dt, 1e-4)
    prevPointer.set(px, py)
    const repelTarget = THREE.MathUtils.clamp(0.35 + speed * 0.05, 0.35, 1.5)
    sceneState.repel = THREE.MathUtils.damp(sceneState.repel, repelTarget, 3, dt)

    sceneState.pointer3.x = THREE.MathUtils.damp(sceneState.pointer3.x, px, 8, dt)
    sceneState.pointer3.y = THREE.MathUtils.damp(sceneState.pointer3.y, py, 8, dt)
    sceneState.pointer3.z = 0
  })
  return null
}

export default function Scene() {
  return (
    <div className="webgl" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 55, position: [0, 0, 7], near: 0.1, far: 60 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Rig />
        <Particles />
      </Canvas>
    </div>
  )
}

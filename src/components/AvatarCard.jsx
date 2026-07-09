import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { sceneState } from '../three/sceneState'

// 3D avatar for the About card: plays the Avaturn idle clip and turns
// the head toward the visitor's cursor (or phone tilt). Lazy-loaded —
// this chunk + the 1.1MB GLB only fetch when About scrolls near.

function Rig() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(0, 1.62, 0)
  }, [camera])
  return null
}

function Avatar() {
  const [gltf, setGltf] = useState(null)
  const mixer = useRef(null)
  const head = useRef(null)
  const spine = useRef(null)
  const baseRot = useRef(null)
  const spineBase = useRef(null)
  const look = useRef({ x: 0, y: 0 })
  const time = useRef(0)

  useEffect(() => {
    let alive = true
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    loader.load('/avatar.glb', (loaded) => {
      if (!alive) return
      loaded.scene.traverse((obj) => {
        if (obj.isMesh) obj.frustumCulled = false
      })
      setGltf(loaded)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!gltf) return
    mixer.current = new THREE.AnimationMixer(gltf.scene)
    if (gltf.animations.length) {
      // the Avaturn idle clip swings the head AND sways the torso — strip
      // both so the gaze is deterministic; we add our own subtle sway
      const clip = gltf.animations[0]
      const filtered = new THREE.AnimationClip(
        clip.name,
        clip.duration,
        clip.tracks.filter((track) => !/head|neck|spine/i.test(track.name)),
      )
      mixer.current.clipAction(filtered).play()
    }

    gltf.scene.traverse((obj) => {
      if (!obj.isBone) return
      if (!head.current && /head/i.test(obj.name)) head.current = obj
      if (!spine.current && /spine/i.test(obj.name)) spine.current = obj
    })
    if (head.current) baseRot.current = head.current.rotation.clone()
    if (spine.current) spineBase.current = spine.current.rotation.clone()
    return () => mixer.current?.stopAllAction()
  }, [gltf])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30)
    mixer.current?.update(dt)

    time.current += dt

    // gaze: absolute pose from the rest rotation — the clip no longer
    // touches head/neck/spine, so we own these bones entirely
    if (head.current && baseRot.current) {
      const src = sceneState.gyro.active ? sceneState.gyro : sceneState.mouse
      const ease = 1 - Math.exp(-6 * dt)
      look.current.x += (THREE.MathUtils.clamp(src.x, -1, 1) - look.current.x) * ease
      look.current.y += (THREE.MathUtils.clamp(src.y, -1, 1) - look.current.y) * ease
      // resting bias: the card sits at the page's left edge, so the
      // neutral gaze points right, into the bio text beside it
      head.current.rotation.y = baseRot.current.y + 0.26 + look.current.x * 0.42
      head.current.rotation.x = baseRot.current.x + look.current.y * 0.26
    }

    // gentle procedural life: slow breathing sway on the torso
    if (spine.current && spineBase.current) {
      spine.current.rotation.z = spineBase.current.z + Math.sin(time.current * 0.6) * 0.015
      spine.current.rotation.x = spineBase.current.x + Math.sin(time.current * 0.9) * 0.012
    }
  })

  if (!gltf) return null
  return <primitive object={gltf.scene} />
}

export default function AvatarCard({ paused = false }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={paused ? 'never' : 'always'}
      camera={{ fov: 35, position: [0, 1.67, 1.12], near: 0.05, far: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
    >
      <Rig />
      {/* site-matched lighting: warm gold key, cool rim, ember fill */}
      <ambientLight color="#3a3430" intensity={1.2} />
      <directionalLight color="#ffd9a0" intensity={2.6} position={[1.5, 2, 2]} />
      <directionalLight color="#8fb8ff" intensity={1.6} position={[-2, 1.5, -1.5]} />
      <directionalLight color="#c2542a" intensity={0.7} position={[-1, 0.4, 2]} />
      <Avatar />
    </Canvas>
  )
}

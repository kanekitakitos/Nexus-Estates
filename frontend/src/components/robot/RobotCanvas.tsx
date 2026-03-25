"use client"

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber"
import {
  OrbitControls,
  useGLTF,
  useAnimations,
  Environment,
} from "@react-three/drei"
import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react"
import * as THREE from "three"

// ========================================
// TIPOS & ANIMAÇÕES DO ROBOT
// ========================================

const STATES = ["Idle", "Walking", "Running", "Dance", "Death", "Sitting", "Standing"] as const
const EMOTES = ["Jump", "Yes", "No", "Wave", "Punch", "ThumbsUp"] as const

type RobotState = (typeof STATES)[number]
type RobotEmote = (typeof EMOTES)[number]
type RobotMood = "idle" | "walk" | "angry" | "dead"

// ========================================
// HELPERS
// ========================================

const findClip = (
    candidates: string[],
    clips: THREE.AnimationClip[]
): THREE.AnimationClip | null => {
  const lower = candidates.map((s) => s.toLowerCase())
  return (
      clips.find((clip) =>
          lower.some((name) => clip.name.toLowerCase().includes(name))
      ) ?? null
  )
}

// ========================================
// 3D MODEL COMPONENT (ROBOT)
// ========================================

function RobotModel({
                      mood,
                      scale,
                      onClick,
                    }: {
  mood: RobotMood
  scale: number
  onClick: () => void
}) {
  const gltf = useGLTF("/model/RobotExpressive.glb")
  const { clips, actions } = useAnimations(gltf.animations, gltf.scene)
  const rootRef = useRef<THREE.Group>(null)

  // Sync animations with mood
  useEffect(() => {
    if (!actions || clips.length === 0) return

    // Stop all actions
    Object.values(actions).forEach((a) => a?.stop())

    // Reset position/rotation
    if (rootRef.current) {
      rootRef.current.rotation.x = 0
      rootRef.current.position.y = -0.7
    }

    let clip: THREE.AnimationClip | null = null

    if (mood === "angry") {
      clip =
          findClip(["angry", "shout", "rage"], clips) ??
          findClip(["run", "walk"], clips) ??
          clips[0]
    } else if (mood === "walk") {
      clip =
          findClip(["walk"], clips) ??
          findClip(["run"], clips) ??
          findClip(["idle"], clips) ??
          clips[0]
    } else if (mood === "dead") {
      clip = findClip(["death", "dead", "die"], clips)
      if (!clip && rootRef.current) {
        rootRef.current.rotation.x = -Math.PI / 2
        rootRef.current.position.y = -0.2
      }
    } else {
      // idle
      clip =
          findClip(["idle"], clips) ??
          findClip(STATES, clips) ??
          clips[0]
    }

    if (clip && actions[clip.name]) {
      actions[clip.name]!.reset().fadeIn(0.1).play()
    }
  }, [actions, clips, mood])

  return (
      <primitive
          ref={rootRef}
          object={gltf.scene}
          position={[0.5, -0.7, 0]}
          rotation={[0, Math.PI, 0]}
          scale={scale}
          onClick={onClick}
          castShadow
          receiveShadow
      />
  )
}

// ========================================
// ROBOT CANVAS (WRAPPER)
// ========================================

export function RobotCanvas({ sectionIndex, moving = false }: { sectionIndex: number; moving?: boolean }) {
  const [mood, setMood] = useState<RobotMood>("idle")
  const [scale, setScale] = useState(0.58)
  const [heightVh, setHeightVh] = useState(30)
  const lightColor = useMemo(() => new THREE.Color("#ffffff"), [])

  // Resize + scale responsive
  useEffect(() => {
    const calc = () => {
      const h = window.innerHeight
      const w = window.innerWidth
      const s = Math.max(0.5, Math.min(0.65, (Math.min(w, h) / 1400) * 0.9))
      setScale(s)
      setHeightVh(h < 760 ? 24 : 30)
    }
    calc()
    window.addEventListener("resize", calc)
    return () => window.removeEventListener("resize", calc)
  }, [])

  // anger → death cooldown
  useEffect(() => {
    if (mood === "angry") {
      const t = setTimeout(() => setMood("dead"), 800)
      return () => clearTimeout(t)
    }
  }, [mood])

  // Sincroniza o robot com o fluxo do site (ex.: walk ao scroll)
  useFrame(() => {
    // Se quiseres, podes usar o scroll/sectionIndex para mudar o mood:
    // ex.: se estiver a “andar” entre seções, mood = "walk"
    // Mas isso depende do teu scroll horizontal (pode ser feito fora do Canvas)
  })

  return (
      <div
          className="pointer-events-none fixed inset-x-0 bottom-20 select-none z-10"
          style={{ width: "100vw", height: `${heightVh}vh` }}
      >
        <Canvas
            className="pointer-events-auto"
            camera={{ position: [0.35, 0.45, 3.3], fov: 28 }}
            gl={{ antialias: true, alpha: true, stencil: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight
              color={lightColor}
              position={[2, 3, 2]}
              intensity={1.2}
              castShadow
          />
          <Environment preset="studio" />

          <Suspense fallback={null}>
            <RobotModel
                mood={mood === "idle" ? (moving ? "walk" : "idle") : mood}
                scale={scale}
                onClick={() => setMood("angry")}
            />
          </Suspense>

          <OrbitControls
              enablePan={false}
              enableZoom={false}
              enableRotate={false}
              enableDamping
              // só se quiseres
          />
        </Canvas>
      </div>
  )
}

// ========================================
// PRELOAD
// ========================================

useGLTF.preload("/model/RobotExpressive.glb")
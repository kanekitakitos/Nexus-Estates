"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, useGLTF, useAnimations, Environment } from "@react-three/drei"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import type { ThreeEvent } from "@react-three/fiber"
import * as THREE from "three"

const ANIMATION_STATES = ["Idle", "Walking", "Running", "Dance", "Death", "Sitting", "Standing"] as const
const ALL_ANIMATION_NAMES: readonly string[] = ANIMATION_STATES
const LIGHT_COLOR = new THREE.Color("#ffffff")

type RobotMood = "idle" | "walk" | "run" | "dance" | "angry"

const MOOD_CANDIDATES: Record<RobotMood, readonly string[]> = {
  idle: ["idle"],
  walk: ["walk", "walking"],
  run: ["run", "running"],
  dance: ["dance"],
  angry: ["angry", "shout", "rage"],
}

function findClip(
  candidates: readonly string[],
  clips: THREE.AnimationClip[]
): THREE.AnimationClip | undefined {
  const lower = candidates.map((s) => s.toLowerCase())
  return clips.find((clip) => lower.some((name) => clip.name.toLowerCase().includes(name)))
}

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
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])
  const { clips, actions } = useAnimations(gltf.animations, scene)
  const rootRef = useRef<THREE.Group>(null)
  const currentActionRef = useRef<THREE.AnimationAction | null>(null)

  useEffect(() => {
    if (!actions || clips.length === 0) return

    currentActionRef.current?.fadeOut(0.2)

    if (rootRef.current) {
      rootRef.current.rotation.x = 0
      rootRef.current.position.y = -0.7
    }

    const candidates = MOOD_CANDIDATES[mood]
    let clip = findClip(candidates, clips)

    if (!clip) {
      if (mood === "angry") clip = findClip(["run", "walk"], clips) ?? clips[0]
      else if (mood === "dance") clip = findClip(["idle"], clips) ?? clips[0]
      else if (mood === "walk") clip = findClip(["run"], clips) ?? clips[0]
      else if (mood === "run") clip = findClip(["walk"], clips) ?? clips[0]
      else clip = findClip(ALL_ANIMATION_NAMES, clips) ?? clips[0]
    }

    if (clip && actions[clip.name]) {
      currentActionRef.current = actions[clip.name]!.reset().fadeIn(0.2).play()
    }
  }, [actions, clips, mood])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onClick()
  }

  return (
    <group ref={rootRef} position={[0, -0.7, 0]} rotation={[0, 0, 0]}>
      <primitive
        object={scene}
        scale={scale}
        onClick={handleClick}
        castShadow
        receiveShadow
      />
    </group>
  )
}

function ResponsiveRobot({
  mood,
  pitch,
  yaw,
  onClick,
}: {
  mood: RobotMood
  pitch: number
  yaw: number
  onClick: () => void
}) {
  const size = useThree((s) => s.size)

  const scale = useMemo(() => {
    const min = Math.min(size.width, size.height)
    return Math.max(0.6, Math.min(0.8, (min / 1400) * 1.1)) 
  }, [size.height, size.width])

  return (
    <group rotation={[pitch, yaw, 0]}>
      <RobotModel mood={mood} scale={scale} onClick={onClick} />
    </group>
  )
}

export function RobotCanvas({
  sectionIndex,
  moving = false,
  enableOrbitRotate = false,
  initialYaw = 0,
  initialPitch = 0,
}: {
  sectionIndex: number
  moving?: boolean
  enableOrbitRotate?: boolean
  initialYaw?: number
  initialPitch?: number
}) {
  const [interactionMood, setInteractionMood] = useState<RobotMood | null>(null)
  const [travelMood, setTravelMood] = useState<RobotMood | null>(null)
  const [yaw] = useState(initialYaw)
  const [pitch] = useState(initialPitch)
  const danceTimerRef = useRef<number | null>(null)
  const angryTimerRef = useRef<number | null>(null)
  const travelTimerRef = useRef<number | null>(null)
  const lastSectionRef = useRef<{ index: number; t: number } | null>(null)

  useEffect(() => {
    if (danceTimerRef.current) window.clearTimeout(danceTimerRef.current)
    if (moving || interactionMood === "angry") {
      if (interactionMood === "dance") {
        const t = window.setTimeout(() => setInteractionMood(null), 0) as unknown as number
        return () => window.clearTimeout(t)
      }
      return
    }
    danceTimerRef.current = window.setTimeout(() => {
      setInteractionMood((current) => (current === "angry" ? current : "dance"))
    }, 6500) as unknown as number
    return () => {
      if (danceTimerRef.current) window.clearTimeout(danceTimerRef.current)
    }
  }, [moving, interactionMood])

  useEffect(() => {
    const now = performance.now()
    const last = lastSectionRef.current
    const dt = last ? now - last.t : Number.POSITIVE_INFINITY

    if (interactionMood === "dance") {
      const t = window.setTimeout(() => setInteractionMood(null), 0) as unknown as number
      return () => window.clearTimeout(t)
    }

    if (travelTimerRef.current) window.clearTimeout(travelTimerRef.current)

    const nextTravelMood: RobotMood = dt < 260 ? "run" : "walk"
    const startTravel = window.setTimeout(
      () => setTravelMood(nextTravelMood),
      0
    ) as unknown as number
    travelTimerRef.current = window.setTimeout(() => setTravelMood(null), 700) as unknown as number

    lastSectionRef.current = { index: sectionIndex, t: now }

    return () => {
      window.clearTimeout(startTravel)
      if (travelTimerRef.current) window.clearTimeout(travelTimerRef.current)
    }
  }, [interactionMood, sectionIndex])

  const baseMood: RobotMood = moving ? "walk" : "idle"
  const currentMood: RobotMood = interactionMood ?? travelMood ?? baseMood

  return (
    <div className="w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] flex-shrink-0">
      <Canvas
        className="pointer-events-auto"
        camera={{ position: [0.0, 0.2, 3.5], fov: 60 }} 
        gl={{ antialias: true, alpha: true, stencil: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          color={LIGHT_COLOR}
          position={[0, 50, 20]}
          intensity={0.8}
          castShadow
        />
        <Environment preset="studio" />

        <Suspense fallback={null}>
          <ResponsiveRobot
            mood={currentMood}
            pitch={pitch}
            yaw={yaw}
            onClick={() => {
              if (danceTimerRef.current) window.clearTimeout(danceTimerRef.current)
              if (angryTimerRef.current) window.clearTimeout(angryTimerRef.current)
              setInteractionMood("angry")
              angryTimerRef.current = window.setTimeout(
                () => setInteractionMood(null),
                1200
              ) as unknown as number
            }}
          />
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={false} enableRotate={enableOrbitRotate} />
      </Canvas>
    </div>
  )
}

useGLTF.preload("/model/RobotExpressive.glb")
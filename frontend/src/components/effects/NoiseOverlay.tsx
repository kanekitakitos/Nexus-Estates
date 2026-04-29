"use client"

import { useId, type CSSProperties } from "react"

type NoiseSource = "svg" | "texture"
type NoisePattern = "dots" | "scanlines" | "none"

type NoiseOverlayProps = {
  source?: NoiseSource
  textureSrc?: string
  pattern?: NoisePattern
  opacity?: number
  zIndex?: number
  tileSize?: number
  baseFrequency?: number
  numOctaves?: number
  noiseOpacity?: number
  scanlineOpacity?: number
  scanlineThickness?: number
  scanlineFadeStart?: number
  scanlinePeriod?: number
  dotOpacity?: number
  dotSize?: number
  dotGap?: number
  mixBlendMode?: CSSProperties["mixBlendMode"]
  backgroundBlendMode?: CSSProperties["backgroundBlendMode"]
  contrast?: number
  brightness?: number
  animationDurationMs?: number
  animationSteps?: number
}

/** Presets alinhados aos usos atuais (ex.: landing) — spread em `<NoiseOverlay {...NOISE_OVERLAY_PRESETS.landing} />` */
export const NOISE_OVERLAY_PRESETS = {
  landing: {
    pattern: "scanlines" as const,
    opacity: 0.12,
  },
} satisfies Record<
  string,
  Partial<Pick<NoiseOverlayProps, "pattern" | "opacity" | "source" | "mixBlendMode">>
>

export function NoiseOverlay({
  source = "svg",
  textureSrc = "/allNoise512.png",
  pattern = "dots",
  opacity = 0.4,
  zIndex = 30,
  tileSize = 180,
  baseFrequency = 0.85,
  numOctaves = 3,
  noiseOpacity = 0.9,
  scanlineOpacity = 0.5,
  scanlineThickness = 1,
  scanlineFadeStart = 3,
  scanlinePeriod = 6,
  dotOpacity = 0.22,
  dotSize = 1,
  dotGap = 7,
  mixBlendMode = "hard-light",
  backgroundBlendMode = "overlay, multiply",
  contrast = 10,
  brightness = 0.10,
  animationDurationMs = 200,
  animationSteps = 4,
}: NoiseOverlayProps) {
  const reactId = useId().replace(/:/g, "")
  const keyframesName = `neNoiseShift-${reactId}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="${baseFrequency}" numOctaves="${numOctaves}" stitchTiles="stitch"/></filter><rect width="${tileSize}" height="${tileSize}" filter="url(#n)" opacity="${noiseOpacity}"/></svg>`
  const svgNoiseUrl = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  const textureUrl = `url("${textureSrc}")`

  const noiseLayer = source === "texture" ? textureUrl : svgNoiseUrl
  const scanlinesLayer = `repeating-linear-gradient(0deg, rgba(0,0,0,${scanlineOpacity}) 0px, rgba(0,0,0,${scanlineOpacity}) ${scanlineThickness}px, transparent ${scanlineFadeStart}px, transparent ${scanlinePeriod}px)`
  const dotsLayer = `radial-gradient(circle, rgba(0,0,0,${dotOpacity}) ${dotSize}px, transparent ${dotSize}px)`
  const patternLayer = pattern === "scanlines" ? scanlinesLayer : pattern === "dots" ? dotsLayer : ""

  const backgroundImage = patternLayer ? `${noiseLayer}, ${patternLayer}` : `${noiseLayer}`
  const backgroundSize = patternLayer
    ? pattern === "scanlines"
      ? `${tileSize}px ${tileSize}px, 100% ${scanlinePeriod}px`
      : `${tileSize}px ${tileSize}px, ${dotGap}px ${dotGap}px`
    : `${tileSize}px ${tileSize}px`

  const keyframesFrom = patternLayer ? "0 0, 0 0" : "0 0"
  const keyframesTo = patternLayer ? `${tileSize}px ${tileSize}px, 0 0` : `${tileSize}px ${tileSize}px`
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex,
          opacity,
          backgroundImage,
          backgroundSize,
          backgroundBlendMode,
          mixBlendMode,
          animation: `${keyframesName} ${animationDurationMs}ms steps(${animationSteps}) infinite`,
          filter: `contrast(${contrast}) brightness(${brightness})`,
        }}
        aria-hidden
      />
      <style>{`
        @keyframes ${keyframesName} {
          0% { background-position: ${keyframesFrom}; }
          100% { background-position: ${keyframesTo}; }
        }
      `}</style>
    </>
  )
}

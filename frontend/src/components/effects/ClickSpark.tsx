"use client"

/**
 * ClickSpark — v2
 *
 * Melhorias vs v1:
 * - Cada spark tem life, speed e size próprios com variação aleatória (±20%)
 *   → aspecto natural em vez de todos se moverem em sincronia
 * - Opacidade por spark: faz fade individual ao longo da sua vida
 * - lineWidth decresce com a progressão (grosso → fino)
 * - Wave simplificada: 1 arco em vez de 3 com offset — menos draw calls
 * - MutationObserver com debounce de 100ms — evita recalcular tema em cascata
 * - Canvas dimensionado por documentElement (evita jump em mobile)
 * - startTimeRef removido (era código morto)
 * - Constantes de física agrupadas no topo para fácil tuning
 * - isBackgroundTarget e helpers de cor mantidos sem alteração
 */

import React, { useRef, useEffect, useCallback } from "react"

// ─────────────────────────────────────────────
// Physics constants — tune here
// ─────────────────────────────────────────────

const SPARK_VARIANCE = 0.2      // ±20% random variation on life, speed, size
const SPARK_MIN_WIDTH = 0.8     // minimum stroke width at end of life
const SPARK_MAX_WIDTH = 2.8     // maximum stroke width at start of life
const WAVE_EXPAND_PX = 88       // max radius a wave expands to
const WAVE_START_PX = 10        // radius a wave starts at
const WAVE_OPACITY_PEAK = 0.18  // max opacity of the wave ring
const MAX_WAVES = 8             // cap concurrent waves to avoid overdraw
const DPR_CAP = 2               // cap device pixel ratio

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ClickSparkProps {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  easing?: "linear" | "ease-in" | "ease-out" | "ease-in-out"
  extraScale?: number
  children?: React.ReactNode
}

/** Mesmos defaults usados na landing (`B.orange` + escala). */
export const CLICK_SPARK_PRESETS = {
  landing: { sparkColor: "#e2621cff", extraScale: 1.2 },
} as const satisfies Record<string, Partial<Pick<ClickSparkProps, "sparkColor" | "extraScale">>>

/** A single spark line particle */
interface Spark {
  x: number
  y: number
  angle: number
  startTime: number
  /** 0–1 multiplier applied to duration, radius, size for this spark */
  variance: number
}

/** A ripple wave emitted on background clicks */
interface Wave {
  x: number
  y: number
  startTime: number
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Deterministic variance in [1 - v, 1 + v] from an index seed */
function seedVariance(index: number, total: number, range: number): number {
  // Use golden ratio distribution for visually even spread
  const golden = (index * 0.618033988749895) % 1
  return 1 - range + golden * 2 * range
}

function applyEasing(t: number, easing: ClickSparkProps["easing"]): number {
  switch (easing) {
    case "linear":      return t
    case "ease-in":     return t * t
    case "ease-in-out": return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    default:            return t * (2 - t)  // ease-out
  }
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// ─────────────────────────────────────────────
// ClickSpark
// ─────────────────────────────────────────────

const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 10,
  duration = 400,
  easing = "ease-out",
  extraScale = 1.0,
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])
  const wavesRef  = useRef<Wave[]>([])
  const viewportRef = useRef({ width: 0, height: 0, dpr: 1 })

  const themeRef = useRef({
    fgSoft:    "rgba(0,0,0,0.06)",
    ring:      "rgba(0,0,0,0.14)",
  })

  // ── Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const width  = document.documentElement.clientWidth
      const height = document.documentElement.clientHeight
      const dpr    = Math.min(DPR_CAP, window.devicePixelRatio || 1)

      viewportRef.current = { width, height, dpr }
      canvas.width  = Math.floor(width  * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  // ── Theme detection with debounce
  useEffect(() => {
    if (typeof window === "undefined") return

    let timer: ReturnType<typeof setTimeout>

    const computeTheme = () => {
      const styles = window.getComputedStyle(document.body)
      const bgRgb  = parseRgb(styles.backgroundColor) ?? { r: 255, g: 255, b: 255 }
      const fgRgb  = parseRgb(styles.color) ?? { r: 0, g: 0, b: 0 }
      const isDark = relativeLuminance(bgRgb) < 0.35

      themeRef.current = {
        fgSoft: `rgba(${fgRgb.r},${fgRgb.g},${fgRgb.b},0.06)`,
        ring:   isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.12)",
      }
    }

    computeTheme()

    const observer = new MutationObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(computeTheme, 100)
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    })

    return () => {
      observer.disconnect()
      clearTimeout(timer)
    }
  }, [])

  // ── Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animId: number
    const waveDuration = Math.max(420, duration)

    const draw = (now: number) => {
      const { width, height } = viewportRef.current
      ctx.clearRect(0, 0, width, height)

      // ── Draw waves
      wavesRef.current = wavesRef.current.filter((wave) => {
        const elapsed  = now - wave.startTime
        if (elapsed >= waveDuration) return false

        const progress = Math.min(1, elapsed / waveDuration)
        const eased    = applyEasing(progress, easing)
        const radius   = lerp(WAVE_START_PX, WAVE_EXPAND_PX, eased)
        const opacity  = WAVE_OPACITY_PEAK * (1 - eased)

        ctx.save()
        ctx.globalAlpha    = opacity
        ctx.strokeStyle    = themeRef.current.ring
        ctx.lineWidth      = lerp(2, 0.5, eased)
        ctx.beginPath()
        ctx.arc(wave.x, wave.y, radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        return true
      })

      // ── Draw sparks
      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed  = now - spark.startTime
        const lifetime = duration * spark.variance
        if (elapsed >= lifetime) return false

        const progress = elapsed / lifetime
        const eased    = applyEasing(progress, easing)

        // Per-spark physics
        const radius     = eased * sparkRadius * extraScale * spark.variance
        const lineLen    = sparkSize * (1 - eased) * spark.variance
        const opacity    = 1 - eased                         // fade out
        const lineWidth  = lerp(SPARK_MAX_WIDTH, SPARK_MIN_WIDTH, eased)

        const x1 = spark.x + radius * Math.cos(spark.angle)
        const y1 = spark.y + radius * Math.sin(spark.angle)
        const x2 = spark.x + (radius + lineLen) * Math.cos(spark.angle)
        const y2 = spark.y + (radius + lineLen) * Math.sin(spark.angle)

        ctx.save()
        ctx.globalAlpha  = opacity
        ctx.strokeStyle  = sparkColor
        ctx.lineWidth    = lineWidth
        ctx.lineCap      = "round"
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        ctx.restore()

        return true
      })

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale])

  // ── Click handler
  const handleClick = useCallback(
    (e: PointerEvent) => {
      const isReduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches

      if (!isReduced && isBackgroundTarget(e.target instanceof Element ? e.target : null)) {
        const now = performance.now()
        wavesRef.current.push({ x: e.clientX, y: e.clientY, startTime: now })
        // Cap wave count
        if (wavesRef.current.length > MAX_WAVES) {
          wavesRef.current = wavesRef.current.slice(-MAX_WAVES)
        }
      }

      if (isReduced) return  // skip sparks too if reduced motion

      const now = performance.now()
      const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
        x:         e.clientX,
        y:         e.clientY,
        angle:     (2 * Math.PI * i) / sparkCount,
        startTime: now,
        variance:  seedVariance(i, sparkCount, SPARK_VARIANCE),
      }))
      sparksRef.current.push(...newSparks)
    },
    [sparkCount]
  )

  useEffect(() => {
    const options: AddEventListenerOptions = { capture: true, passive: true }
    window.addEventListener("pointerdown", handleClick, options)
    return () => window.removeEventListener("pointerdown", handleClick, options)
  }, [handleClick])

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
      {children}
    </>
  )
}

export default ClickSpark

// ─────────────────────────────────────────────
// Pure helpers (no React deps)
// ─────────────────────────────────────────────

function isBackgroundTarget(target: Element | null): boolean {
  if (!target) return true
  const interactive =
    "a,button,input,textarea,select,summary,label,[role='button'],[role='link'],[role='menuitem'],[data-no-bg-wave]"
  if (target.closest(interactive)) return false
  if (target.closest("[data-slot='sidebar']"))                  return false
  if (target.closest("[data-slot='dropdown-menu-content']"))    return false
  if (target.closest("[data-slot='popover-content']"))          return false
  if (target.closest("[data-slot='sheet-content']"))            return false
  if (target.closest("[data-slot='dialog-content']"))           return false
  if (target.closest("[data-slot='brutal-interactive-card']"))  return false
  return true
}

function parseRgb(value: string): { r: number; g: number; b: number } | null {
  const m = value.match(/rgba?\(\s*(\d+)\s*[,\s]+(\d+)\s*[,\s]+(\d+)/i)
  if (!m) return null
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) }
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const linear = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * linear(rgb.r) + 0.7152 * linear(rgb.g) + 0.0722 * linear(rgb.b)
}

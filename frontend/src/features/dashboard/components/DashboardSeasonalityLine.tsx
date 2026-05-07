"use client"

import React, { useEffect, useId, useMemo, useRef, useState } from "react"

type Point = { x: number; y: number }

/**
 * Linha de sazonalidade (multiplicador por dia) para o mês em foco.
 *
 * Design/UX:
 * - estilo "ink" com filtro SVG (turbulence + displacement)
 * - sombra dura offset (estética retro)
 * - animação de entrada (draw-in) + onda senoidal em cima do traçado
 *
 * Implementação:
 * - calcula pontos base a partir de `multipliers`
 * - anima a onda via requestAnimationFrame, recalculando o `d` do path
 * - respeita `prefers-reduced-motion`
 */
function clamp01(x: number): number {
  if (x < 0) return 0
  if (x > 1) return 1
  return x
}

function catmullRomToBezierPath(points: Point[], tension = 1): string {
  if (points.length < 2) return ""
  const t = tension
  const parts: string[] = [`M${points[0].x},${points[0].y}`]

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2

    const c1x = p1.x + ((p2.x - p0.x) / 6) * t
    const c1y = p1.y + ((p2.y - p0.y) / 6) * t
    const c2x = p2.x - ((p3.x - p1.x) / 6) * t
    const c2y = p2.y - ((p3.y - p1.y) / 6) * t

    parts.push(`C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`)
  }

  return parts.join(" ")
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

export function DashboardSeasonalityLine({
  year,
  month,
  dayWidth,
  labelWClassName,
  borderRightClassName,
  borderColorClassName,
  multipliers,
}: {
  year: number
  month: number
  dayWidth: number
  labelWClassName: string
  borderRightClassName: string
  borderColorClassName: string
  multipliers: number[]
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const pathRef = useRef<SVGPathElement>(null)
  const shadowPathRef = useRef<SVGPathElement>(null)
  const uid = useId().replace(/:/g, "")
  const [motionEnabled, setMotionEnabled] = useState(false)
  const phaseOriginRef = useRef<number | null>(null)

  const isFlat = useMemo(() => multipliers.every((m) => m === 1), [multipliers])

  const plot = useMemo(() => {
    if (multipliers.length !== daysInMonth) return null

    const min = Math.min(1, ...multipliers)
    const max = Math.max(1, ...multipliers)
    const range = max - min || 1

    const width = dayWidth * daysInMonth
    const height = 30
    const topPad = 4
    const bottomPad = 4
    const plotHeight = height - topPad - bottomPad

    const points: Point[] = multipliers.map((m, idx) => {
      const x = (idx + 0.5) * dayWidth
      const t = clamp01((m - min) / range)
      const y = topPad + (1 - t) * plotHeight
      return { x, y }
    })

    return {
      width,
      height,
      d: catmullRomToBezierPath(points, 1),
      points,
    }
  }, [multipliers, daysInMonth, dayWidth])

  useEffect(() => {
    const el = pathRef.current
    if (!el || !plot) return
    const len = el.getTotalLength()
    el.style.strokeDasharray = String(len)
    el.style.strokeDashoffset = String(len)
    void el.getBoundingClientRect()
    el.style.transition = "stroke-dashoffset 0.85s cubic-bezier(0.22, 1, 0.36, 1)"
    el.style.strokeDashoffset = "0"
    return () => {
      el.style.transition = ""
    }
  }, [plot])

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setMotionEnabled(!media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    if (!motionEnabled || !plot) return

    const main = pathRef.current
    const shadow = shadowPathRef.current
    if (!main || !shadow) return

    const base = plot.points
    const waveLengthPx = Math.max(dayWidth * 6, 120)
    const k = (2 * Math.PI) / waveLengthPx
    const phaseSpeed = (2 * Math.PI) / 2400
    const amplitude = Math.min(7, Math.max(2.4, dayWidth * 0.11)) * (isFlat ? 1.25 : 1)

    let raf = 0
    let rampStart = 0

    const tick = (t: number) => {
      if (!phaseOriginRef.current) phaseOriginRef.current = t
      if (!rampStart) rampStart = t

      const phase = (t - phaseOriginRef.current) * phaseSpeed
      const rampT = clamp01((t - rampStart) / 650)
      const a = amplitude * easeInOutSine(rampT)

      const points: Point[] = base.map((p) => ({
        x: p.x,
        y: p.y + a * Math.sin(p.x * k + phase),
      }))

      const d = catmullRomToBezierPath(points, 1)
      shadow.setAttribute("d", d)
      main.setAttribute("d", d)

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [dayWidth, isFlat, motionEnabled, plot])

  if (!plot) return null


  const filterId = `ink-${uid}`

  return (
    <div className={`flex ${borderColorClassName}`}>
      <div
        className={`sticky left-0 z-10 ${labelWClassName} ${borderRightClassName} ${borderColorClassName} bg-transparent`}
      />
      <div className="relative overflow-visible" style={{ height: plot.height }}>
        <svg
          width={plot.width}
          height={plot.height}
          viewBox={`0 0 ${plot.width} ${plot.height}`}
          className="absolute inset-0 pointer-events-none overflow-visible"
          aria-label="Multiplicador de preço por dia"
        >
          <defs>
            <filter id={filterId} x="-5%" y="-70%" width="110%" height="220%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.04 0.7"
                numOctaves="3"
                seed="9"
                result="n"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="n"
                scale="2.2"
                xChannelSelector="X"
                yChannelSelector="Y"
              />
            </filter>
          </defs>

          <path
            ref={shadowPathRef}
            d={plot.d}
            fill="none"
            stroke="#c4440f"
            strokeWidth={5.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.55}
            transform="translate(3,3)"
            filter={`url(#${filterId})`}
          />

          <path
            ref={pathRef}
            d={plot.d}
            fill="none"
            stroke="#e2621c"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.97}
            filter={`url(#${filterId})`}
            style={{
              filter: `url(#${filterId}) drop-shadow(3px 3px 0 #c4440f)`,
            }}
          />
        </svg>
      </div>
    </div>
  )
}

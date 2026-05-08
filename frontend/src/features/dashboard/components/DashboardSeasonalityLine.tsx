/**
 * @file DashboardSeasonalityLine.tsx
 * @author Nexus Estates team
 * @description Componente visual que desenha a linha de sazonalidade (multiplicadores de preço) no calendário do dashboard.
 *              Utiliza SVG com animações e filtros para um efeito orgânico ("ink").
 */

"use client"

import React, { useEffect, useId, useMemo, useRef, useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/overlay/tooltip"

type Point = { x: number; y: number }

type Plot = {
  width: number
  height: number
  d: string
  points: Point[]
}

const SEASONALITY_LINE_HEIGHT = 42
const PLOT_PADDING_PX = 2
const BASELINE_FRACTION = 0.09
const SNAP_PX = 5

const WAVE_MIN_WAVELENGTH_PX = 120
const WAVE_WAVELENGTH_DAYS = 6
const WAVE_PHASE_PERIOD_MS = 2400
const WAVE_RAMP_MS = 650
const WAVE_AMPLITUDE_MIN_PX = 2.4
const WAVE_AMPLITUDE_MAX_PX = 7
const WAVE_AMPLITUDE_PER_DAYWIDTH = 0.11
const WAVE_FLAT_AMPLITUDE_MULTIPLIER = 1.25

const TOOLTIP_CLASSNAME =
  "rounded-xl border-2 border-foreground bg-card text-foreground shadow-[4px_4px_0_0_#0D0D0D] px-3 py-2"

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

function clamp(x: number, min: number, max: number): number {
  if (x < min) return min
  if (x > max) return max
  return x
}

function pointsToLinearPath(points: Point[]): string {
  if (points.length < 2) return ""
  const parts: string[] = [`M${points[0].x},${points[0].y}`]
  for (let i = 1; i < points.length; i += 1) {
    const p = points[i]
    parts.push(`L${p.x},${p.y}`)
  }
  return parts.join(" ")
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

function formatMultiplier(x: number): string {
  return Number.isFinite(x) ? x.toFixed(2) : "—"
}

function formatDay(year: number, month: number, day: number): string {
  return new Date(year, month, day).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function computePlot(opts: {
  year: number
  month: number
  dayWidth: number
  multipliers: number[]
}): Plot | null {
  const { year, month, dayWidth, multipliers } = opts
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  if (multipliers.length !== daysInMonth) return null

  const max = Math.max(1, ...multipliers)
  const range = max - 1 || 1

  const width = dayWidth * daysInMonth
  const height = SEASONALITY_LINE_HEIGHT
  const topPad = PLOT_PADDING_PX
  const bottomPad = PLOT_PADDING_PX
  const plotHeight = height - topPad - bottomPad
  const baselineY = topPad + plotHeight * BASELINE_FRACTION
  const downRange = topPad + plotHeight - baselineY

  const points: Point[] = multipliers.map((m, idx) => {
    const x = (idx + 0.5) * dayWidth
    const day = idx + 1

    const mm =
      day === 1 || day === daysInMonth
        ? 1
        : Number.isFinite(m)
          ? Math.max(1, m)
          : 1

    const t = clamp01((mm - 1) / range)
    const y0 = baselineY + t * downRange
    const y1 = baselineY + Math.round((y0 - baselineY) / SNAP_PX) * SNAP_PX
    const y = clamp(y1, baselineY, baselineY + downRange)

    return { x, y }
  })

  return {
    width,
    height,
    d: pointsToLinearPath(points),
    points,
  }
}

function DayMultiplierHoverOverlay({
  year,
  month,
  dayWidth,
  multipliers,
}: {
  year: number
  month: number
  dayWidth: number
  multipliers: number[]
}) {
  return (
    <div className="absolute inset-0 flex">
      {multipliers.map((m, idx) => {
        const day = idx + 1
        const mm = Number.isFinite(m) ? Math.max(1, m) : 1
        return (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <div
                className="h-full flex-shrink-0 cursor-help"
                style={{ width: dayWidth }}
                aria-label={`Multiplicador ${formatMultiplier(mm)} no dia ${day}`}
              />
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8} className={TOOLTIP_CLASSNAME}>
              <div className="grid gap-1">
                <div className="font-mono text-[11px] font-black truncate">
                  {formatDay(year, month, day)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Multiplicador: x{formatMultiplier(mm)}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
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
  const plot = useMemo(
    () => computePlot({ year, month, dayWidth, multipliers }),
    [dayWidth, month, multipliers, year]
  )

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
    const waveLengthPx = Math.max(dayWidth * WAVE_WAVELENGTH_DAYS, WAVE_MIN_WAVELENGTH_PX)
    const k = (2 * Math.PI) / waveLengthPx
    const phaseSpeed = (2 * Math.PI) / WAVE_PHASE_PERIOD_MS
    const amplitude =
      Math.min(
        WAVE_AMPLITUDE_MAX_PX,
        Math.max(WAVE_AMPLITUDE_MIN_PX, dayWidth * WAVE_AMPLITUDE_PER_DAYWIDTH)
      ) * (isFlat ? WAVE_FLAT_AMPLITUDE_MULTIPLIER : 1)

    let raf = 0
    let rampStart = 0

    const tick = (t: number) => {
      if (!phaseOriginRef.current) phaseOriginRef.current = t
      if (!rampStart) rampStart = t

      const phase = (t - phaseOriginRef.current) * phaseSpeed
      const rampT = clamp01((t - rampStart) / WAVE_RAMP_MS)
      const a = amplitude * easeInOutSine(rampT)

      const points: Point[] = base.map((p) => ({
        x: p.x,
        y: p.y + a * Math.max(0, Math.sin(p.x * k + phase)),
      }))

      const d = pointsToLinearPath(points)
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
      <div className="relative overflow-visible" style={{ height: plot.height, width: plot.width }}>
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

        <DayMultiplierHoverOverlay
          year={year}
          month={month}
          dayWidth={dayWidth}
          multipliers={multipliers}
        />
      </div>
    </div>
  )
}

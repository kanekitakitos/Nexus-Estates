"use client"

import React, { useMemo } from "react"

type Point = { x: number; y: number }

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

  const plot = useMemo(() => {
    if (multipliers.length !== daysInMonth) return null

    const min = Math.min(1, ...multipliers)
    const max = Math.max(1, ...multipliers)
    const range = max - min || 1

    const width = dayWidth * daysInMonth
    const height = 22
    const topPad = 2
    const bottomPad = 2
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

  if (!plot) return null

  return (
    <div className={`flex ${borderColorClassName}`}>
      <div
        className={`sticky  left-0 z-10 ${labelWClassName} bg-transparent`}
      />
      <div className="relative h-5 overflow-visible">
        <svg
          width={plot.width}
          height={plot.height}
          viewBox={`0 0 ${plot.width} ${plot.height}`}
          className="absolute inset-0 pointer-events-none"
          aria-label="Multiplicador de preço por dia"
        >
          <path
            d={plot.d}
            fill="none"
            stroke="#e2621c"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.95}
          />
        </svg>
      </div>
    </div>
  )
}

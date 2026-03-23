"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

type BackgroundVariant = "none" | "data-pulses" | "calendar-tetris" | "terminal-logs"

const STORAGE_KEY = "nexus:bg-variant"
const VARIANT_EVENT = "nexus-bg-variant"

export function BrutalGridBackground({ defaultVariant = "none" }: { defaultVariant?: BackgroundVariant }) {
  const shouldReduceMotion = useReducedMotion()
  const [variant, setVariant] = React.useState<BackgroundVariant>(defaultVariant)
  const [viewport, setViewport] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const readStoredVariant = (): BackgroundVariant => {
      const fromDataset = document.documentElement.dataset.bgVariant
      if (
        fromDataset === "none" ||
        fromDataset === "data-pulses" ||
        fromDataset === "calendar-tetris" ||
        fromDataset === "terminal-logs"
      ) {
        return fromDataset
      }
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === "none" || raw === "data-pulses" || raw === "calendar-tetris" || raw === "terminal-logs") return raw
      return defaultVariant
    }

    const sync = () => setVariant(readStoredVariant())
    sync()

    const onResize = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
    onResize()

    window.addEventListener("resize", onResize)
    window.addEventListener(VARIANT_EVENT, sync as EventListener)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener(VARIANT_EVENT, sync as EventListener)
    }
  }, [defaultVariant])

  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "transparent",
          backgroundImage: `
            linear-gradient(var(--color-brutal-grid) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-brutal-grid) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.6,
        }}
      />

      {shouldReduceMotion || variant === "none" ? null : (
        <AnimatePresence mode="wait">
          {variant === "data-pulses" ? <DataPulses key="data-pulses" viewport={viewport} /> : null}
          {variant === "calendar-tetris" ? <CalendarTetris key="calendar-tetris" /> : null}
          {variant === "terminal-logs" ? <TerminalLogs key="terminal-logs" viewport={viewport} /> : null}
        </AnimatePresence>
      )}
    </div>
  )
}

function DataPulses({ viewport }: { viewport: { width: number; height: number } }) {
  const grid = 40
  const width = viewport.width || 1200
  const height = viewport.height || 800
  const lanes = React.useMemo(() => {
    const horizontalLanes = Math.max(8, Math.floor(height / grid))
    const verticalLanes = Math.max(8, Math.floor(width / grid))
    return { horizontalLanes, verticalLanes }
  }, [height, width])

  const [pulses, setPulses] = React.useState<
    Array<{ id: number; horizontal: boolean; delay: number; duration: number; repeatDelay: number; laneIndex: number }>
  >([])

  React.useEffect(() => {
    const count = 14
    const next = Array.from({ length: count }).map((_, index) => {
      const horizontal = index % 2 === 0
      const delay = (Math.random() * 1.8 + index * 0.07) % 2.2
      const duration = 0.8 + Math.random() * 0.7
      const repeatDelay = 0.35 + Math.random() * 1.2
      const laneIndex = horizontal
        ? Math.floor(Math.random() * lanes.horizontalLanes)
        : Math.floor(Math.random() * lanes.verticalLanes)
      return { id: index, horizontal, delay, duration, repeatDelay, laneIndex }
    })
    setPulses(next)
  }, [lanes.horizontalLanes, lanes.verticalLanes])

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {pulses.map((pulse) => {
        if (pulse.horizontal) {
          const y = pulse.laneIndex * grid + 1
          return (
            <motion.div
              key={pulse.id}
              className="absolute left-0"
              style={{
                top: y,
                height: 2,
                width: 16,
                background: "color-mix(in oklch, var(--primary) 85%, transparent)",
                boxShadow: "0 0 0 2px color-mix(in oklch, var(--primary) 28%, transparent)",
              }}
              initial={{ x: -40, opacity: 0 }}
              animate={{
                x: [-(40 + pulse.id * 3), width + 40],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: pulse.duration,
                ease: "linear",
                repeat: Infinity,
                delay: pulse.delay,
                repeatDelay: pulse.repeatDelay,
              }}
            />
          )
        }

        const x = pulse.laneIndex * grid + 1
        return (
          <motion.div
            key={pulse.id}
            className="absolute top-0"
            style={{
              left: x,
              width: 2,
              height: 16,
              background: "color-mix(in oklch, var(--primary) 85%, transparent)",
              boxShadow: "0 0 0 2px color-mix(in oklch, var(--primary) 28%, transparent)",
            }}
            initial={{ y: -40, opacity: 0 }}
            animate={{
              y: [-(40 + pulse.id * 3), height + 40],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: pulse.duration,
              ease: "linear",
              repeat: Infinity,
              delay: pulse.delay,
              repeatDelay: pulse.repeatDelay,
            }}
          />
        )
      })}
    </motion.div>
  )
}

function CalendarTetris() {
  const gridCols = 18
  const gridRows = 12
  const totalCells = gridCols * gridRows
  const [active, setActive] = React.useState<number[]>([])

  React.useEffect(() => {
    const pick = () => {
      const first = Math.floor(Math.random() * totalCells)
      const shouldPair = Math.random() < 0.28
      const second = shouldPair ? pickNeighbor(first, gridCols, totalCells) : null
      const next = second === null ? [first] : [first, second]
      setActive(next)
    }

    pick()
    const interval = window.setInterval(pick, 1100)
    return () => window.clearInterval(interval)
  }, [totalCells])

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
          opacity: 0.9,
        }}
      >
        <AnimatePresence>
          {active.map((index) => {
            const row = Math.floor(index / gridCols) + 1
            const col = (index % gridCols) + 1
            return (
              <motion.div
                key={index}
                style={{
                  gridRow: row,
                  gridColumn: col,
                  borderRadius: 6,
                  backgroundColor: "color-mix(in oklch, var(--foreground) 6%, transparent)",
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function pickNeighbor(index: number, cols: number, total: number): number {
  const candidates: number[] = []
  const row = Math.floor(index / cols)
  const col = index % cols
  const add = (r: number, c: number) => {
    if (r < 0 || c < 0) return
    const i = r * cols + c
    if (i >= 0 && i < total) candidates.push(i)
  }
  add(row, col + 1)
  add(row, col - 1)
  add(row + 1, col)
  add(row - 1, col)
  if (candidates.length === 0) return index
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function TerminalLogs({ viewport }: { viewport: { width: number; height: number } }) {
  const width = viewport.width || 1200
  const height = viewport.height || 800
  const [items, setItems] = React.useState<Array<{ id: string; x: number; y: number; text: string }>>([])

  React.useEffect(() => {
    const samples = [
      "[SEF_SYNC]: 200 OK",
      "[MOLONI]: INV_GEN",
      "[AIRBNB]: CAL_LOCK",
      "[BOOKING]: RATE_PUSH",
      "[WEBHOOK]: IDP_OK",
      "[CHANNEL]: RETRY_1",
      "[PAYMENTS]: TOKENIZED",
      "[AUDIT]: WRITE_OK",
    ]

    const spawn = () => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const x = Math.max(12, Math.floor(Math.random() * (width - 220)))
      const y = Math.max(12, Math.floor(Math.random() * (height - 40)))
      const text = samples[Math.floor(Math.random() * samples.length)]
      setItems((prev) => [...prev.slice(-5), { id, x, y, text }])
    }

    spawn()
    const interval = window.setInterval(spawn, 900)
    return () => window.clearInterval(interval)
  }, [height, width])

  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="absolute select-none whitespace-nowrap font-mono"
            style={{
              left: item.x,
              top: item.y,
              fontSize: 10,
              letterSpacing: "0.06em",
              color: "color-mix(in oklch, var(--foreground) 28%, transparent)",
              textShadow: "1px 1px 0 color-mix(in oklch, var(--background) 70%, transparent)",
              mixBlendMode: "multiply",
            }}
            initial={{ opacity: 0, y: 6, rotate: -0.2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: -6, rotate: 0.35 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {item.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

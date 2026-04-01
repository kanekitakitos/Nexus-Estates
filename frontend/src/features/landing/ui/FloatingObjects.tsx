"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

// ─── Types ────────────────────────────────────────────────────────────────────

// Limpei as propriedades não utilizadas (anim, dur, del)
type IconDef = {
  path: string
  size: string
}

type IconMeta = {
  tx: number
  ty: number
  vx: number
  vy: number
  bxp: number
  byp: number
  r: number
}

type Obstacle = { x: number; y: number; w: number; h: number }

// ─── Constants ────────────────────────────────────────────────────────────────

const ICONS: IconDef[] = [
  { path: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", size: "w-24 h-24" },
  { path: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z", size: "w-32 h-32" },
  { path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", size: "w-28 h-28" },
  { path: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", size: "w-20 h-20" },
  { path: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", size: "w-28 h-28" },
  { path: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", size: "w-24 h-24" },
  { path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01", size: "w-32 h-32" },
  { path: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", size: "w-20 h-20" },
  { path: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", size: "w-24 h-24" },
  { path: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", size: "w-16 h-16" },
]

// ─── Physics helpers ──────────────────────────────────────────────────────────

function initMeta(): IconMeta[] {
  return ICONS.map((icon) => {
    const angle = Math.random() * Math.PI * 2
    const speed = 18 + Math.random() * 24
    const bxp   = 0.18 + Math.random() * 0.64
    const byp   = 0.20 + Math.random() * 0.60
    const sizeMatch = icon.size.match(/w-(\d+)/)
    const sizePx    = sizeMatch ? parseInt(sizeMatch[1], 10) : 24
    const r = Math.max(12, sizePx / 2)
    
    // Adicionei jitter inicial para não começarem todos exatamente no mesmo sítio
    return { 
      tx: (Math.random() - 0.5) * 8, 
      ty: (Math.random() - 0.5) * 8, 
      vx: Math.cos(angle) * speed, 
      vy: Math.sin(angle) * speed, 
      bxp, byp, r 
    }
  })
}

function resolveIconCollisions(meta: IconMeta[], posX: number[], posY: number[]) {
  // ... (Mantive a tua lógica de colisão intacta, está correta)
  for (let i = 0; i < meta.length; i++) {
    for (let j = i + 1; j < meta.length; j++) {
      const mi = meta[i], mj = meta[j]
      const dx = posX[j] - posX[i]
      const dy = posY[j] - posY[i]
      const minDist = mi.r + mj.r + 6
      const dist2   = dx * dx + dy * dy
      if (dist2 === 0 || dist2 >= minDist * minDist) continue
      const dist = Math.sqrt(dist2)
      const nx = dx / dist, ny = dy / dist
      const overlap = minDist - dist
      mi.tx -= nx * overlap * 0.5;  mi.ty -= ny * overlap * 0.5
      mj.tx += nx * overlap * 0.5;  mj.ty += ny * overlap * 0.5
      const viDot = mi.vx * nx + mi.vy * ny
      const vjDot = mj.vx * nx + mj.vy * ny
      mi.vx -= viDot * nx;  mi.vy -= viDot * ny
      mj.vx -= vjDot * nx;  mj.vy -= vjDot * ny
    }
  }
}

function resolveObstacleCollisions(meta: IconMeta[], posX: number[], posY: number[], obstacles: Obstacle[], margin = 12) {
  for (let i = 0; i < meta.length; i++) {
    const m = meta[i]
    const cx = posX[i], cy = posY[i]
    for (const o of obstacles) {
      const closestX = Math.max(o.x - margin, Math.min(cx, o.x + o.w + margin))
      const closestY = Math.max(o.y - margin, Math.min(cy, o.y + o.h + margin))
      const dx = cx - closestX, dy = cy - closestY
      const dist2   = dx * dx + dy * dy
      const minDist = m.r + 8
      if (dist2 >= minDist * minDist) continue
      const dist = Math.max(0.0001, Math.sqrt(dist2))
      const nx = dx / dist, ny = dy / dist
      const push = (minDist - dist) * 0.65
      m.tx += nx * push;  m.ty += ny * push
      const vDot = m.vx * nx + m.vy * ny
      m.vx -= vDot * nx * 0.5
      m.vy -= vDot * ny * 0.5
    }
  }
}

function getObstacles(): Obstacle[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-bg-obstacle]")).map((n) => {
    const r = n.getBoundingClientRect()
    return { x: r.left, y: r.top, w: r.width, h: r.height }
  })
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FloatingObjects() {
  const reduce       = useReducedMotion()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const iconRefs     = useRef<(SVGSVGElement | null)[]>([])
  
  // O uso de useRef para a inicialização garante que corre apenas uma vez 
  // e não suja o render inicial.
  const metaRef      = useRef<IconMeta[]>([])

  // Melhor usar useEffect para evitar warnings em SSR
  useEffect(() => {
    if (reduce) return
    if (metaRef.current.length === 0) metaRef.current = initMeta()

    let obstacles: Obstacle[] = getObstacles()
    
    // Throttling do event listener para não bloquear o layout
    let isThrottled = false
    const refreshObstacles = () => {
      if (!isThrottled) {
        requestAnimationFrame(() => {
          obstacles = getObstacles()
          isThrottled = false
        })
        isThrottled = true
      }
    }
    
    window.addEventListener("resize", refreshObstacles)
    window.addEventListener("scroll", refreshObstacles, { passive: true })

    let raf  = 0
    let last = performance.now()

    const update = () => {
      const now = performance.now()
      const dt  = (now - last) / 1000
      last = now

      const cw = containerRef.current?.clientWidth  ?? window.innerWidth
      const ch = containerRef.current?.clientHeight ?? window.innerHeight
      const rangeX = cw * 0.18
      const rangeY = ch * 0.14

      const posX: number[] = []
      const posY: number[] = []

      // Integração e cálculo de posições absolutas
      for (let i = 0; i < metaRef.current.length; i++) {
        const m = metaRef.current[i]
        m.tx += m.vx * dt
        m.ty += m.vy * dt
        if (m.tx >  rangeX || m.tx < -rangeX) m.vx *= -1
        if (m.ty >  rangeY || m.ty < -rangeY) m.vy *= -1
        
        // Calculamos a posição real baseada na âncora + translação
        posX[i] = (cw * m.bxp) + m.tx
        posY[i] = (ch * m.byp) + m.ty
      }

      resolveIconCollisions(metaRef.current, posX, posY)
      resolveObstacleCollisions(metaRef.current, posX, posY, obstacles)

      // Apply transforms (Agora EXCLUSIVAMENTE via GPU)
      iconRefs.current.forEach((el, i) => {
        if (!el) return
        
        const rot = Math.sin(now * 0.001 + i) * 2
        const op  = 0.03 + 0.03 * (0.5 + 0.5 * Math.sin(now * 0.0012 + i))
        
        // IMPORTANTE: Movemos o elemento usando apenas translate3d a partir do top-0 left-0
        el.style.transform = `translate3d(${posX[i]}px, ${posY[i]}px, 0) rotate(${rot}deg)`
        el.style.opacity   = String(op)
      })

      raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", refreshObstacles)
      window.removeEventListener("scroll", refreshObstacles)
    }
  }, [reduce])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <div
        className="w-full h-full"
        style={{
          animation:   reduce ? "none" : "bgPulse 12s ease-in-out infinite",
          willChange:  reduce ? undefined : "transform",
        }}
      >
        {ICONS.map((icon, i) => (
          <svg
            key={i}
            ref={(el) => { iconRefs.current[i] = el }}
            // Ancorar ao top-0 left-0 é essencial para o translate3d assumir todo o trabalho de posicionamento
            className={`absolute top-0 left-0 ${icon.size} opacity-0 text-current will-change-transform`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{
              mixBlendMode: "overlay",
              filter: "drop-shadow(0 0 4px rgba(255,255,255,0.02))",
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={icon.path}
              strokeOpacity={0.75}
              fill="currentColor"
              fillOpacity={0.02}
            />
          </svg>
        ))}
      </div>

      <style>{`
        @keyframes bgPulse {
          0%,100% { transform: translateZ(0) scale(1) rotate(0deg); }
          50%      { transform: translateZ(0) scale(1.02) rotate(0.4deg); }
        }
      `}</style>
    </div>
  )
}
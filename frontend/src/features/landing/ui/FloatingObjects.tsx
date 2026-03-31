"use client"
 
import { useLayoutEffect, useRef } from "react"
import { useReducedMotion } from "framer-motion"

const ICONS = [
  { // House (Imóveis)
    path: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    pos: "top-[10%] left-[8%]", size: "w-24 h-24", anim: { y: [0, -15, 0], rotate: [0, 3, -3, 0] }, dur: 8, del: 0
  },
  { // Key (Acessos/Check-in)
    path: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
    pos: "bottom-[15%] left-[15%]", size: "w-32 h-32", anim: { y: [0, 20, 0], rotate: [-10, 5, -10] }, dur: 10, del: 1
  },
  { // Calendar (Disponibilidade)
    path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    pos: "top-[25%] right-[12%]", size: "w-28 h-28", anim: { y: [0, -20, 0], rotate: [5, -5, 5] }, dur: 12, del: 2
  },
  { // Sparkle (Qualidade/Reviews)
    path: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
    pos: "bottom-[20%] right-[20%]", size: "w-20 h-20", anim: { scale: [1, 1.2, 1], rotate: [0, 45, 90] }, dur: 9, del: 0.5
  },
  { // Sync Arrows (Sincronização de Canais)
    path: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    pos: "top-[15%] left-[40%]", size: "w-28 h-28", anim: { rotate: [0, 180, 360] }, dur: 25, del: 0
  },
  { // Chat Bubble (Comunicação com Hóspedes)
    path: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    pos: "bottom-[25%] left-[45%]", size: "w-24 h-24", anim: { y: [0, -10, 0], scale: [1, 1.05, 1] }, dur: 7, del: 1.5
  },
  { // Clipboard / Bookings (Reservas)
    path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
    pos: "top-[40%] right-[35%]", size: "w-32 h-32", anim: { y: [0, 15, 0], rotate: [-2, 2, -2] }, dur: 11, del: 3
  },
  { // Tag / Price (Preços/Faturação)
    path: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
    pos: "bottom-[10%] right-[40%]", size: "w-20 h-20", anim: { rotate: [0, -15, 0], x: [0, -10, 0] }, dur: 8.5, del: 2.5
  },
  { // Users / Guests (Hóspedes/Equipa)
    path: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    pos: "top-[50%] left-[25%]", size: "w-24 h-24", anim: { y: [0, 10, 0], scale: [1, 1.1, 1] }, dur: 9, del: 1.2
  },
  { // Bell (Notificações)
    path: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    pos: "bottom-[40%] right-[10%]", size: "w-16 h-16", anim: { rotate: [0, 15, -15, 0] }, dur: 6, del: 0.8
  }
]

export function FloatingObjects() {
  const reduce = useReducedMotion()
  const iconRefs = useRef<(SVGSVGElement | null)[]>([])
  const metaRef = useRef<Array<{ tx: number; ty: number; vx: number; vy: number; bxp: number; byp: number; r: number }>>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  useLayoutEffect(() => {
    if (reduce) return
    if (metaRef.current.length === 0) {
      metaRef.current = iconRefs.current.map((_, i) => {
        const angle = Math.random() * Math.PI * 2
        const speed = 18 + Math.random() * 24 // px/s
        // Base position percent to keep icons within central bands (visible without scroll)
        const bxp = 0.18 + Math.random() * 0.64 // 18% .. 82% width
        const byp = 0.20 + Math.random() * 0.60 // 20% .. 80% height
        const sizeMatch = ICONS[i]?.size?.match(/w-(\d+)/)
        const sizePx = sizeMatch ? parseInt(sizeMatch[1], 10) : 24
        const r = Math.max(12, sizePx / 2)
        return {
          tx: 0,
          ty: 0,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          bxp,
          byp,
          r,
        }
      })
    }
    // Initial layout pass before first paint
    const cw0 = containerRef.current?.clientWidth ?? window.innerWidth
    const ch0 = containerRef.current?.clientHeight ?? window.innerHeight
    iconRefs.current.forEach((el, i) => {
      if (!el) return
      const m = metaRef.current[i]
      // small jitter to avoid clustering on exact base positions
      m.tx += (Math.random() - 0.5) * 8
      m.ty += (Math.random() - 0.5) * 8
      const baseX = cw0 * m.bxp
      const baseY = ch0 * m.byp
      el.style.left = `${baseX}px`
      el.style.top = `${baseY}px`
      el.style.transform = `translate3d(${m.tx}px, ${m.ty}px, 0)`
      el.style.opacity = "0.12"
      el.style.willChange = "transform, opacity"
    })
    let raf = 0
    let last = performance.now()
    let obstacles: Array<{ x: number; y: number; w: number; h: number }> = []
    const refreshObstacles = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-bg-obstacle]"))
      obstacles = nodes.map((n) => {
        const r = n.getBoundingClientRect()
        return { x: r.left, y: r.top, w: r.width, h: r.height }
      })
    }
    refreshObstacles()
    window.addEventListener("resize", refreshObstacles)
    window.addEventListener("scroll", refreshObstacles, { passive: true })
    const update = () => {
      const now = performance.now()
      const dt = (now - last) / 1000
      last = now
      const cw = containerRef.current?.clientWidth ?? window.innerWidth
      const ch = containerRef.current?.clientHeight ?? window.innerHeight
      const rangeX = cw * 0.18
      const rangeY = ch * 0.14
      const posX: number[] = []
      const posY: number[] = []
      for (let i = 0; i < metaRef.current.length; i++) {
        const m = metaRef.current[i]
        const baseX = cw * m.bxp
        const baseY = ch * m.byp
        m.tx += m.vx * dt
        m.ty += m.vy * dt
        if (m.tx > rangeX || m.tx < -rangeX) m.vx *= -1
        if (m.ty > rangeY || m.ty < -rangeY) m.vy *= -1
        posX[i] = baseX + m.tx
        posY[i] = baseY + m.ty
      }
      for (let i = 0; i < metaRef.current.length; i++) {
        for (let j = i + 1; j < metaRef.current.length; j++) {
          const mi = metaRef.current[i]
          const mj = metaRef.current[j]
          const dx = posX[j] - posX[i]
          const dy = posY[j] - posY[i]
          const minDist = mi.r + mj.r + 6
          const dist2 = dx * dx + dy * dy
          if (dist2 > 0 && dist2 < minDist * minDist) {
            const dist = Math.sqrt(dist2)
            const nx = dx / dist
            const ny = dy / dist
            const overlap = minDist - dist
            mi.tx -= nx * (overlap * 0.5)
            mi.ty -= ny * (overlap * 0.5)
            mj.tx += nx * (overlap * 0.5)
            mj.ty += ny * (overlap * 0.5)
            const viDot = mi.vx * nx + mi.vy * ny
            const vjDot = mj.vx * nx + mj.vy * ny
            mi.vx -= viDot * nx
            mi.vy -= viDot * ny
            mj.vx -= vjDot * nx
            mj.vy -= vjDot * ny
          }
        }
      }
      const margin = 12
      for (let i = 0; i < metaRef.current.length; i++) {
        const m = metaRef.current[i]
        const cx = posX[i]
        const cy = posY[i]
        for (let k = 0; k < obstacles.length; k++) {
          const o = obstacles[k]
          const closestX = Math.max(o.x - margin, Math.min(cx, o.x + o.w + margin))
          const closestY = Math.max(o.y - margin, Math.min(cy, o.y + o.h + margin))
          const dx = cx - closestX
          const dy = cy - closestY
          const dist2 = dx * dx + dy * dy
          const minDist = m.r + 8
          if (dist2 < minDist * minDist) {
            const dist = Math.max(0.0001, Math.sqrt(dist2))
            const nx = dx / dist
            const ny = dy / dist
            const push = (minDist - dist) * 0.65
            m.tx += nx * push
            m.ty += ny * push
            const vDot = m.vx * nx + m.vy * ny
            m.vx -= vDot * nx * 0.5
            m.vy -= vDot * ny * 0.5
          }
        }
      }
      iconRefs.current.forEach((el, i) => {
        if (!el) return
        const m = metaRef.current[i]
        const baseX = cw * m.bxp
        const baseY = ch * m.byp
        const rot = Math.sin(now * 0.001 + i) * 2
        el.style.left = `${baseX}px`
        el.style.top = `${baseY}px`
        el.style.transform = `translate3d(${m.tx}px, ${m.ty}px, 0) rotate(${rot}deg)`
        const base = 0.03
        const vary = 0.03
        const op = base + vary * (0.5 + 0.5 * Math.sin(now * 0.0012 + i))
        el.style.opacity = String(op)
        el.style.willChange = "transform, opacity"
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
        style={{
          animation: reduce ? "none" : "bgPulse 12s ease-in-out infinite",
          willChange: reduce ? undefined : "transform",
        }}
      >
        {ICONS.map((icon, i) => (
          <svg
            key={i}
            ref={(el) => (iconRefs.current[i] = el)}
            className={`absolute ${icon.size} opacity-[0.12] text-current`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            style={{ mixBlendMode: "overlay", filter: "drop-shadow(0 0 4px rgba(255,255,255,0.02))" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} strokeOpacity={0.75} fill="currentColor" fillOpacity={0.02} />
          </svg>
        ))}
      </div>
      <style>{`
        @keyframes bgPulse {
          0%   { transform: translateZ(0) scale(1) rotate(0deg); }
          50%  { transform: translateZ(0) scale(1.02) rotate(0.4deg); }
          100% { transform: translateZ(0) scale(1) rotate(0deg); }
        }
      `}</style>
    </div>
  )
}

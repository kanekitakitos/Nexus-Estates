"use client"

import { motion } from "framer-motion"

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
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {ICONS.map((icon, i) => (
        <motion.svg
          key={i}
          className={`absolute ${icon.pos} ${icon.size} opacity-[0.04] text-current`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}
          animate={icon.anim}
          transition={{ duration: icon.dur, repeat: Infinity, ease: "easeInOut", delay: icon.del }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
        </motion.svg>
      ))}
    </div>
  )
}

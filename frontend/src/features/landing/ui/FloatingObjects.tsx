"use client"

import { motion } from "framer-motion"
import { B } from "../tokens"

export function FloatingObjects() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* House */}
      <motion.svg
        className="absolute top-[15%] left-[10%] w-24 h-24 opacity-[0.03]"
        style={{ color: B.black }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}
        animate={{ y: [0, -15, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </motion.svg>

      {/* Key */}
      <motion.svg
        className="absolute bottom-[20%] left-[25%] w-32 h-32 opacity-[0.03]"
        style={{ color: B.black }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}
        animate={{ y: [0, 20, 0], rotate: [-10, 5, -10] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </motion.svg>

      {/* Calendar */}
      <motion.svg
        className="absolute top-[30%] right-[15%] w-28 h-28 opacity-[0.03]"
        style={{ color: B.black }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}
        animate={{ y: [0, -25, 0], rotate: [5, -5, 5] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </motion.svg>

      {/* Sparkle/Star */}
      <motion.svg
        className="absolute bottom-[15%] right-[25%] w-20 h-20 opacity-[0.03]"
        style={{ color: B.black }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}
        animate={{ scale: [1, 1.2, 1], rotate: [0, 45, 90] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </motion.svg>
    </div>
  )
}

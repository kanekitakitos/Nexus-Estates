"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { morphTransition } from "../lib/motion"

export function MorphText({ texts, color }: { texts: readonly string[]; color: string }) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % texts.length), 2200)
    return () => clearInterval(t)
  }, [texts.length])

  return (
      <AnimatePresence mode="wait">
        <motion.span
            key={idx}
            initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            transition={morphTransition}
            style={{ color, fontFamily: "'Georgia',serif", fontStyle: "italic", display: "inline-block" }}
        >
          {texts[idx]}
        </motion.span>
      </AnimatePresence>
  )
}

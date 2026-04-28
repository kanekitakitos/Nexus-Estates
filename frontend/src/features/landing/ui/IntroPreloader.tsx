"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { B } from "../lib/tokens"

type IntroWord = { text: string; italic?: boolean }

const INTRO_WORDS: IntroWord[] = [
  { text: "Nexus" },
  { text: "Estates", italic: true },
  { text: "AL" },
  { text: "Simples.", italic: true },
]

const WORD_DURATION_MS = 620
const WORD_GAP_MS = 100

export function IntroPreloader({ onDone }: { onDone: () => void }) {
  const [wordIndex, setWordIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let wordTimer: ReturnType<typeof setTimeout>
    let leaveTimer: ReturnType<typeof setTimeout>

    const advance = (i: number) => {
      if (i >= INTRO_WORDS.length) {
        leaveTimer = setTimeout(() => {
          setLeaving(true)
          setTimeout(onDone, 680)
        }, 200)
        return
      }
      setWordIndex(i)
      wordTimer = setTimeout(() => advance(i + 1), WORD_DURATION_MS + WORD_GAP_MS)
    }

    advance(0)
    return () => {
      clearTimeout(wordTimer)
      clearTimeout(leaveTimer)
    }
  }, [onDone])

  const word = INTRO_WORDS[wordIndex]

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: B.black }}
      animate={leaving ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.68, ease: [0.76, 0, 0.24, 1] }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg,  ${B.cream} 0px, ${B.cream} 1px, transparent 1px, transparent 48px),
            repeating-linear-gradient(90deg, ${B.cream} 0px, ${B.cream} 1px, transparent 1px, transparent 48px)
          `,
        }}
      />

      <motion.div
        className="absolute bottom-0 left-0 h-[3px]"
        style={{ background: B.orange, transformOrigin: "left" }}
        animate={{ width: `${((wordIndex + 1) / INTRO_WORDS.length) * 100}%` }}
        transition={{ duration: 0.38, ease: "easeOut" }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={wordIndex}
          className="relative flex flex-col items-center select-none"
          initial={{ opacity: 0, y: 56, filter: "blur(10px)", scale: 0.96 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, y: -44, filter: "blur(5px)", scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="font-black leading-none uppercase"
            style={{
              fontSize: "clamp(4.5rem, 16vw, 14rem)",
              fontFamily: "'Georgia','Times New Roman',serif",
              fontStyle: word?.italic ? "italic" : "normal",
              color: word?.italic ? B.orange : B.cream,
              letterSpacing: "-0.03em",
            }}
          >
            {word?.text}
          </span>

          <span
            className="absolute -bottom-8 font-mono text-[9px] uppercase tracking-[0.4em]"
            style={{ color: `${B.cream}28` }}
          >
            {String(wordIndex + 1).padStart(2, "0")} / {String(INTRO_WORDS.length).padStart(2, "0")}
          </span>
        </motion.div>
      </AnimatePresence>

      <span
        className="absolute bottom-7 right-10 font-mono text-[8px] uppercase tracking-[0.35em]"
        style={{ color: `${B.cream}22` }}
      >
        Nexus Estates
      </span>
    </motion.div>
  )
}

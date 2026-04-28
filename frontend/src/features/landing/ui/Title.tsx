"use client"

import { motion } from "framer-motion"
import { B } from "../lib/tokens"
import { titleLineTransition } from "../lib/motion"

export function Title({ lines, italics, fg, size = "clamp(3.6rem,8vw,7.6rem)", wiggle = false }: {
  lines: readonly string[]; italics: readonly boolean[]; fg: string; size?: string; wiggle?: boolean
}) {
  return (
      <div className="relative z-20 overflow-hidden">
        {lines.map((line, i) => (
            <div key={i} className="overflow-hidden pb-4 pt-4 -my-4">
              <motion.h1
                  className="leading-[1.1] uppercase font-black"
                  style={{
                    fontSize: size,
                    fontFamily: "'Georgia','Times New Roman',serif",
                    fontStyle: italics[i] ? "italic" : "normal",
                    color: italics[i] ? B.orange : fg,
                    letterSpacing: "-0.01em",
                  }}
                  initial={{ y: "108%" }}
                  animate={
                    wiggle
                      ? { y: "0%", x: [0, -2, 2, 0], rotate: [0, -1.2, 1.2, 0] }
                      : { y: "0%" }
                  }
                  transition={titleLineTransition(i)}
              >
                {line}
              </motion.h1>
            </div>
        ))}
      </div>
  )
}

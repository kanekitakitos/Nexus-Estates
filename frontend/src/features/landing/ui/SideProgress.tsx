"use client"

import { motion } from "framer-motion"
import { SECTIONS, B } from "../lib/tokens"
import { sideProgressTransition, slideInLeftEnter } from "../lib/motion"

export function SideProgress({ active, fg }: { active: number; fg: string }) {
  return (
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-5">
        {SECTIONS.map((s, i) => (
            <motion.div key={s.id} className="flex items-center gap-2"
                        animate={{ opacity: i === active ? 1 : 0.18 }}
                        transition={sideProgressTransition}>
              <motion.div className="h-[1.5px]" style={{ background: i === active ? B.orange : fg }}
                          animate={{ width: i === active ? 22 : 5 }}
                          transition={sideProgressTransition} />
              {i === active && (
                  <motion.span {...slideInLeftEnter(0, -6)}
                               className="font-mono text-[8px] uppercase tracking-[0.3em] whitespace-nowrap"
                               style={{ color: B.orange }}>
                    {s.label}
                  </motion.span>
              )}
            </motion.div>
        ))}
      </div>
  )
}

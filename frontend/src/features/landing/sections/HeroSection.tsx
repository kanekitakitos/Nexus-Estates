"use client"

import { motion } from "framer-motion"
import { B, MORPHING, SECTIONS } from "../tokens"
import { Title } from "../ui/Title"
import { MorphText } from "../ui/MorphText"
import { ease, fadeUpEnter, slideInLeftEnter } from "../motion"

export function HeroSection({ s }: { s: typeof SECTIONS[0] }) {
  return (
      <div className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-40 pt-16 overflow-hidden" data-bg-obstacle>
        <motion.div className="absolute right-[-5%] top-1/2 -translate-y-1/2 pointer-events-none select-none"
             animate={{ y:[-6,6,-6] }}
             transition={{ duration: 5.2, repeat: Infinity, ease: ease.inOut }}
             style={{ fontSize:"26vw", color:"transparent",
               WebkitTextStroke:`2px ${B.black}12`,
               fontFamily:"'Georgia',serif", fontStyle:"italic", lineHeight:1 }}>
          AL
        </motion.div>
        <motion.div {...slideInLeftEnter(0.15, -16)} className="flex items-center gap-3 mb-6 relative z-20">
          <motion.span className="w-7 h-[1px]" style={{ background:`${B.black}30` }} />
          <span className="font-mono text-[9px] uppercase tracking-[0.32em]" style={{ color:`${B.black}79` }}>
          Property Management System
        </span>
        </motion.div>
        <div className="relative z-20">
          <Title lines={s.title} italics={s.italic} fg={s.fg} size="clamp(3.6rem,8vw,7.6rem)" wiggle />
        </div>
        <motion.div className="mt-6 mb-8 relative z-20 h-10 flex items-center"
                    style={{ fontSize:"clamp(1.4rem,2.5vw,2.1rem)" }}
                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: 0.9, duration: 0.3 }}>
          <MorphText texts={MORPHING} color={B.orange} />
        </motion.div>
        <motion.div className="flex items-center gap-6 relative z-20" {...fadeUpEnter(1.1, 16)}>
          <motion.div className="flex items-center gap-2"
                      animate={{ x:[0,6,0] }} transition={{ duration: 1.6, repeat: Infinity, ease: ease.inOut }}>
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color:`${B.black}60` }}>
            Faz Scroll
          </span>
            <motion.span style={{ color:`${B.black}60` }} className="text-sm">››</motion.span>
          </motion.div>
        </motion.div>
      </div>
  )
}

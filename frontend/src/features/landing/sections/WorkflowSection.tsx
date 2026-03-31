"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { B, SECTIONS, STEPS } from "../tokens"
import { Title } from "../ui/Title"

export function WorkflowSection({ s }: { s: typeof SECTIONS[0] }) {
  const [activeStep, setActiveStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setActiveStep(i => (i+1) % STEPS.length), 2400)
    return () => clearInterval(t)
  }, [])

  return (
      <div className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 overflow-hidden">
        <motion.span className="font-mono text-[9px] uppercase tracking-[0.32em] mb-4 block relative z-20"
                     style={{ color:`${B.cream}45` }}
                     initial={{ opacity:0 }} animate={{ opacity:1 }}>
          {s.label} — Fluxo
        </motion.span>
        <div className="mb-10 relative z-20">
          <Title lines={s.title} italics={s.italic} fg={s.fg} size="clamp(2.1rem,4.4vw,4.8rem)" />
        </div>
        <div className="relative z-20">
          {/* Timeline */}
          <div className="relative h-8 hidden md:block mb-4">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2"
                 style={{ background:`${B.cream}10` }} />
            <motion.div className="absolute top-1/2 left-0 h-[1px] -translate-y-1/2"
                        style={{ background:B.orange }}
                        animate={{ width:`${(activeStep+1)*25}%` }}
                        transition={{ duration:0.6, ease:[0.16,1,0.3,1] }} />
            <div className="absolute inset-0 grid grid-cols-4 gap-6 pointer-events-none">
              {STEPS.map((_, i) => (
                <div key={`dot-${i}`} className="relative h-full">
                  <motion.div className="absolute top-1/2 left-0 w-3 h-3 rounded-full border-2 -translate-y-1/2"
                              style={{ borderColor:B.orange }}
                              animate={{
                                background: activeStep >= i ? B.orange : B.black,
                                boxShadow: activeStep === i ? `0 0 16px ${B.orange}90` : "none",
                                scale: activeStep === i ? [1,1.15,1] : 1,
                              }}
                              transition={{ duration:0.7, repeat: activeStep === i ? Infinity : 0, ease:"easeInOut" }} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
                <motion.div key={step.n}
                            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                            transition={{ delay:0.35 + i*0.1 }}
                            className="relative cursor-default p-5 flex flex-col justify-start"
                            style={{
                              border: activeStep === i ? `2px solid ${B.orange}` : "2px solid rgba(240,236,217,0.35)",
                              boxShadow: activeStep === i ? `6px 6px 0 0 rgba(232,86,10,0.25)` : "4px 4px 0 0 rgba(240,236,217,0.16)",
                              background: activeStep === i ? "rgba(13,13,13,0.95)" : "rgba(13,13,13,0.6)",
                            }}
                            onMouseEnter={() => setActiveStep(i)}
                            data-hover>
                  <motion.div
                    animate={activeStep === i ? { rotate: [0, -0.35, 0.35, 0], y: [0, -2, 0] } : { rotate: 0, y: 0 }}
                    transition={activeStep === i ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.25, ease: "easeOut" }}
                  >
                    <motion.div className="font-mono text-[9px] tracking-widest mb-2 font-bold"
                                animate={{ color: activeStep === i ? B.orange : `${B.orange}55` }}>
                      {step.n}
                    </motion.div>
                    <motion.h3 className="font-mono font-bold text-xs uppercase tracking-widest mb-2"
                               animate={{ color: activeStep === i ? B.cream : `${B.cream}45` }}>
                      {step.title}
                    </motion.h3>
                    <motion.p className="text-xs leading-relaxed"
                              animate={{ color: activeStep === i ? `${B.cream}65` : `${B.cream}28` }}>
                      {step.desc}
                    </motion.p>
                  </motion.div>
                </motion.div>
            ))}
          </div>
        </div>
      </div>
  )
}

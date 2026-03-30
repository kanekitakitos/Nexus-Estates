"use client"

import { motion } from "framer-motion"
import { B, BENTO_FEATURES, SECTIONS } from "../tokens"
import { Title } from "../ui/Title"

export function FeaturesSection({ s }: { s: typeof SECTIONS[0] }) {
  return (
      <div className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 pb-12 overflow-hidden">
        <motion.span className="font-mono text-[9px] uppercase tracking-[0.32em] mb-4 block relative z-20"
                     style={{ color:`${B.black}55` }}
                     initial={{ opacity:0 }} animate={{ opacity:1 }}>
          {s.label} — Produto
        </motion.span>
        <div className="mb-8 relative z-20">
          <Title lines={s.title} italics={s.italic} fg={s.fg} size="clamp(2.1rem,4.4vw,4.8rem)" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-20 auto-rows-[12rem]" style={{ maxWidth:"calc(100% - 60px)" }}>
          {BENTO_FEATURES.map((f, i) => (
              <motion.div key={f.n}
                          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                          transition={{ delay:0.3 + i*0.1, duration:0.6, ease:[0.16,1,0.3,1] }}
                          className={`${f.span} relative p-6 group cursor-default overflow-hidden flex flex-col justify-end`}
                          style={{
                            background:B.cream,
                            border:`2px solid ${B.black}`,
                            boxShadow:`6px 6px 0 0 ${B.black}`,
                          }}
                          whileHover={{ x:2, y:2, boxShadow:"0px 0px 0 0 rgba(0,0,0,0)" }}
                          data-hover>
                <motion.svg className="absolute top-5 left-6 w-6 h-6"
                            style={{ color: B.orange }}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            animate={{ rotate:[-2,2,-2], scale:[1,1.06,1] }}
                            transition={{ duration:3.2, repeat:Infinity, ease:"easeInOut" }}>
                  {f.icon}
                </motion.svg>
                <div className="absolute inset-0 flex items-end justify-end p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
              <motion.span
                className="text-[9.5rem] font-serif italic font-black text-black leading-none -mb-6 -mr-3 select-none inline-block"
                animate={{ rotate: [0, -0.8, 0.8, 0], y: [0, -2, 0] }}
                transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }}
              >
                {f.n}
              </motion.span>
                </div>
                <div className="relative z-10">
                  <div className="font-mono font-bold text-[11px] uppercase tracking-widest mb-2" style={{ color:B.black }}>
                    {f.title}
                  </div>
                  <p className="text-xs leading-relaxed max-w-[90%]" style={{ color:`${B.black}60` }}>
                    {f.desc}
                  </p>
                </div>
                <motion.div className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                            style={{ background:B.orange }} />
              </motion.div>
          ))}
        </div>
      </div>
  )
}

"use client"

import { motion } from "framer-motion"
import { SECTIONS, B } from "../tokens"

export function Nav({ active, goTo, fg }: { active:number; goTo:(i:number)=>void; fg:string }) {
  return (
      <motion.nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
                  initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
        <button onClick={() => goTo(0)} className="flex items-center gap-2 group" data-hover>
          <motion.span className="w-7 h-7 flex items-center justify-center text-[11px] font-black rounded-sm"
                       style={{ background:B.orange, color:B.cream }}
                       whileHover={{ scale:1.1, rotate:-5 }}
                       transition={{ type:"spring", stiffness:400, damping:17 }}>
            N
          </motion.span>
          <span className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase hidden sm:block transition-opacity"
                style={{ color:fg }}>
          Nexus Estates
        </span>
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 rounded-full px-3 py-2"
             style={{ background:`${fg}08`, backdropFilter:"blur(16px)",
               border:`1px solid ${fg}12` }}>
          {SECTIONS.slice(1).map((s, i) => {
            const idx = i + 1
            return (
                <motion.button key={s.id} onClick={() => goTo(idx)}
                               className="relative px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest rounded-full transition-colors duration-300"
                               style={{ color: active === idx ? B.orange : `${fg}45` }}
                               whileHover={{ scale:1.05 }}
                               data-hover>
                  {active === idx && (
                      <motion.span className="absolute inset-0 rounded-full"
                                   style={{ background:`${B.orange}14` }}
                                   layoutId="nav-pill" />
                  )}
                  {s.label}
                </motion.button>
            )
          })}
        </div>
        <div className="flex gap-3 items-center">
          <a href="/login"
             className="font-mono text-[10px] uppercase tracking-widest transition-opacity hidden md:block hover:opacity-60"
             style={{ color:`${fg}55` }} data-hover>
            Login
          </a>
          <motion.a href="/booking"
                    className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 relative overflow-hidden group"
                    style={{ background:B.orange, color:B.cream }}
                    whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
                    data-hover>
            Começar →
          </motion.a>
        </div>
      </motion.nav>
  )
}

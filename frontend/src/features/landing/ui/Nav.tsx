"use client"

import { motion } from "framer-motion"
import { SECTIONS, B } from "../tokens"
import { springBounce } from "../motion"

// ─── Types ────────────────────────────────────────────────────────────────────

type NavProps = {
  active: number
  goTo: (i: number) => void
  fg: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const panelStyle = (fg: string) => ({
  border: `4px solid ${fg}38`,
  boxShadow: `5px 5px 0 0 ${fg}22`,
  background: `${fg}18`,
  borderRadius: 12,
})

// ─── Sub-components ───────────────────────────────────────────────────────────

function Logo({ goTo, fg }: { goTo: NavProps["goTo"]; fg: string }) {
  return (
    <div className="py-3 px-10 w-full" style={panelStyle(fg)}>
      <button onClick={() => goTo(0)} className="flex items-center gap-2 group" data-hover>
        <motion.span
          className="w-7 h-7 flex items-center justify-center text-[11px] font-black rounded-md"
          style={{ background: B.orange, color: B.cream }}
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={springBounce}
        >
          N
        </motion.span>
        <span
          className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase hidden sm:block transition-opacity"
          style={{ color: fg }}
        >
          Nexus Estates
        </span>
      </button>
    </div>
  )
}

function NavLinks({ active, goTo, fg }: NavProps) {
  return (
    <div className="hidden md:flex flex-1 justify-center">
      <div className="py-0.5 px-2 w-auto" style={panelStyle(fg)}>
        <div className="flex items-center gap-1 rounded-full px-3 py-2">
          {SECTIONS.slice(1).map((s, i) => {
            const idx = i + 1
            const isActive = active === idx
            return (
              <motion.button
                key={s.id}
                onClick={() => goTo(idx)}
                className="relative px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest rounded-full transition-colors duration-300"
                style={{ color: isActive ? B.orange : `${fg}45` }}
                whileHover={{ scale: 1.05 }}
                data-hover
              >
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ background: `${B.orange}14` }}
                    layoutId="nav-pill"
                  />
                )}
                {s.label}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function NavActions({ fg }: { fg: string }) {
  return (
    <div className="py-3 px-10 w-full" style={panelStyle(fg)}>
      <div className="flex gap-3 items-center justify-end">
        <a
          href="/login"
          className="font-mono text-[10px] uppercase tracking-widest transition-opacity hidden md:block hover:opacity-60"
          style={{ color: `${fg}55` }}
          data-hover
        >
          Login
        </a>
        <motion.a
          href="/booking"
          className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 relative overflow-hidden group"
          style={{ background: B.orange, color: B.cream }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          data-hover
        >
          Começar →
        </motion.a>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Nav({ active, goTo, fg }: NavProps) {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between md:px-5 py-2 gap-10"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Logo goTo={goTo} fg={fg} />
      <NavLinks active={active} goTo={goTo} fg={fg} />
      <NavActions fg={fg} />
    </motion.nav>
  )
}
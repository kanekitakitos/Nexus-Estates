"use client"

import { motion } from "framer-motion"
import { SECTIONS, B } from "../tokens"

// ─── Types ────────────────────────────────────────────────────────────────────

type NavProps = {
  active: number
  goTo: (i: number) => void
  fg: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const containerStyle = (fg: string) => ({
  border: `2px solid ${fg}70`,
  background: `${fg}08`,
})

// ─── Sub-components ───────────────────────────────────────────────────────────

function Logo({ goTo, fg }: { goTo: NavProps["goTo"]; fg: string }) {
  return (
    <button
      onClick={() => goTo(0)}
      className="font-black uppercase tracking-tight text-[18px] md:text-[20px] hover:opacity-70 transition-opacity"
      style={{ color: fg }}
      data-hover
    >
      Nexus Estates
    </button>
  )
}

function NavLinks({ active, goTo, fg }: NavProps) {
  return (
    <div className="hidden md:flex items-center gap-10">
      {SECTIONS.slice(1).map((s, i) => {
        const idx = i + 1
        const isActive = active === idx
        return (
          <button
            key={s.id}
            onClick={() => goTo(idx)}
            className="font-black uppercase tracking-widest text-[14px] hover:opacity-70 transition-opacity"
            style={{ color: isActive ? B.orange : fg, opacity: isActive ? 1 : 0.88 }}
            data-hover
          >
            {s.label}
          </button>
        )
      })}
    </div>
  )
}

function NavActions({ fg }: { fg: string }) {
  return (
    <div className="flex items-center gap-8">
      <a
        href="/login"
        className="hidden md:inline font-black uppercase tracking-widest text-[14px] hover:opacity-70 transition-opacity"
        style={{ color: fg, opacity: 0.88 }}
        data-hover
      >
        Login
      </a>
      <a
        href="/booking"
        className="font-black uppercase tracking-widest text-[14px] hover:opacity-70 transition-opacity"
        style={{ color: B.orange }}
        data-hover
      >
        Começar
      </a>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Nav({ active, goTo, fg }: NavProps) {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-2 md:px-3 py-3"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="mx-auto w-full max-w-7xl rounded-md h-full" style={containerStyle(fg)}>
        <div className="flex items-center justify-between px-5 md:px-7 py-3">
          <Logo goTo={goTo} fg={fg} />
          <NavLinks active={active} goTo={goTo} fg={fg} />
          <NavActions fg={fg} />
        </div>
      </div>
    </motion.nav>
  )
}

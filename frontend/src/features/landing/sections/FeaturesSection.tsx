"use client"

import { AnimatePresence, motion } from "framer-motion"
import type { CSSProperties, ReactNode } from "react"
import { useState } from "react"
import { B, BENTO_FEATURES, SECTIONS } from "../lib/tokens"
import { Title } from "../ui/Title"
import { ease } from "../lib/motion"

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = (typeof SECTIONS)[number]
type BentoFeature = (typeof BENTO_FEATURES)[number]

// ─── Constants ────────────────────────────────────────────────────────────────

const GLASS_ROTATIONS = [-15, 5, 25, -8] as const

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <motion.span
      className="font-mono text-[9px] uppercase tracking-[0.32em] mb-5 mt-5 md:mt-10 lg:mt-12 block relative z-20"
      style={{ color: `${B.black}66` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {label} — Produto
    </motion.span>
  )
}

function GlassCard({
  text,
  rotation,
  children,
  back,
}: {
  text: string
  rotation: number
  children: ReactNode
  back: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      data-text={text}
      style={
        {
          "--card-rot": `${rotation}deg`,
        } as CSSProperties
      }
      className="
        relative w-[190px] h-[220px]
        bg-gradient-to-b from-white/20 to-transparent
        border border-white/10 rounded-[10px]
        shadow-[0_25px_25px_rgba(0,0,0,0.25)] backdrop-blur-md
        -mx-[55px] transition-all duration-500
        rotate-[var(--card-rot)] group-hover:rotate-0 group-hover:mx-[12px]
        before:content-[attr(data-text)] before:absolute before:bottom-0
        before:flex before:items-center before:justify-center
        before:w-full before:h-[44px] before:bg-white/5 before:text-white
        before:font-mono before:text-[10px] before:uppercase before:tracking-widest
      "
      onClick={() => setOpen(v => !v)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setOpen(v => !v)
      }}
    >
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center"
      >
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.div
              key="front"
              className="text-[2.6em]"
              style={{ color: B.cream }}
              initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
              transition={{ duration: 0.28, ease: ease.out }}
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              key="back"
              className="w-full"
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
              transition={{ duration: 0.28, ease: ease.out }}
            >
              <div className="text-[11px] leading-relaxed" style={{ color: "rgba(240,236,217,0.86)" }}>
                {back}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function GlassFeatureCard({ feature, rotation }: { feature: BentoFeature; rotation: number }) {
  return (
    <GlassCard
      text={feature.title}
      rotation={rotation}
      back={feature.desc}
    >
      <svg
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {feature.icon}
      </svg>
    </GlassCard>
  )
}

function FeaturesShowcase({ desc }: { desc: string }) {
  return (
    <motion.div
      className="relative z-20 mt-2"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: ease.out, delay: 0.25 }}
      style={{
        background: B.black,
        border: `2px solid ${B.black}`,
        boxShadow: `8px 8px 0 0 ${B.black}`,
        borderRadius: 14,
      }}
    >
      <div className="px-2 ">
        <div className="flex items-center justify-between">
          <div className="max-w-xl">
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: `${B.cream}8A` }}>
              Features
            </div>
            <div className="mt-2 text-sm leading-relaxed" style={{ color: `${B.cream}B8` }}>
              {desc}
            </div>
          </div>
          <div className="hidden md:block font-mono text-[10px] uppercase tracking-widest" style={{ color: `${B.cream}52` }}>
            Hover para expandir
          </div>
        </div>

        <div className="relative flex items-center justify-center group pt-3 pb-2">
          {BENTO_FEATURES.map((feature, index) => (
            <GlassFeatureCard
              key={feature.n}
              feature={feature}
              rotation={GLASS_ROTATIONS[index % GLASS_ROTATIONS.length]}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FeaturesSection({ s }: { s: Section }) {
  return (
    <div
      className="relative w-auto h-auto flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 pb-28 overflow-hidden"
      data-bg-obstacle
    >
      <SectionLabel label={s.label} />

      <div className="mb-8 relative z-20">
        <Title lines={s.title} italics={s.italic} fg={s.fg} size="clamp(2.1rem,4.4vw,4.8rem)" />
      </div>

      <FeaturesShowcase desc={s.desc} />
    </div>
  )
}

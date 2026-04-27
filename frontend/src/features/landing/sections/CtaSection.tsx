"use client"

import { motion, useReducedMotion } from "framer-motion"
import { B, SECTIONS, landingTokens } from "../lib/tokens"
import { ease } from "../lib/motion"
import { CassetteCard } from "../ui/CassetteCard"

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = (typeof SECTIONS)[number]

// ─── Sub-components ───────────────────────────────────────────────────────────

function DotGrid() {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: landingTokens.ui.landing.effects.dotGridSmall,
          backgroundSize: "22px 22px",
        }}
      />
      <AnimatedDotGrid />
    </>
  )
}

function AnimatedDotGrid() {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={reduce ? undefined : { opacity: [0.06, 0.12, 0.06] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: ease.inOut }}
      style={{
        backgroundImage: landingTokens.ui.landing.effects.dotGridLarge,
        backgroundSize: "28px 28px",
      }}
    />
  )
}

function CtaTitle({ s }: { s: Section }) {
  return (
    <div className="relative z-20 mb-8">
      {s.title.map((line, i) => (
        <div key={i} className="overflow-hidden">
          <motion.h1
            className="leading-[0.88] uppercase font-black"
            style={{
              fontSize: "clamp(3.2rem,8.8vw,8rem)",
              fontFamily: "'Georgia','Times New Roman',serif",
              fontStyle: s.italic[i] ? "italic" : "normal",
              color: s.italic[i] ? B.black : B.cream,
              letterSpacing: "-0.01em",
            }}
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ delay: 0.18 + i * 0.14, duration: 0.9, ease: ease.out }}
          >
            {line}
          </motion.h1>
        </div>
      ))}
    </div>
  )
}

function FloatingShapes() {
  const reduce = useReducedMotion()
  return (
    <>
      <motion.div
        className="absolute -top-10 -left-10 w-16 h-16 pointer-events-none"
        style={{ border: `2px dashed ${B.cream}`, opacity: 0.35 }}
        animate={reduce ? undefined : { rotate: [0, 180], scale: [1, 1.08, 1] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -bottom-12 right-10 w-14 h-14 rounded-full pointer-events-none"
        style={{ border: `2px solid ${B.black}`, opacity: 0.25 }}
        animate={reduce ? undefined : { y: [0, -8, 0], x: [0, 6, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: ease.inOut }}
      />
    </>
  )
}

function PrimaryCtaButton({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.a
      href="/register"
      className="font-mono text-[10px] uppercase tracking-widest px-8 py-4 relative overflow-hidden"
      style={{
        background:  B.black,
        color:       B.cream,
        border:      `2px solid ${B.black}`,
        boxShadow:   `6px 6px 0 0 ${B.black}`,
      }}
      animate={reduce ? undefined : { scale: [1, 1.02, 1] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: ease.inOut }}
      whileHover={{ x: 2, y: 2, boxShadow: landingTokens.ui.landing.effects.transparentBoxShadow }}
      whileTap={{ scale: 0.97 }}
      aria-label={landingTokens.copy.landing.cta.primaryAriaLabel}
      data-hover
    >
      {landingTokens.copy.landing.cta.primaryText}
    </motion.a>
  )
}

function CtaActions() {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className="flex flex-col sm:flex-row items-start gap-4 relative z-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75 }}
    >
      <FloatingShapes />
      <PrimaryCtaButton reduce={reduce} />
    </motion.div>
  )
}

function Disclaimer() {
  return (
    <motion.p
      className="mt-6 font-mono text-[8px] uppercase tracking-widest relative z-20"
      style={{ color: `${B.cream}4C` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.1 }}
    >
      {landingTokens.copy.landing.cta.disclaimer}
    </motion.p>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CtaSection({ s }: { s: Section }) {
  return (
    <div
      className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 overflow-hidden"
      data-bg-obstacle
    >
      <DotGrid />

      <motion.span
        className="font-mono text-[9px] uppercase tracking-[0.32em] mb-4 block relative z-20"
        style={{ color: `${B.cream}66` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {s.label}
        {landingTokens.copy.landing.plans.sectionJoiner}
        {landingTokens.copy.landing.cta.sectionSuffix}
      </motion.span>

      <div className="relative z-20 flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-2">
        <div className="min-w-0 relative z-30">
          <CtaTitle s={s} />
          <CtaActions />
          <Disclaimer />
        </div>

        <div className="hidden lg:block flex-none relative z-10 pointer-events-none">
          <CassetteCard />
        </div>
      </div>
    </div>
  )
}

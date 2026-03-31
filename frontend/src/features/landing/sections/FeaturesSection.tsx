"use client"

import { motion } from "framer-motion"
import { B, BENTO_FEATURES, SECTIONS } from "../tokens"
import { Title } from "../ui/Title"
import { ease } from "../motion"

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = typeof SECTIONS[0]
type BentoFeature = typeof BENTO_FEATURES[0]

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_STYLE = {
  background: B.cream,
  border: `2px solid ${B.black}`,
  boxShadow: `6px 6px 0 0 ${B.black}`,
} as const

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <motion.span
      className="font-mono text-[9px] uppercase tracking-[0.32em] mb-4 block relative z-20"
      style={{ color: `${B.black}66` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {label} — Produto
    </motion.span>
  )
}

function FeatureIcon({ icon }: { icon: BentoFeature["icon"] }) {
  return (
    <motion.svg
      className="absolute top-5 left-6 w-6 h-6"
      style={{ color: B.orange }}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      animate={{ rotate: [-2, 2, -2], scale: [1, 1.06, 1] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: ease.inOut }}
    >
      {icon}
    </motion.svg>
  )
}

function FeatureNumber({ n, delay }: { n: BentoFeature["n"]; delay: number }) {
  return (
    <div className="absolute inset-0 flex items-end justify-end p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
      <motion.span
        className="text-[9.5rem] font-serif italic font-black text-black leading-none -mb-6 -mr-3 select-none inline-block"
        animate={{ rotate: [0, -0.8, 0.8, 0], y: [0, -2, 0] }}
        transition={{ duration: 4.4, repeat: Infinity, ease: ease.inOut, delay }}
      >
        {n}
      </motion.span>
    </div>
  )
}

function FeatureContent({ title, desc }: Pick<BentoFeature, "title" | "desc">) {
  return (
    <div className="relative z-10">
      <div
        className="font-mono font-bold text-[11px] uppercase tracking-widest mb-2"
        style={{ color: B.black }}
      >
        {title}
      </div>
      <p
        className="text-xs leading-relaxed max-w-[90%]"
        style={{ color: `${B.black}73` }}
      >
        {desc}
      </p>
    </div>
  )
}

function FeatureTopBorder() {
  return (
    <motion.div
      className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
      style={{ background: B.orange }}
    />
  )
}

function FeatureCard({ feature, index }: { feature: BentoFeature; index: number }) {
  return (
    <motion.div
      key={feature.n}
      className={`${feature.span} relative p-6 group cursor-default overflow-hidden flex flex-col justify-end`}
      style={CARD_STYLE}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: ease.out, delay: 0.3 + index * 0.1 }}
      whileHover={{ x: 2, y: 2, boxShadow: "0px 0px 0 0 rgba(0,0,0,0)" }}
      data-hover
    >
      <FeatureIcon icon={feature.icon} />
      <FeatureNumber n={feature.n} delay={index * 0.18} />
      <FeatureContent title={feature.title} desc={feature.desc} />
      <FeatureTopBorder />
    </motion.div>
  )
}

function FeaturesGrid() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-20 auto-rows-[12rem]"
      style={{ maxWidth: "calc(100% - 60px)" }}
    >
      {BENTO_FEATURES.map((feature, index) => (
        <FeatureCard key={feature.n} feature={feature} index={index} />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FeaturesSection({ s }: { s: Section }) {
  return (
    <div
      className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 pb-28 overflow-hidden"
      data-bg-obstacle
    >
      <SectionLabel label={s.label} />

      <div className="mb-8 relative z-20">
        <Title lines={s.title} italics={s.italic} fg={s.fg} size="clamp(2.1rem,4.4vw,4.8rem)" />
      </div>

      <FeaturesGrid />
    </div>
  )
}
"use client"

import { motion } from "framer-motion"
import { ABOUT_INFO_CARDS, B, SECTIONS, landingTokens } from "../lib/tokens"
import { Title } from "../ui/Title"
import { ease, revealTransition } from "../lib/motion"

// ─── Types ────────────────────────────────────────────────────────────────────

type Section  = (typeof SECTIONS)[number]
type InfoCard = (typeof ABOUT_INFO_CARDS)[number]

const CARD_STYLE = {
  border:     landingTokens.ui.landing.about.infoCardBorder,
  boxShadow:  landingTokens.ui.landing.about.infoCardShadow,
  background: landingTokens.ui.landing.about.infoCardBg,
} as const

// ─── Sub-components ───────────────────────────────────────────────────────────

function CardHeader({ card }: { card: InfoCard }) {
  return (
    <div className="flex justify-between items-start mb-2 relative z-10">
      <span
        className="font-mono text-[9px] tracking-widest"
        style={{ color: B.orange }}
      >
        {card.n}
      </span>
      <motion.span
        className="font-mono text-xs"
        style={{ color: B.cream }}
        whileHover={{ x: 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        {card.title}
        {landingTokens.copy.landing.about.cardTitleSuffix}
      </motion.span>
    </div>
  )
}

function CardBody({ card, index }: { card: InfoCard; index: number }) {
  return (
    <motion.p
      className="text-xs leading-relaxed relative z-10"
      style={{ color: `${B.cream}53` }}
      animate={{ opacity: [0.92, 1, 0.92] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: ease.inOut, delay: index * 0.2 }}
    >
      {card.body}
    </motion.p>
  )
}

function InfoCard({ card, index }: { card: InfoCard; index: number }) {
  return (
    <motion.div
      className="p-5 relative overflow-hidden"
      style={CARD_STYLE}
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...revealTransition, delay: 0.3 + index * 0.12 }}
      whileHover={{ rotate: index % 2 === 0 ? -0.35 : 0.35, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      data-hover
    >
      <CardHeader card={card} />
      <CardBody card={card} index={index} />
    </motion.div>
  )
}

function InfoCardList() {
  return (
    <div className="flex flex-col gap-3">
      {ABOUT_INFO_CARDS.map((card, i) => (
        <InfoCard key={card.n} card={card} index={i} />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AboutSection({ s }: { s: Section }) {
  return (
    <div
      className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 overflow-hidden"
      data-bg-obstacle
    >
      <motion.span
        className="font-mono text-[9px] uppercase tracking-[0.32em] mb-4 block relative z-20"
        style={{ color: `${B.cream}53` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {s.label}
        {landingTokens.copy.landing.plans.sectionJoiner}
        {landingTokens.copy.landing.about.sectionSuffix}
      </motion.span>

      <div className="grid md:grid-cols-2 gap-12 items-center relative z-20">
        <Title lines={s.title} italics={s.italic} fg={s.fg} size="clamp(2.8rem,6.4vw,6.4rem)" />
        <InfoCardList />
      </div>
    </div>
  )
}

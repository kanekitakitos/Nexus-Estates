"use client"

import { motion } from "framer-motion"
import { B, PLANS, SECTIONS } from "../tokens"
import { Title } from "../ui/Title"
import { ease, revealTransition } from "../motion"

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = typeof SECTIONS[0]
type Plan    = typeof PLANS[0]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const textColor = (featured: boolean, opacity: string) =>
  featured ? `${B.cream}${opacity}` : `${B.black}${opacity}`

// ─── Sub-components ───────────────────────────────────────────────────────────

function PopularBadge() {
  return (
    <motion.div
      className="absolute -top-3 left-5 font-mono text-[8px] uppercase tracking-widest px-3 py-1 z-10"
      animate={{ y: [-1, 1, -1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: ease.inOut }}
      style={{ background: B.orange, color: B.cream, border: `1px solid ${B.black}` }}
    >
      Mais Popular
    </motion.div>
  )
}

function PlanHeader({ plan, index }: { plan: Plan; index: number }) {
  return (
    <>
      <div
        className="font-mono text-[9px] tracking-widest uppercase mb-2 mt-1"
        style={{ color: textColor(plan.featured, "54") }}
      >
        {plan.name}
      </div>

      <div className="flex items-baseline gap-1 mb-1">
        <motion.span
          className="font-black text-3xl lg:text-4xl leading-none inline-block"
          style={{
            color: plan.featured ? B.cream : B.black,
            fontFamily: "'Georgia',serif",
            fontStyle: "italic",
          }}
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.48 + index * 0.12, duration: 0.55, ease: ease.out }}
        >
          {plan.price}
        </motion.span>
        <span
          className="font-mono text-[10px] lg:text-xs"
          style={{ color: textColor(plan.featured, "3A") }}
        >
          {plan.period}
        </span>
      </div>

      <p
        className="text-[11px] lg:text-xs mb-4"
        style={{ color: textColor(plan.featured, "43") }}
      >
        {plan.desc}
      </p>
    </>
  )
}

function PlanFeatureList({ plan, index }: { plan: Plan; index: number }) {
  return (
    <ul className="flex-1 space-y-1.5 mb-5">
      {plan.features.map((f, j) => (
        <motion.li
          key={f}
          className="flex items-start gap-2 text-[11px] lg:text-xs leading-tight"
          style={{ color: textColor(plan.featured, "66") }}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.62 + index * 0.12 + j * 0.06, duration: 0.45, ease: ease.out }}
        >
          <span style={{ color: B.orange }} className="mt-0.5 text-[8px] lg:text-[9px]">✦</span>
          {f}
        </motion.li>
      ))}
    </ul>
  )
}

function PlanCTA({ plan }: { plan: Plan }) {
  return (
    <motion.a
      href="/booking"
      className="font-mono text-[9px] uppercase tracking-widest text-center py-2.5 lg:py-3 border transition-all relative"
      style={
        plan.featured
          ? { borderColor: B.orange, color: B.cream, background: B.orange, borderWidth: 2 }
          : { borderColor: B.black, color: B.black, background: "transparent", borderWidth: 2 }
      }
      animate={plan.featured ? { scale: [1, 1.03, 1] } : undefined}
      transition={
        plan.featured
          ? { duration: 1.9, repeat: Infinity, ease: ease.inOut, delay: 0.6 }
          : undefined
      }
      whileHover={{ rotate: plan.featured ? 0 : -0.4 }}
      data-hover
    >
      Escolher {plan.name} →
    </motion.a>
  )
}

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  return (
    <motion.div
      key={plan.name}
      className="relative p-5 flex flex-col group"
      style={{
        background:  plan.featured ? B.black : B.cream,
        border:      `2px solid ${B.black}`,
        boxShadow:   `6px 6px 0 0 ${B.black}`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...revealTransition, delay: 0.35 + index * 0.12 }}
      whileHover={{ x: 2, y: 2, boxShadow: "0px 0px 0 0 rgba(0,0,0,0)" }}
      data-hover
    >
      {plan.featured && <PopularBadge />}
      <PlanHeader plan={plan} index={index} />
      <PlanFeatureList plan={plan} index={index} />
      <PlanCTA plan={plan} />
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PlansSection({ s }: { s: Section }) {
  return (
    <div
      className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-10 pb-8 overflow-hidden"
      data-bg-obstacle
    >
      <motion.span
        className="font-mono text-[9px] uppercase tracking-[0.32em] mb-2 block relative z-20"
        style={{ color: `${B.black}54` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {s.label} — Planos
      </motion.span>

      <div className="mb-4 relative z-20">
        <Title lines={s.title} italics={s.italic} fg={s.fg} size="clamp(1.5rem,3.5vw,3.8rem)" />
      </div>

      <div
        className="grid md:grid-cols-3 gap-4 lg:gap-6 relative z-20"
        style={{ maxWidth: "calc(100% - 60px)" }}
      >
        {PLANS.map((plan, i) => (
          <PlanCard key={plan.name} plan={plan} index={i} />
        ))}
      </div>
    </div>
  )
}
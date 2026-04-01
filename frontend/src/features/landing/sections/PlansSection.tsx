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
      className="absolute -top-3 left-4 font-mono text-[8px] uppercase tracking-widest px-3 py-1 z-10 whitespace-nowrap"
      animate={{ y: [-1, 1, -1] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: ease.inOut }}
      style={{
        background: B.orange,
        color: B.cream,
        border: `1px solid ${B.black}`,
      }}
    >
      Mais Popular
    </motion.div>
  )
}

function PlanHeader({ plan, index }: { plan: Plan; index: number }) {
  return (
    <>
      {/* Plan name + price row */}
      <div className="mb-4">
        <div
          className="font-mono text-[9px] tracking-widest uppercase mb-3"
          style={{ color: textColor(plan.featured, "54") }}
        >
          {plan.name}
        </div>

        <div className="flex items-baseline gap-1.5 mb-1.5">
          <motion.span
            className="font-black leading-none inline-block"
            style={{
              color: plan.featured ? B.cream : B.black,
              fontFamily: "'Georgia',serif",
              fontStyle: "italic",
              fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
            }}
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.48 + index * 0.12, duration: 0.55, ease: ease.out }}
          >
            {plan.price}
          </motion.span>
          <span
            className="font-mono text-[10px]"
            style={{ color: textColor(plan.featured, "3A") }}
          >
            {plan.period}
          </span>
        </div>

        <p
          className="text-[11px] leading-relaxed"
          style={{ color: textColor(plan.featured, "55") }}
        >
          {plan.desc}
        </p>
      </div>

      {/* Divider */}
      <div
        className="w-full h-px mb-4"
        style={{ background: plan.featured ? `${B.cream}18` : `${B.black}14` }}
      />
    </>
  )
}

function PlanFeatureList({ plan, index }: { plan: Plan; index: number }) {
  return (
    <ul className="flex-1 space-y-2 mb-6">
      {plan.features.map((f, j) => (
        <motion.li
          key={f}
          className="flex items-start gap-2.5 text-[11px] leading-snug"
          style={{ color: textColor(plan.featured, "70") }}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.62 + index * 0.12 + j * 0.06, duration: 0.45, ease: ease.out }}
        >
          <span
            className="mt-[3px] shrink-0 text-[7px]"
            style={{ color: B.orange }}
          >
            ✦
          </span>
          <span>{f}</span>
        </motion.li>
      ))}
    </ul>
  )
}

function PlanCTA({ plan }: { plan: Plan }) {
  return (
    <motion.a
      href="/booking"
      className="font-mono text-[9px] uppercase tracking-widest text-center py-3 border-2 transition-all relative block"
      style={
        plan.featured
          ? {
              borderColor: B.orange,
              color: B.cream,
              background: B.orange,
            }
          : {
              borderColor: B.black,
              color: B.black,
              background: "transparent",
            }
      }
      animate={plan.featured ? { scale: [1, 1.025, 1] } : undefined}
      transition={
        plan.featured
          ? { duration: 1.9, repeat: Infinity, ease: ease.inOut, delay: 0.6 }
          : undefined
      }
      whileHover={{
        rotate: plan.featured ? 0 : -0.3,
        background: plan.featured ? B.orange : B.black,
        color: plan.featured ? B.cream : B.cream,
      }}
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
      className="relative p-5 sm:p-6 flex flex-col group"
      style={{
        background: plan.featured
          ? `linear-gradient(145deg, ${B.black} 0%, #1a1a1a 100%)`
          : B.cream,
        border: `2px solid ${B.black}`,
        boxShadow: plan.featured
          ? `6px 6px 0 0 ${B.orange}`
          : `6px 6px 0 0 ${B.black}`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...revealTransition, delay: 0.35 + index * 0.12 }}
      whileHover={{
        x: 2,
        y: 2,
        boxShadow: "0px 0px 0 0 rgba(0,0,0,0)",
      }}
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
      className="relative w-full h-full flex flex-col justify-center px-5 sm:px-8 md:pl-12 md:pr-16 lg:pr-44 pt-10 pb-8 overflow-y-auto overflow-x-hidden"
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

      <div className="mb-5 relative z-20">
        <Title lines={s.title} italics={s.italic} fg={s.fg} size="clamp(1.5rem,3.5vw,3.8rem)" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6 relative z-20 w-full">
        {PLANS.map((plan, i) => (
          <PlanCard key={plan.name} plan={plan} index={i} />
        ))}
      </div>
    </div>
  )
}
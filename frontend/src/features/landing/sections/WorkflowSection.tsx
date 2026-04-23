"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { B, SECTIONS, STEPS } from "../lib/tokens"
import { Title } from "../ui/Title"
import { ease, revealTransition } from "../lib/motion"

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = (typeof SECTIONS)[number]
type Step    = (typeof STEPS)[number]

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_INTERVAL_MS = 2400

// ─── Helpers ──────────────────────────────────────────────────────────────────

const stepCardStyle = (active: boolean) => ({
  border:     active ? `2px solid ${B.orange}` : "2px solid rgba(240,236,217,0.35)",
  boxShadow:  active ? `6px 6px 0 0 rgba(232,86,10,0.25)` : "4px 4px 0 0 rgba(240,236,217,0.16)",
  background: active ? "rgba(13,13,13,0.95)" : "rgba(13,13,13,0.6)",
})

// ─── Sub-components ───────────────────────────────────────────────────────────

function TimelineDot({ index, activeStep }: { index: number; activeStep: number }) {
  const isActive = activeStep === index
  const isPast   = activeStep >= index

  return (
    <div className="relative h-full">
      <motion.div
        className="absolute top-1/2 left-0 w-3 h-3 rounded-full border-2 -translate-y-1/2"
        style={{ borderColor: B.orange }}
        animate={{
          background:  isPast ? B.orange : B.black,
          boxShadow:   isActive ? `0 0 16px ${B.orange}90` : "none",
          scale:       isActive ? [1, 1.15, 1] : 1,
        }}
        transition={{ duration: 0.7, repeat: isActive ? Infinity : 0, ease: ease.inOut }}
      />
    </div>
  )
}

function Timeline({ activeStep }: { activeStep: number }) {
  return (
    <div className="relative h-8 hidden md:block mb-4">
      {/* Track */}
      <div
        className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2"
        style={{ background: `${B.cream}10` }}
      />
      {/* Progress fill */}
      <motion.div
        className="absolute top-1/2 left-0 h-[1px] -translate-y-1/2"
        style={{ background: B.orange }}
        animate={{ width: `${(activeStep + 1) * 25}%` }}
        transition={{ duration: 0.6, ease: ease.out }}
      />
      {/* Dots */}
      <div className="absolute inset-0 grid grid-cols-4 gap-6 pointer-events-none">
        {STEPS.map((_, i) => (
          <TimelineDot key={`dot-${i}`} index={i} activeStep={activeStep} />
        ))}
      </div>
    </div>
  )
}

function StepCardContent({ step, isActive }: { step: Step; isActive: boolean }) {
  return (
    <motion.div
      animate={isActive ? { rotate: [0, -0.35, 0.35, 0], y: [0, -2, 0] } : { rotate: 0, y: 0 }}
      transition={
        isActive
          ? { duration: 1.2, repeat: Infinity, ease: ease.inOut }
          : { duration: 0.25, ease: "easeOut" }
      }
    >
      <motion.div
        className="font-mono text-[9px] tracking-widest mb-2 font-bold"
        animate={{ color: isActive ? B.orange : `${B.orange}55` }}
      >
        {step.n}
      </motion.div>
      <motion.h3
        className="font-mono font-bold text-xs uppercase tracking-widest mb-2"
        animate={{ color: isActive ? B.cream : `${B.cream}54` }}
      >
        {step.title}
      </motion.h3>
      <motion.p
        className="text-xs leading-relaxed"
        animate={{ color: isActive ? `${B.cream}7C` : `${B.cream}30` }}
      >
        {step.desc}
      </motion.p>
    </motion.div>
  )
}

function StepCard({
  step,
  index,
  activeStep,
  onHover,
}: {
  step: Step
  index: number
  activeStep: number
  onHover: (i: number) => void
}) {
  const isActive = activeStep === index

  return (
    <motion.div
      key={step.n}
      className="relative cursor-default p-5 flex flex-col justify-start"
      style={stepCardStyle(isActive)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...revealTransition, delay: 0.35 + index * 0.1 }}
      onMouseEnter={() => onHover(index)}
      data-hover
    >
      <StepCardContent step={step} isActive={isActive} />
    </motion.div>
  )
}

function StepsGrid({
  activeStep,
  onHover,
}: {
  activeStep: number
  onHover: (i: number) => void
}) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {STEPS.map((step, i) => (
        <StepCard
          key={step.n}
          step={step}
          index={i}
          activeStep={activeStep}
          onHover={onHover}
        />
      ))}
    </div>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useAutoStep() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const t = setInterval(
      () => setActiveStep((i) => (i + 1) % STEPS.length),
      STEP_INTERVAL_MS,
    )
    return () => clearInterval(t)
  }, [])

  return { activeStep, setActiveStep }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WorkflowSection({ s }: { s: Section }) {
  const { activeStep, setActiveStep } = useAutoStep()

  return (
    <div
      className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 overflow-hidden"
      data-bg-obstacle
    >
      <motion.span
        className="font-mono text-[9px] uppercase tracking-[0.32em] mb-4 block relative z-20"
        style={{ color: `${B.cream}54` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {s.label} — Fluxo
      </motion.span>

      <div className="mb-10 relative z-20">
        <Title lines={s.title} italics={s.italic} fg={s.fg} size="clamp(2.1rem,4.4vw,4.8rem)" />
      </div>

      <div className="relative z-20">
        <Timeline activeStep={activeStep} />
        <StepsGrid activeStep={activeStep} onHover={setActiveStep} />
      </div>
    </div>
  )
}

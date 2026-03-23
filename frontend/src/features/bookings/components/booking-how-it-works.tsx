"use client"

/**
 * BookingHowItWorks — v2
 *
 * Objectivo
 * - Card “editorial” que explica rapidamente o fluxo de reserva dentro do grid.
 *
 * Onde é usado
 * - Injectado em `BookingList` (posição fixa) para quebrar monotonia e guiar o utilizador.
 *
 * Notas de UX/Animação
 * - Textura diagonal é CSS (barata) — evita blur pesado.
 * - Scanner line é motion (loop) para sensação “dashboard vivo”.
 * - Steps entram com stagger e têm hover subtil; respeita reduced motion.
 */

import { cn } from "@/lib/utils"
import { BrutalCard } from "@/components/ui/data-display/card"
import { Button } from "@/components/ui/forms/button"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Search, CalendarCheck, Smile } from "lucide-react"
import { scannerLine, staggerContainer, staggerItem, springSnap, springBounce } from "@/features/bookings/motion"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface BookingHowItWorksProps {
  mode?: "default" | "card"
  className?: string
  onExplore?: () => void
}

// ─────────────────────────────────────────────
// Step data
// ─────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    label: "Explora",
    description: "Pesquisa por destino, datas e orçamento",
    icon: Search,
  },
  {
    number: "02",
    label: "Reserva",
    description: "Confirma os detalhes e paga em segurança",
    icon: CalendarCheck,
  },
  {
    number: "03",
    label: "Desfruta",
    description: "Chega e relaxa — tratamos do resto",
    icon: Smile,
  },
] as const

// ─────────────────────────────────────────────
// BookingHowItWorks
// ─────────────────────────────────────────────

export function BookingHowItWorks({
  mode = "default",
  className,
  onExplore,
}: BookingHowItWorksProps) {
  const shouldReduceMotion = useReducedMotion()
  const compact = mode === "card"

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -5, rotate: -0.2, transition: springSnap }}
      whileTap={shouldReduceMotion ? undefined : { scaleX: 0.985, scaleY: 0.972, transition: springSnap }}
      className={cn("h-full w-full", className)}
    >
      <BrutalCard
        variant="primary"
        className="group relative h-full w-full overflow-hidden flex flex-col justify-between"
      >
        {/* ── Diagonal texture overlay */}
        <DiagonalTexture />

        {/* ── Animated scanner line */}
        {!shouldReduceMotion && <ScannerLine />}

        {/* ── Content */}
        <div className="relative z-10 flex flex-col h-full gap-4 p-1">
          <Header compact={compact} />
          <Steps compact={compact} />
          {!compact && <Cta onExplore={onExplore} />}
        </div>
      </BrutalCard>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// DiagonalTexture — CSS-only, no blur
// ─────────────────────────────────────────────

function DiagonalTexture() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.06]"
      style={{
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          currentColor 0px,
          currentColor 1px,
          transparent 1px,
          transparent 10px
        )`,
      }}
    />
  )
}

// ─────────────────────────────────────────────
// ScannerLine — horizontal line that sweeps top→bottom
// ─────────────────────────────────────────────

function ScannerLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px bg-primary-foreground/20 pointer-events-none z-10"
      initial={scannerLine.initial}
      animate={scannerLine.animate}
      transition={scannerLine.transition}
    />
  )
}

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────

function Header({ compact }: { compact: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        {/* Guide label */}
        <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-primary-foreground/30 bg-primary-foreground/10 px-2.5 py-0.5 mb-2">
          <span className="font-mono text-[9px] font-black uppercase tracking-widest text-primary-foreground/80">
            Guia
          </span>
        </div>

        {/* Title — two-weight treatment */}
        <h3
          className={cn(
            "font-mono uppercase leading-[0.88] tracking-tight",
            compact ? "text-xl" : "text-3xl"
          )}
        >
          <span className="font-normal text-primary-foreground/70">Como</span>
          <br />
          <span className="font-black text-primary-foreground drop-shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
            Funciona
          </span>
        </h3>
      </div>

      {/* Decorative large number */}
      <div
        className={cn(
          "font-black font-mono text-primary-foreground/10 leading-none select-none pointer-events-none",
          compact ? "text-[64px]" : "text-[80px]"
        )}
        aria-hidden
      >
        ?
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Steps
// ─────────────────────────────────────────────

function Steps({ compact }: { compact: boolean }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="flex flex-col gap-2 flex-1"
    >
      {STEPS.map(({ number, label, description, icon: Icon }) => (
        <motion.div
          key={number}
          variants={staggerItem}
          whileHover={
            shouldReduceMotion
              ? undefined
              : { x: 5, transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] } }
          }
          className="flex items-center gap-3 rounded-lg border-2 border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2 cursor-default"
        >
          {/* Step number badge */}
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary-foreground/40 bg-primary-foreground/20">
            <span className="font-mono text-[10px] font-black text-primary-foreground leading-none">
              {number}
            </span>
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <div className={cn(
              "font-mono font-black uppercase text-primary-foreground leading-none",
              compact ? "text-xs" : "text-sm"
            )}>
              {label}
            </div>
            {!compact && (
              <div className="font-mono text-[10px] text-primary-foreground/60 mt-0.5 leading-snug">
                {description}
              </div>
            )}
          </div>

          {/* Icon */}
          <Icon
            className={cn(
              "shrink-0 text-primary-foreground/40",
              compact ? "h-3.5 w-3.5" : "h-4 w-4"
            )}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Cta — only in default mode
// ─────────────────────────────────────────────

function Cta({ onExplore }: { onExplore?: () => void }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { scale: 1.03, rotate: -0.3 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
      transition={springBounce}
    >
      <Button
        variant="brutal"
        onClick={onExplore}
        className="w-full h-10 font-black uppercase text-sm shadow-[3px_3px_0_0_rgb(0,0,0)] bg-primary-foreground text-primary hover:bg-primary-foreground/90"
      >
        Explorar
        <ArrowRight className="h-4 w-4 ml-1.5" />
      </Button>
    </motion.div>
  )
}

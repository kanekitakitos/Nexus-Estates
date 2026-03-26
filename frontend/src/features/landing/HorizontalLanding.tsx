"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { MorphingText } from "@/components/ui/morphing-text"
import { Dock, DockIcon } from "@/components/ui/dock"
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import Link from "next/link"

/* ─────────────────────────────────────────────
   BRAND TOKENS — Nexus Estates
   Cream bg · Black text · Orange accent
───────────────────────────────────────────── */
const BRAND = {
  cream: "#F0ECD9",
  black: "#0D0D0D",
  orange: "#E8560A",
  muted: "#8C7B6B",
  border: "rgba(13,13,13,0.12)",
}

/* ─────────────────────────────────────────────
   Brutalist helpers (internos e reutilizáveis)
 ───────────────────────────────────────────── */

function SectionKicker({ label, fg }: { label: string; fg: string }) {
  return (
    <span
      className="font-mono text-[9px] uppercase tracking-[0.32em] mb-3 inline-block"
      style={{ color: `${fg}55` }}
    >
      {label}
    </span>
  )
}

function BrutalCTA({
  href,
  children,
  variant = "primary",
  onClick,
}: {
  href: string
  children: React.ReactNode
  variant?: "primary" | "outline"
  onClick?: () => void
}) {
  const base = "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-opacity"
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90"
      : "border hover:bg-muted"
  return (
    <Link href={href} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </Link>
  )
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const SECTIONS = [
  {
    id: "hero",
    label: "00",
    title: ["Gestão de", "Alojamento", "Local"],
    italic: [false, true, false],
    sub: "Automatize. Sincronize. Liberte-se da burocracia.",
    bg: BRAND.cream,
    fg: BRAND.black,
  },
  {
    id: "about",
    label: "01",
    title: ["Quem", "Somos"],
    italic: [false, true],
    sub: "Tecnologia que liberta o anfitrião para focar no que importa.",
    bg: BRAND.black,
    fg: BRAND.cream,
  },
  {
    id: "features",
    label: "02",
    title: ["O Que", "Oferecemos"],
    italic: [false, true],
    sub: "Inventário, motor de reservas, sincronização e burocracia automática.",
    bg: BRAND.cream,
    fg: BRAND.black,
  },
  {
    id: "workflow",
    label: "03",
    title: ["Como", "Funciona"],
    italic: [false, true],
    sub: "Do login às faturas — tudo sincronizado num só lugar.",
    bg: BRAND.black,
    fg: BRAND.cream,
  },
  {
    id: "plans",
    label: "04",
    title: ["Escolhe", "o Teu Plano"],
    italic: [false, true],
    sub: "Starter, Pro e Enterprise — crescemos contigo.",
    bg: BRAND.cream,
    fg: BRAND.black,
  },
  {
    id: "cta",
    label: "05",
    title: ["Pronto", "Para", "Começar?"],
    italic: [false, false, true],
    sub: "Clientes poupam 5–10 horas por semana em burocracia.",
    bg: BRAND.orange,
    fg: BRAND.cream,
  },
]

const MARQUEE_ITEMS = [
  "Inventário Inteligente",
  "Canal Synchronization",
  "Burocracia Automática",
  "Motor de Reservas",
  "Preços Dinâmicos",
  "SEF Ready",
  "Airbnb & Booking",
  "Faturas Instantâneas",
]

const MORPHING_SUBTITLES = [
  "Automatize.",
  "Sincronize.",
  "Liberte-se.",
  "Simplifique.",
  "Centralize.",
  "Lucre mais.",
]

const PLANS = [
  {
    name: "Starter",
    price: "€29",
    period: "/mês",
    desc: "Perfeito para começar",
    features: ["1 propriedade", "Motor de reservas", "Sync básico", "Suporte por email"],
    featured: false,
  },
  {
    name: "Pro",
    price: "€79",
    period: "/mês",
    desc: "O mais popular",
    features: ["Até 10 propriedades", "Tudo do Starter", "Preços dinâmicos", "SEF automático", "Suporte prioritário"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "Para grandes portfólios",
    features: ["Propriedades ilimitadas", "Tudo do Pro", "API dedicada", "Onboarding custom", "Account manager"],
    featured: false,
  },
]

/* ─────────────────────────────────────────────
   GRAIN OVERLAY
───────────────────────────────────────────── */
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.04]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "180px 180px",
        mixBlendMode: "multiply",
      }}
    />
  )
}

/* ─────────────────────────────────────────────
   MARQUEE
───────────────────────────────────────────── */
function Marquee({ fg = BRAND.black }: { fg?: string }) {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="relative overflow-hidden w-full py-3 border-t" style={{ borderColor: `${fg}18` }}>
      <div className="flex gap-8 whitespace-nowrap marquee">
        {items.map((item, i) => (
          <span
            key={i}
            className="text-[10px] font-mono uppercase tracking-[0.28em] shrink-0"
            style={{ color: `${fg}35` }}
          >
            {item} <span className="mx-2" style={{ color: `${fg}18` }}>✦</span>
          </span>
        ))}
      </div>
      <style>{`
        .marquee {
          animation: marquee 28s linear infinite;
          will-change: transform;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────
   COUNTER
───────────────────────────────────────────── */
/* (removed CountUp) */

/* ─────────────────────────────────────────────
   DOCK NAV — macOS-style magnification bar
───────────────────────────────────────────── */
function DockNav({
  active,
  goTo,
  fg,
}: {
  active: number
  goTo: (i: number) => void
  fg: string
}) {
  const navItems = [
    { label: "00", title: "Home", index: 0 },
    { label: "01", title: "Sobre", index: 1 },
    { label: "02", title: "Produto", index: 2 },
    { label: "03", title: "Fluxo", index: 3 },
    { label: "04", title: "Planos", index: 4 },
    { label: "05", title: "Start", index: 5 },
  ]

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Logo */}
      <button
        onClick={() => goTo(0)}
        className="flex items-center gap-2 group"
      >
        <motion.span
          className="w-7 h-7 flex items-center justify-center text-[11px] font-black rounded-sm"
          style={{ background: BRAND.orange, color: BRAND.cream }}
          whileHover={{ scale: 1.1, rotate: -4 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          N
        </motion.span>
        <span
          className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase hidden sm:block"
          style={{ color: fg }}
        >
          Nexus Estates
        </span>
      </button>

      {/* Dock section nav — the 'goma' interactive center */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Dock
          iconSize={34}
          iconMagnification={48}
          iconDistance={120}
          className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-full px-5 py-2.5 gap-3 mt-0 h-auto ring-1 ring-black/5"
        >
          {navItems.slice(1).map((item) => (
            <DockIcon
              key={item.index}
              onClick={() => goTo(item.index)}
              className={cn(
                "transition-all duration-300 rounded-full",
                active === item.index
                  ? "bg-orange-600/10 shadow-[0_0_20px_-3px_rgba(234,88,12,0.4)]"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              )}
            >
              <span
                className="font-mono text-[11px] font-black tracking-widest"
                style={{ color: active === item.index ? BRAND.orange : `${fg}45` }}
              >
                {item.label}
              </span>
            </DockIcon>
          ))}
        </Dock>
      </div>

      {/* Right CTA */}
      <div className="flex gap-3 items-center">
        <Link
          href="/login"
          className="font-mono text-[10px] uppercase tracking-widest transition-colors hidden md:block"
          style={{ color: `${fg}45` }}
        >
          Login
        </Link>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Link
            href="/booking"
            className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 transition-all"
            style={{ background: BRAND.orange, color: BRAND.cream }}
          >
            Começar →
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   SIDE PROGRESS
───────────────────────────────────────────── */
function SideProgress({ active, fg }: { active: number; fg: string }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-4">
      {SECTIONS.map((s, i) => (
        <motion.div
          key={s.id}
          className="flex items-center gap-2"
          animate={{ opacity: i === active ? 1 : 0.2 }}
        >
          <motion.div
            className="h-[1px]"
            style={{ background: fg }}
            animate={{ width: i === active ? 18 : 5 }}
            transition={{ duration: 0.3 }}
          />
          {i === active && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-mono text-[8px] uppercase tracking-[0.3em] whitespace-nowrap"
              style={{ color: `${fg}40` }}
            >
              {s.label}
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   VERTICAL BAND
───────────────────────────────────────────── */
function VerticalBand({ fg }: { fg: string }) {
  return (
    <div
      className="absolute left-0 top-0 bottom-0 w-9 flex items-center justify-center overflow-hidden border-r"
      style={{ borderColor: `${fg}08` }}
    >
      <motion.div
        className="flex flex-col gap-8"
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 24, ease: "linear", repeat: Infinity }}
      >
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="font-mono text-[7px] uppercase tracking-[0.5em] -rotate-90 whitespace-nowrap"
            style={{ color: `${fg}12` }}
          >
            Nexus
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   EDITORIAL TITLE — serif, italic alternates
───────────────────────────────────────────── */
function EditorialTitle({
  lines,
  italics,
  fg,
  accent,
  size = "clamp(4rem, 10vw, 9rem)",
}: {
  lines: string[]
  italics: boolean[]
  fg: string
  accent: string
  size?: string
}) {
  return (
    <div className="overflow-hidden">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ y: "108%" }}
          animate={{ y: "0%" }}
          transition={{ delay: 0.3 + i * 0.12, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1
            className="leading-[0.88] uppercase font-black"
            style={{
              fontSize: size,
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontStyle: italics[i] ? "italic" : "normal",
              color: italics[i] ? accent : fg,
              letterSpacing: "-0.01em",
            }}
          >
            {line}
          </h1>
        </motion.div>
      ))}
    </div>
  )
}

/* (removed circular CTA) */

/* ─────────────────────────────────────────────
   HERO SECTION
───────────────────────────────────────────── */
function HeroSection({ s }: { s: (typeof SECTIONS)[0] }) {
  return (
    <div className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-40 pt-16 overflow-hidden">
      {/* Ghost BG text */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 font-black leading-none pointer-events-none select-none"
        style={{
          fontSize: "22vw",
          color: "transparent",
          WebkitTextStroke: `1px ${BRAND.black}06`,
          fontFamily: "'Georgia', serif",
          fontStyle: "italic",
        }}
      >
        AL
      </div>

      {/* Tag + Badge */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 mb-6"
      >
        <span className="w-7 h-[1px]" style={{ background: `${BRAND.black}28` }} />
        <span className="font-mono text-[9px] uppercase tracking-[0.32em]" style={{ color: `${BRAND.black}65` }}>
          Property Management System
        </span>
      </motion.div>

      {/* Main title */}
      <EditorialTitle
        lines={s.title}
        italics={s.italic}
        fg={s.fg}
        accent={BRAND.orange}
        size="clamp(3.6rem, 8vw, 7.6rem)"
      />

      {/* MorphingText subtitle — gummy liquid morph effect */}
      <motion.div
        className="mt-6 mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        style={{
          fontSize: "clamp(1.3rem, 2.4vw, 2.1rem)",
          fontFamily: "'Georgia', serif",
          fontStyle: "italic",
          color: BRAND.orange,
        }}
      >
        <MorphingText
          texts={MORPHING_SUBTITLES}
          className="text-left h-8 md:h-10"
        />
      </motion.div>

      {/* Sub + CTA row */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.55 }}
      >
        <motion.span
          className="ml-auto font-mono text-[20px] uppercase tracking-widest"
          style={{ color: `${BRAND.black}60` }}
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          Faz scroll {">>"}
        </motion.span>
      </motion.div>

      {/* Stats */}
      {/* removed stats panel */}
    </div>
  )
}

/* ─────────────────────────────────────────────
   ABOUT SECTION (dark)
───────────────────────────────────────────── */
function AboutSection({ s }: { s: (typeof SECTIONS)[0] }) {
  return (
    <div className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 overflow-hidden">
      <SectionKicker label={`${s.label} — Sobre`} fg={BRAND.cream} />

      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Title */}
        <EditorialTitle
          lines={s.title}
          italics={s.italic}
          fg={s.fg}
          accent={BRAND.orange}
          size="clamp(2.8rem, 6.4vw, 6.4rem)"
        />

        {/* Cards */}
        <div className="flex flex-col gap-3">
          {[
            { title: "Missão", body: "Reduzir a fricção operacional no AL. Centralizamos tudo para o anfitrião focar no que importa.", n: "01" },
            { title: "Tecnologia", body: "Stack moderna, sync em tempo real, API robusta. Construído para anfitriões exigentes.", n: "02" },
            { title: "Suporte", body: "Equipa dedicada que entende o mercado português. Sempre ao teu lado.", n: "03" },
          ].map((card, i) => (
            <motion.div
              key={card.n}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="border p-4 group cursor-default transition-all duration-300 hover:border-orange-600/40"
              style={{ borderColor: `${BRAND.cream}12` }}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-[9px] tracking-widest" style={{ color: BRAND.orange }}>{card.n}</span>
                <span className="font-mono text-xs group-hover:translate-x-1 transition-transform" style={{ color: BRAND.cream }}>{card.title} →</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: `${BRAND.cream}40` }}>{card.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   FEATURES SECTION — BentoGrid (light)
───────────────────────────────────────────── */
const FeatureIcon1 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
)
const FeatureIcon2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
)
const FeatureIcon3 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
)
const FeatureIcon4 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
)

function FeaturesSection({ s }: { s: (typeof SECTIONS)[0] }) {
  const bentoFeatures = [
    {
      Icon: FeatureIcon1,
      name: "Inventário & Preços",
      description: "Regras, épocas, restrições e preços dinâmicos — sempre sincronizados.",
      href: "/booking",
      cta: "Explorar",
      background: (
        <div className="absolute inset-0 flex items-end justify-end p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
          <span className="text-[9.5rem] font-serif italic font-black text-black leading-none -mb-6 -mr-3 select-none">01</span>
        </div>
      ),
      className: "col-span-3 md:col-span-1",
    },
    {
      Icon: FeatureIcon2,
      name: "Motor de Reservas",
      description: "Zero double bookings. Calendário em tempo real com confirmação automática.",
      href: "/booking",
      cta: "Explorar",
      background: (
        <div className="absolute inset-0 flex items-end justify-end p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
          <span className="text-[9.5rem] font-serif italic font-black text-black leading-none -mb-6 -mr-3 select-none">02</span>
        </div>
      ),
      className: "col-span-3 md:col-span-2",
    },
    {
      Icon: FeatureIcon3,
      name: "Sincronização OTA",
      description: "Airbnb, Booking e todas as OTAs num só painel centralizado.",
      href: "/booking",
      cta: "Explorar",
      background: (
        <div className="absolute inset-0 flex items-end justify-end p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
          <span className="text-[9.5rem] font-serif italic font-black text-black leading-none -mb-6 -mr-3 select-none">03</span>
        </div>
      ),
      className: "col-span-3 md:col-span-2",
    },
    {
      Icon: FeatureIcon4,
      name: "Burocracia SEF",
      description: "Registos SEF e faturação automática. Conformidade sem esforço.",
      href: "/booking",
      cta: "Explorar",
      background: (
        <div className="absolute inset-0 flex items-end justify-end p-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
          <span className="text-[9.5rem] font-serif italic font-black text-black leading-none -mb-6 -mr-3 select-none">04</span>
        </div>
      ),
      className: "col-span-3 md:col-span-1",
    },
  ]

  return (
    <div className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 pb-12 overflow-hidden">
      <SectionKicker label={`${s.label} — Produto`} fg={BRAND.black} />

      <div className="mb-6">
        <EditorialTitle
          lines={s.title}
          italics={s.italic}
          fg={s.fg}
          accent={BRAND.orange}
          size="clamp(2.1rem, 4.4vw, 4.8rem)"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <BentoGrid className="auto-rows-[12rem] gap-4" style={{ maxWidth: "calc(100% - 200px)" }}>
          {bentoFeatures.map((f) => (
            <BentoCard 
              key={f.name} 
              {...f} 
              className={cn(f.className, "border-0 shadow-none bg-black/5 hover:bg-orange-600/5 transition-all duration-500")} 
            />
          ))}
        </BentoGrid>
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   WORKFLOW SECTION (dark)
───────────────────────────────────────────── */
function WorkflowSection({ s }: { s: (typeof SECTIONS)[0] }) {
  const steps = [
    { n: "01", title: "Login & Setup", desc: "Cria conta, adiciona propriedades e conecta as tuas OTAs em minutos." },
    { n: "02", title: "Sincroniza Tudo", desc: "Calendários, preços e disponibilidade propagam para todos os canais automaticamente." },
    { n: "03", title: "Recebe Reservas", desc: "O motor confirma, bloqueia e notifica. Zero intervenção manual necessária." },
    { n: "04", title: "Faturação Auto", desc: "Faturas e registos SEF gerados e enviados assim que a reserva é confirmada." },
  ]
  return (
    <div className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 overflow-hidden">
      <SectionKicker label={`${s.label} — Fluxo`} fg={BRAND.cream} />

      <div className="mb-10">
        <EditorialTitle
          lines={s.title}
          italics={s.italic}
          fg={s.fg}
          accent={BRAND.orange}
          size="clamp(2.1rem, 4.4vw, 4.8rem)"
        />
      </div>

      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-[1px] hidden md:block" style={{ background: `${BRAND.cream}12` }} />
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.1 }}
              className="relative pt-10"
            >
              <div
                className="absolute top-[18px] left-0 hidden md:block w-2 h-2 rounded-full"
                style={{ background: BRAND.orange, boxShadow: `0 0 10px ${BRAND.orange}80` }}
              />
              <div className="font-mono text-[9px] tracking-widest mb-3 font-bold" style={{ color: BRAND.orange }}>{step.n}</div>
              <h3 className="font-mono font-bold text-xs uppercase tracking-widest mb-2" style={{ color: BRAND.cream }}>{step.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: `${BRAND.cream}40` }}>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PLANS SECTION (light)
───────────────────────────────────────────── */
function PlansSection({ s }: { s: (typeof SECTIONS)[0] }) {
  return (
    <div className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 overflow-hidden">
      <SectionKicker label={`${s.label} — Planos`} fg={BRAND.black} />

      <div className="mb-8">
        <EditorialTitle
          lines={s.title}
          italics={s.italic}
          fg={s.fg}
          accent={BRAND.orange}
          size="clamp(1.8rem, 4vw, 4.4rem)"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-0 border" style={{ borderColor: `${BRAND.black}14` }}>
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.1 }}
            className="relative p-6 flex flex-col border-r group"
            style={{
              borderColor: `${BRAND.black}10`,
              background: plan.featured ? BRAND.black : "transparent",
            }}
          >
            {plan.featured && (
              <div
                className="absolute -top-3 left-5 font-mono text-[8px] uppercase tracking-widest px-3 py-1"
                style={{ background: BRAND.orange, color: BRAND.cream }}
              >
                Mais Popular
              </div>
            )}
            <div className="font-mono text-[9px] tracking-widest uppercase mb-3" style={{ color: plan.featured ? `${BRAND.cream}45` : `${BRAND.black}38` }}>
              {plan.name}
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span
                className="font-black text-4xl leading-none"
                style={{ color: plan.featured ? BRAND.cream : BRAND.black, fontFamily: "'Georgia', serif", fontStyle: "italic" }}
              >
                {plan.price}
              </span>
              <span className="font-mono text-xs" style={{ color: plan.featured ? `${BRAND.cream}30` : `${BRAND.black}30` }}>{plan.period}</span>
            </div>
            <p className="text-xs mb-5" style={{ color: plan.featured ? `${BRAND.cream}38` : `${BRAND.black}38` }}>{plan.desc}</p>
            <ul className="flex-1 space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs" style={{ color: plan.featured ? `${BRAND.cream}55` : `${BRAND.black}55` }}>
                  <span style={{ color: BRAND.orange }} className="mt-0.5 text-[9px]">✦</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/booking"
              className="font-mono text-[9px] uppercase tracking-widest text-center py-3 border transition-all hover:opacity-75"
              style={
                plan.featured
                  ? { borderColor: BRAND.orange, color: BRAND.cream, background: BRAND.orange }
                  : { borderColor: `${BRAND.black}18`, color: `${BRAND.black}65` }
              }
            >
              Escolher {plan.name} →
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   CTA SECTION (orange bg)
───────────────────────────────────────────── */
function CtaSection({ s }: { s: (typeof SECTIONS)[0] }) {
  return (
    <div className="relative w-full h-full flex flex-col justify-center pl-12 pr-10 md:pr-44 pt-16 overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.3) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <SectionKicker label={`${s.label} — Start`} fg={BRAND.cream} />

      {/* MorphingText for CTA headline variation */}
      <div className="relative z-10 overflow-hidden mb-4">
        {s.title.map((line, i) => (
          <motion.div
            key={i}
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            transition={{ delay: 0.18 + i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              className="leading-[0.88] uppercase font-black"
              style={{
                fontSize: "clamp(3.2rem, 8.8vw, 8rem)",
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontStyle: s.italic[i] ? "italic" : "normal",
                color: s.italic[i] ? BRAND.black : BRAND.cream,
                letterSpacing: "-0.01em",
              }}
            >
              {line}
            </h1>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
      >
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <BrutalCTA href="/booking">Criar Conta Grátis →</BrutalCTA>
        </motion.div>
        {/* removed circular CTA */}
      </motion.div>

      <motion.p
        className="mt-6 font-mono text-[9px] uppercase tracking-widest relative z-10"
        style={{ color: `${BRAND.cream}45` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Sem cartão de crédito · Cancela quando quiseres · Suporte em PT
      </motion.p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SECTION RENDERER
───────────────────────────────────────────── */
function SectionContent({ s }: { s: (typeof SECTIONS)[0] }) {
  switch (s.id) {
    case "hero": return <HeroSection s={s} />
    case "about": return <AboutSection s={s} />
    case "features": return <FeaturesSection s={s} />
    case "workflow": return <WorkflowSection s={s} />
    case "plans": return <PlansSection s={s} />
    case "cta": return <CtaSection s={s} />
    default: return null
  }
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export function HorizontalLanding() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const onScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    if (idx !== active) setActive(Math.max(0, Math.min(idx, SECTIONS.length - 1)))
  }, [active])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [onScroll])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      el.scrollLeft += e.deltaY
      e.preventDefault()
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const goTo = (i: number) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" })
  }

  const currentSection = SECTIONS[active]
  const currentFg = currentSection?.fg ?? BRAND.black
  const currentBg = currentSection?.bg ?? BRAND.cream

  return (
    <div
      className="relative isolate h-screen w-screen overflow-hidden transition-colors duration-700"
      style={{ background: currentBg, color: currentFg }}
    >
      <GrainOverlay />

      {/* Top scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 h-[2px] z-50"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: active / (SECTIONS.length - 1) }}
        transition={{ ease: "easeOut", duration: 0.7 }}
        style={{ transformOrigin: "left", background: BRAND.orange, width: "100%" }}
      />

      {/* Dock Nav */}
      <DockNav active={active} goTo={goTo} fg={currentFg} />

      {/* Side progress */}
      <SideProgress active={active} fg={currentFg} />

      {/* ── Horizontal scroller ── */}
      <div
        ref={scrollerRef}
        className={cn(
          "flex h-full w-full overflow-x-auto overflow-y-hidden",
          "overscroll-x-contain snap-x snap-mandatory"
        )}
        style={{ scrollbarWidth: "none" }}
      >
        {SECTIONS.map((s, index) => (
          <motion.section
            key={s.id}
            id={s.id}
            className="relative isolate flex h-full w-screen flex-none snap-center overflow-hidden transition-colors duration-700"
            style={{ background: s.bg }}
            animate={{
              filter: active === index ? "blur(0px)" : "blur(2px)",
              opacity: active === index ? 1 : 0.5,
            }}
            transition={{ duration: 0.4 }}
          >
            {/* Dot grid bg */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundImage: `radial-gradient(circle, ${s.fg}07 1px, transparent 1px)`,
                backgroundSize: "22px 22px",
              }}
            />

            {/* Left vertical band */}
            <div className="relative z-10">
              <VerticalBand fg={s.fg} />
            </div>

            {/* Content */}
            <div className="relative z-20 flex-1 pl-9">
              <AnimatePresence mode="wait">
                {active === index && (
                  <motion.div
                    key={`content-${s.id}`}
                    className="w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.32 }}
                  >
                    <SectionContent s={s} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ghost section number */}
            <div
              className="absolute bottom-8 right-12 z-10 font-black leading-none pointer-events-none select-none"
              style={{
                fontSize: "6.5rem",
                color: "transparent",
                WebkitTextStroke: `1px ${s.fg}07`,
                fontFamily: "'Georgia', serif",
                fontStyle: "italic",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </div>
          </motion.section>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 flex flex-col pointer-events-none">
        <Marquee fg={currentFg} />
      </div>

      {/* bottom-right callout removed */}

      {/* Styles */}
      <style>{`
        html, body { overflow: hidden; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

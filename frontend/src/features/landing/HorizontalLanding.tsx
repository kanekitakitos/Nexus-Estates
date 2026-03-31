"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { B, SECTIONS } from "./tokens"
import { BrutalGridBackground } from "@/components/ui/layout/brutal-grid-background"
import ClickSpark from "@/components/ClickSpark"
import { Ticker } from "./ui/Ticker"
import { VBand } from "./ui/VBand"
import { SideProgress } from "./ui/SideProgress"
import { Nav } from "./ui/Nav"
import { HeroSection } from "./sections/HeroSection"
import { AboutSection } from "./sections/AboutSection"
import { FeaturesSection } from "./sections/FeaturesSection"
import { WorkflowSection } from "./sections/WorkflowSection"
import { PlansSection } from "./sections/PlansSection"
import { CtaSection } from "./sections/CtaSection"
import { FloatingObjects } from "./ui/FloatingObjects"
import { contentFadeTransition, ghostActiveTransition, ghostIdleTransition, sectionTransition } from "./motion"
import { NoiseOverlay } from "@/components/NoiseOverlay"

/* ─────────────────────────────────────────────
   SECTION RENDERER
───────────────────────────────────────────── */
function SectionContent({ s }: { s: typeof SECTIONS[0] }) {
  switch (s.id) {
    case "hero":     return <HeroSection s={s} />
    case "about":    return <AboutSection s={s} />
    case "features": return <FeaturesSection s={s} />
    case "workflow": return <WorkflowSection s={s} />
    case "plans":    return <PlansSection s={s} />
    case "cta":      return <CtaSection s={s} />
    default:         return null
  }
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export function HorizontalLanding() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const activeRef   = useRef(0)
  const [active, setActive] = useState(0)

  // ── Sync active index from scroll position ────────────────────────────────
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const onScroll = () => {
      const idx = clamp(Math.round(el.scrollLeft / el.clientWidth), 0, SECTIONS.length - 1)
      if (idx !== activeRef.current) {
        activeRef.current = idx
        setActive(idx)
      }
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  // ── Convert vertical wheel → horizontal scroll ────────────────────────────
  // Only redirects deltaY when deltaX is near zero (standard mouse wheel).
  // Trackpads that already emit deltaX are left alone so native snap works.
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return
      // Trackpad already scrolling horizontally — don't interfere
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }

    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(activeRef.current + 1)
      if (e.key === "ArrowLeft")  goTo(activeRef.current - 1)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const goTo = (i: number) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: clamp(i, 0, SECTIONS.length - 1) * el.clientWidth, behavior: "smooth" })
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const fg = SECTIONS[active]?.fg ?? B.black
  const bg = SECTIONS[active]?.bg ?? B.cream

  return (
    <ClickSpark sparkColor={B.orange} extraScale={1.2}>
      <div
        className="relative isolate h-screen w-screen overflow-hidden transition-colors duration-700"
        style={{
          background: bg,
          color: fg,
          ["--color-brutal-grid" as never]:
            bg === B.black || bg === B.orange
              ? "rgba(240,236,217,0.16)"
              : "rgba(13,13,13,0.12)",
          ["--primary" as never]: B.orange,
        }}
      >
        <BrutalGridBackground defaultVariant="none" />
        <FloatingObjects />
        <NoiseOverlay pattern="scanlines" opacity={0.12} />

        <Nav active={active} goTo={goTo} fg={fg} />
        <SideProgress active={active} fg={fg} />

        {/* Keyboard hint */}
        <motion.div
          className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: active === 0 ? 0.4 : 0 }}
          transition={{ delay: 2 }}
        >
          <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: fg }}>
            usa as teclas ← →
          </span>
        </motion.div>

        {/* ── Horizontal scroller ──────────────────────────────────────────── */}
        {/*
          overflow-x:scroll (not auto) forces the scroll context to always exist.
          The parent overflow-hidden clips decorative elements without blocking
          scroll because this div owns its own independent scroll container.
        */}
        <div
          ref={scrollerRef}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-scroll overflow-y-hidden"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {SECTIONS.map((s, index) => (
            <motion.section
              key={s.id}
              id={s.id}
              className="relative isolate flex h-full w-screen flex-none snap-center overflow-hidden"
              style={{ background: s.bg }}
              animate={{
                opacity: active === index ? 1 : 0.35,
                scale:   active === index ? 1 : 0.98,
              }}
              transition={sectionTransition}
            >
              {/* Vertical band */}
              <div className="relative z-10">
                <VBand fg={s.fg} />
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
                      transition={contentFadeTransition}
                    >
                      <SectionContent s={s} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ghost section number */}
              <motion.div
                className="absolute bottom-8 right-12 z-10 font-black leading-none pointer-events-none select-none"
                style={{
                  fontSize: "6.5rem",
                  color: "transparent",
                  WebkitTextStroke: `1px ${s.fg}06`,
                  fontFamily: "'Georgia',serif",
                  fontStyle: "italic",
                }}
              >
                <motion.span
                  className="inline-block"
                  animate={
                    active === index
                      ? { rotate: [0, -1.6, 1.6, 0], scale: [1, 1.035, 1], y: [0, -2, 0] }
                      : { rotate: 0, scale: 1, y: 0 }
                  }
                  transition={active === index ? ghostActiveTransition : ghostIdleTransition}
                >
                  {String(index + 1).padStart(2, "0")}
                </motion.span>
              </motion.div>
            </motion.section>
          ))}
        </div>

        {/* Bottom ticker */}
        <div className="fixed bottom-4 left-4 right-4 z-20 pointer-events-none">
          <div className="mx-auto w-full max-w-7xl">
            <div
              className="overflow-hidden rounded-sm"
              style={{
                border: `5px solid ${fg}20`,
                boxShadow: `6px 6px 0 0 ${fg}18`,
                background: `${fg}10`,
              }}
            >
              <Ticker fg={fg} />
            </div>
          </div>
        </div>

        <style>{`
          html, body { overflow: hidden; }
          ::-webkit-scrollbar { display: none; }
        `}</style>
      </div>
    </ClickSpark>
  )
}
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState, type CSSProperties } from "react"
import { B, SECTIONS, landingTokens } from "../lib/tokens"
import { BrutalGridBackground } from "@/components/ui/layout/brutal-grid-background"
import ClickSpark, { CLICK_SPARK_PRESETS } from "@/components/effects/ClickSpark"
import { Ticker } from "../ui/Ticker"
import { VBand } from "../ui/VBand"
import { SideProgress } from "../ui/SideProgress"
import { Nav } from "../ui/Nav"
import { HeroSection } from "../sections/HeroSection"
import { AboutSection } from "../sections/AboutSection"
import { FeaturesSection } from "../sections/FeaturesSection"
import { WorkflowSection } from "../sections/WorkflowSection"
import { PlansSection } from "../sections/PlansSection"
import { CtaSection } from "../sections/CtaSection"
import { FloatingObjects } from "../ui/FloatingObjects"
import { IntroPreloader } from "../ui/IntroPreloader"
import { contentFadeTransition, ghostActiveTransition, ghostIdleTransition, sectionTransition } from "../lib/motion"
import { NoiseOverlay, NOISE_OVERLAY_PRESETS } from "@/components/effects/NoiseOverlay"

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

function SectionContent({ s }: { s: (typeof SECTIONS)[number] }) {
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

export function HorizontalLanding() {
  const rootRef     = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const activeRef   = useRef(0)
  const [active,    setActive]    = useState(0)
  const [introDone, setIntroDone] = useState(false)

  useEffect(() => {
    if (!introDone) return
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => {
      const idx = clamp(Math.round(el.scrollLeft / el.clientWidth), 0, SECTIONS.length - 1)
      if (idx !== activeRef.current) { activeRef.current = idx; setActive(idx) }
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [introDone])

  useEffect(() => {
    if (!introDone) return
    const root    = rootRef.current
    const scroller = scrollerRef.current
    if (!root || !scroller) return

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return
      const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
      if (max === 0) return
      const unit  = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      const delta = e.deltaY * unit
      if (!delta) return
      e.preventDefault()
      scroller.scrollLeft = clamp(scroller.scrollLeft + delta, 0, max)
    }

    let startY = 0, startLeft = 0
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      startY = e.touches[0].clientY; startLeft = scroller.scrollLeft
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
      if (max === 0) return
      const delta = startY - e.touches[0].clientY
      if (!delta) return
      e.preventDefault()
      scroller.scrollLeft = clamp(startLeft + delta, 0, max)
    }

    root.addEventListener("wheel",      onWheel,      { passive: false, capture: true })
    root.addEventListener("touchstart", onTouchStart, { passive: true,  capture: true })
    root.addEventListener("touchmove",  onTouchMove,  { passive: false, capture: true })
    return () => {
      root.removeEventListener("wheel",      onWheel,      { capture: true })
      root.removeEventListener("touchstart", onTouchStart, { capture: true })
      root.removeEventListener("touchmove",  onTouchMove,  { capture: true })
    }
  }, [introDone])

  const goTo = (i: number) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: clamp(i, 0, SECTIONS.length - 1) * el.clientWidth, behavior: "smooth" })
  }

  useEffect(() => {
    if (!introDone) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(activeRef.current + 1)
      if (e.key === "ArrowLeft")  goTo(activeRef.current - 1)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [introDone])

  const fg = SECTIONS[active]?.fg ?? B.black
  const bg = SECTIONS[active]?.bg ?? B.cream
  const isCta = SECTIONS[active]?.id === "cta"
  const navFg = isCta ? B.black : fg
  const navAccent = isCta ? B.cream : B.orange
  const navActiveLinkColor = isCta ? B.black : B.orange
  const navCtaColor = isCta ? B.black : B.orange

  return (
    <>
      <AnimatePresence>
        {!introDone && <IntroPreloader onDone={() => setIntroDone(true)} />}
      </AnimatePresence>

      {introDone && (
        <ClickSpark {...CLICK_SPARK_PRESETS.landing}>
          <motion.div
            ref={rootRef}
            className="relative isolate h-screen w-screen overflow-hidden transition-colors duration-700"
            style={{
              background: bg,
              color: fg,
              ["--color-brutal-grid" as never]:
                bg === B.black || bg === B.orange
                  ? landingTokens.ui.landing.colors.brutalGridLight
                  : landingTokens.ui.landing.colors.brutalGridDark,
              ["--primary" as never]: B.orange,
              touchAction: "none",
            }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          >
            <BrutalGridBackground defaultVariant="none" />
            <FloatingObjects />
            <NoiseOverlay {...NOISE_OVERLAY_PRESETS.landing} />

            <Nav
              active={active}
              goTo={goTo}
              fg={navFg}
              accentColor={navAccent}
              activeLinkColor={navActiveLinkColor}
              ctaColor={navCtaColor}
            />
            <SideProgress active={active} fg={fg} />

            <motion.div
              className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: active === 0 ? 0.4 : 0 }}
              transition={{ delay: 2 }}
            >
              <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color: fg }}>
                {landingTokens.copy.landing.landingView.keyboardHint}
              </span>
            </motion.div>

            <div
              ref={scrollerRef}
              className="flex h-full w-full snap-x snap-mandatory overflow-x-scroll overflow-y-hidden"
              style={{ scrollbarWidth: "none" } as CSSProperties}
            >
              {SECTIONS.map((s, index) => (
                <motion.section
                  key={s.id}
                  id={s.id}
                  className="relative isolate flex h-full w-screen flex-none snap-center overflow-hidden"
                  style={{ background: s.bg }}
                  animate={{
                    opacity: active === index ? 1 : 0.35,
                    scale: active === index ? 1 : 0.98,
                  }}
                  transition={sectionTransition}
                >
                  <div className="relative z-10">
                    <VBand fg={s.fg} />
                  </div>

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
                      {String(index + 1).padStart(2, landingTokens.copy.landing.padChar)}
                    </motion.span>
                  </motion.div>
                </motion.section>
              ))}
            </div>

            <div className="fixed bottom-4 left-4 right-4 z-20 pointer-events-none">
              <div className="mx-auto w-full max-w-8xl">
                <div
                  className="overflow-hidden rounded-sm"
                  style={{
                    border: `2px solid ${fg}70`,
                    background: `${fg}08`
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
          </motion.div>
        </ClickSpark>
      )}
    </>
  )
}

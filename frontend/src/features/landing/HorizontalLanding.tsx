"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
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

  // Otimização: { passive: true } nos event listeners melhora a performance de scroll
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener("scroll", onScroll, { passive:true })
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
    el.addEventListener("wheel", onWheel, { passive:false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [])

  const goTo = (i: number) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior:"smooth" })
  }

  const currentSection = SECTIONS[active]
  const fg = currentSection?.fg ?? B.black
  const bg = currentSection?.bg ?? B.cream

  return (
      <ClickSpark sparkColor={B.orange} extraScale={1.2}>
        <div
          className="relative isolate h-screen w-screen overflow-hidden transition-colors duration-700"
          style={{
            background: bg,
            color: fg,
            ["--color-brutal-grid" as never]:
              bg === B.black || bg === B.orange ? "rgba(240,236,217,0.16)" : "rgba(13,13,13,0.12)",
            ["--primary" as never]: B.orange,
          }}
        >
          <BrutalGridBackground defaultVariant="none" />
          <FloatingObjects />
          <div
            className="fixed inset-0 z-30 pointer-events-none opacity-[0.18]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.0' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.9'/%3E%3C/svg%3E\") , repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, rgba(0,0,0,0) 4px, rgba(0,0,0,0) 7px)",
              backgroundSize: "180px 180px, 100% 15px",
              backgroundBlendMode: "overlay, multiply",
              mixBlendMode: "overlay",
              animation: "noiseShift 1.6s steps(2) infinite",
              filter: "contrast(50)",
            }}
            aria-hidden
          />

        {/* Progress bar */}
        <motion.div className="fixed top-0 left-0 h-[2px] z-50"
                    initial={{ scaleX:0 }}
                    animate={{ scaleX: active / (SECTIONS.length - 1) }}
                    transition={{ ease:"easeOut", duration:0.8 }}
                    style={{ transformOrigin:"left", background:B.orange, width:"100%" }} />

        <Nav active={active} goTo={goTo} fg={fg} />
        <SideProgress active={active} fg={fg} />

        {/* Keyboard hint */}
        <motion.div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40 hidden md:flex items-center gap-2"
                    initial={{ opacity:0 }} animate={{ opacity: active === 0 ? 0.4 : 0 }}
                    transition={{ delay:2 }}>
        <span className="font-mono text-[8px] uppercase tracking-widest" style={{ color:fg }}>
          usa as teclas ← →
        </span>
        </motion.div>

        {/* Horizontal scroller */}
        <div ref={scrollerRef}
             className="flex h-full w-full overflow-x-auto overflow-y-hidden overscroll-x-contain snap-x snap-mandatory"
             style={{ scrollbarWidth:"none" }}>
          {SECTIONS.map((s, index) => (
              <motion.section key={s.id} id={s.id}
                              className="relative isolate flex h-full w-screen flex-none snap-center overflow-hidden transition-colors duration-700"
                              style={{ background:s.bg }}
                              animate={{
                                opacity: active === index ? 1 : 0.35,
                                scale: active === index ? 1 : 0.98,
                              }}
                              transition={sectionTransition}>

                {/* Vertical band */}
                <div className="relative z-10"><VBand fg={s.fg} /></div>

                {/* Content */}
                <div className="relative z-20 flex-1 pl-9">
                  <AnimatePresence mode="wait">
                    {active === index && (
                        <motion.div key={`content-${s.id}`} className="w-full h-full"
                                    initial={{ opacity:0 }}
                                    animate={{ opacity:1 }}
                                    exit={{ opacity:0 }}
                                    transition={contentFadeTransition}>
                          <SectionContent s={s} />
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Ghost section number */}
                <motion.div className="absolute bottom-8 right-12 z-10 font-black leading-none pointer-events-none select-none"
                     style={{ fontSize:"6.5rem", color:"transparent",
                       WebkitTextStroke:`1px ${s.fg}06`,
                       fontFamily:"'Georgia',serif", fontStyle:"italic" }}>
                  <motion.span
                    className="inline-block"
                    animate={
                      active === index
                        ? { rotate: [0, -1.6, 1.6, 0], scale: [1, 1.035, 1], y: [0, -2, 0] }
                        : { rotate: 0, scale: 1, y: 0 }
                    }
                    transition={active === index ? ghostActiveTransition : ghostIdleTransition}
                  >
                  {String(index+1).padStart(2,"0")}
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
        html,body { overflow:hidden; }
        ::-webkit-scrollbar { display:none; }
        @keyframes noiseShift {
          0% { background-position: 0 0; }
          100% { background-position: 180px 180px; }
        }
      `}</style>
        </div>
      </ClickSpark>
  )
}

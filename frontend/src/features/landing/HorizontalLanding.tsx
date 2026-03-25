"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { RobotCanvas } from "@/components/robot/RobotCanvas"
import Link from "next/link"

const SECTIONS = [
  {
    id: "hero",
    title: "Automatize o seu Alojamento Local com Nexus Estates",
    subtitle:
      "Gestão de inventário, sincronização, preços automáticos e burocracia pronta para SEF.",
    message:
      "Olá! Eu sou o NexusBot. Vou te mostrar como o Nexus Estates simplifica a gestão do seu AL.",
  },
  {
    id: "about",
    title: "Quem somos",
    subtitle:
      "Missão: tecnologia que liberta o anfitrião para focar na rentabilidade.",
    message: "Primeiro, vamos falar sobre quem somos.",
  },
  {
    id: "features",
    title: "O que oferecemos",
    subtitle:
      "Inventário e preços, motor de reservas, sincronização e burocracia automática.",
    message: "Cada bloco aqui é uma funcionalidade.",
  },
  {
    id: "workflow",
    title: "Como funciona na prática",
    subtitle:
      "Do login às faturas: tudo sincronizado e automatizado num só lugar.",
    message: "Veja como o seu dia a dia muda.",
  },
  {
    id: "product",
    title: "Nexus Estates: o produto",
    subtitle: "PMS + Channel Manager all‑in‑one.",
    message:
      "Este é o Nexus Estates como PMS + Channel Manager, o cérebro digital do seu negócio.",
  },
  {
    id: "plans",
    title: "Planos de pagamento",
    subtitle: "Starter, Pro e Enterprise para cada fase do seu negócio.",
    message: "Escolha o plano que mais combina com você.",
  },
  {
    id: "cta",
    title: "Pronto para começar?",
    subtitle: "Clientes poupam 5–10 horas/semana em burocracia.",
    message: "Hora de começar!",
  },
]

export function HorizontalLanding() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [moving, setMoving] = useState(false)
  const scrollTimer = useRef<number | null>(null)

  const onScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    if (idx !== active) setActive(Math.max(0, Math.min(idx, SECTIONS.length - 1)))
    setMoving(true)
    if (scrollTimer.current) window.clearTimeout(scrollTimer.current)
    scrollTimer.current = window.setTimeout(() => setMoving(false), 220) as unknown as number
  }, [active])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [onScroll])

  const goNext = () => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ left: (active + 1) * el.clientWidth, behavior: "smooth" })
  }

  return (
    <div className="relative h-screen w-screen bg-background text-foreground">
      <div
        ref={scrollerRef}
        className={cn(
          "flex h-full w-full overflow-x-auto overflow-y-hidden",
          "overscroll-x-contain"
        )}
      >
        {SECTIONS.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className="flex h-full w-screen flex-none items-center justify-center px-6"
          >
            <div className="max-w-5xl w-full grid gap-4 text-center">
              <div className="mx-auto text-xs uppercase tracking-widest text-muted-foreground">{s.id}</div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-primary">
                {s.title}
              </h1>
              <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground">
                {s.subtitle}
              </p>
              {i === 0 && (
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={goNext}
                    className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Vem comigo →
                  </button>
                  <Link
                    href="/booking"
                    className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    Explorar Reservas
                  </Link>
                </div>
              )}
              {i === 5 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  A maioria dos nossos clientes começa no Pro.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="ml-auto mb-2 w-fit rounded-md border bg-card px-3 py-2 text-sm text-card-foreground shadow">
            {SECTIONS[active]?.message}
          </div>
          <div className="relative">
            <RobotCanvas sectionIndex={active} moving={moving} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 h-20 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/40" />
    </div>
  )
}

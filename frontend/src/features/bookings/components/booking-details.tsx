"use client"

/**
 * BookingDetails — v5
 *
 * Contexto
 * - Ecrã de detalhe de uma propriedade no fluxo de bookings.
 * - É apresentado quando o utilizador selecciona um card no grid (BookingView).
 *
 * Responsabilidades
 * - Mostrar informação principal da propriedade (imagem, título, localização, rating).
 * - Permitir seleccionar datas com o `DateRangeCalendar`.
 * - Emitir `onCheckout({checkIn, checkOut})` quando o utilizador confirmar datas.
 *
 * UX/Animação
 * - Usa presets centralizados em `features/bookings/motion.ts` para consistência.
 * - Minimiza “layout thrash” com transições de altura/opacity e `useReducedMotion`.
 *
 * Acessibilidade
 * - CTA principais usam `<Button>`; navegação não depende de gestos.
 *
 * Notas
 * - Este componente não faz chamadas ao backend: apenas prepara o payload para checkout.
 */

import { useEffect, useCallback, useRef, useState, useMemo } from "react"
import {
  ArrowLeft, MapPin, Star, Check, Calendar,
  Users, BedDouble, Maximize2, ChevronRight,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/forms/button"
import { Badge } from "@/components/ui/badge"
import { BrutalShard } from "@/components/ui/data-display/card"
import Image from "next/image"
import type { BookingProperty } from "@/types/booking"
import { cn } from "@/lib/utils"
import { DateRangeCalendar } from "./date-range-calendar"
import { notify } from "@/lib/notify"
import { format, differenceInCalendarDays } from "date-fns"
import {
  AnimatePresence, motion,
  useReducedMotion, useInView,
  useScroll, useTransform,
} from "framer-motion"
import {
  imageFade, springSnap, springBounce,
  gummyHover, gummyTap, comicSpring,
  pillHover, pillTap,
  slideInLeftEnter,
} from "@/features/bookings/lib/motion"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface PropertyExtras {
  maxGuests?: number
  bedrooms?: number
  area?: number
}

type RichProperty = BookingProperty & PropertyExtras

interface BookingDetailsProps {
  property: RichProperty
  onBack: () => void
  onCheckout: (params: { checkIn: string; checkOut: string }) => void
  checkInDate?: Date | null
  checkOutDate?: Date | null
}

interface BookingState {
  checkIn: Date | null
  checkOut: Date | null
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function calcNights(checkIn: Date | null, checkOut: Date | null): number | null {
  if (!checkIn || !checkOut) return null
  return Math.max(1, differenceInCalendarDays(checkOut, checkIn))
}

// ─────────────────────────────────────────────
// BookingDetails — root
// ─────────────────────────────────────────────

export function BookingDetails({
  property,
  onBack,
  onCheckout,
  checkInDate = null,
  checkOutDate = null,
}: BookingDetailsProps) {
  const handleBack = useCallback(() => onBack(), [onBack])
  const [booking, setBooking] = useState<BookingState>({ checkIn: checkInDate, checkOut: checkOutDate })
  const calendarRef = useRef<HTMLDivElement>(null)

  useSwipeBack(handleBack)

  const nights = useMemo(() => calcNights(booking.checkIn, booking.checkOut), [booking])
  const total = nights !== null ? nights * property.price : null

  const handleConfirmDates = useCallback(
    (checkIn: Date, checkOut: Date) => {
      setBooking({ checkIn, checkOut })
      onCheckout({
        checkIn: format(checkIn, "yyyy-MM-dd"),
        checkOut: format(checkOut, "yyyy-MM-dd"),
      })
    },
    [onCheckout]
  )

  const scrollToCalendar = useCallback(() => {
    calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  const handleBookNow = useCallback(() => {
    if (booking.checkIn && booking.checkOut) {
      handleConfirmDates(booking.checkIn, booking.checkOut)
    } else {
      scrollToCalendar()
      notify.info("Seleciona as datas de check-in e check-out.")
    }
  }, [booking, handleConfirmDates, scrollToCalendar])

  return (
    // relative aqui para que o botão absolute interno (se usado) não escape
    <div className="relative min-h-screen overflow-x-hidden bg-background pb-24 lg:pb-0">

      {/* ── Back button — in normal document flow, above gallery */}
      <div className="px-4 md:px-6 lg:px-10 pt-4 md:pt-6">
        <motion.div
          {...slideInLeftEnter(0, -14, 0.22)}
          className="inline-block"
        >
          <motion.div whileHover={pillHover} whileTap={pillTap} transition={springSnap}>
            <Button onClick={handleBack} variant="brutal-outline" className="group">
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Voltar</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Gallery — clean image, no heavy overlay */}
      <div className="mt-4">
        <PropertyGallery property={property} />
      </div>

      {/* ── Title below gallery, over clean background */}
      <PropertyHeroText property={property} />

      {/* ── Main content grid */}
      <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-10 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 items-start">

          {/* Left — content stack */}
          <div className="space-y-8 min-w-0">
            <PropertyBreadcrumb property={property} />
            <PropertyStats property={property} />
            <PropertyDescription property={property} />
            <PropertyAmenities property={property} />

            {/* Calendar */}
            <RevealSection delay={0.1}>
              <div ref={calendarRef} data-date-range-calendar>
                <SectionLabel>Disponibilidade</SectionLabel>
                <div className="mt-4">
                  <DateRangeCalendar
                    pricePerNight={property.price}
                    defaultValue={
                      booking.checkIn && booking.checkOut
                        ? { from: booking.checkIn, to: booking.checkOut }
                        : undefined
                    }
                    onConfirmBooking={({ range }) => {
                      if (range.from && range.to) handleConfirmDates(range.from, range.to)
                    }}
                    onContactOwner={() => notify.info("Chat ainda não disponível.")}
                  />
                </div>
              </div>
            </RevealSection>
          </div>

          {/* Right — sticky sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-6">
              <BookingSidebar
                property={property}
                booking={booking}
                nights={nights}
                total={total}
                onBookNow={handleBookNow}
                onContactOwner={() => notify.info("Chat ainda não disponível.")}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile CTA */}
      <MobileBookingBar
        property={property}
        nights={nights}
        total={total}
        onBookNow={handleBookNow}
      />
    </div>
  )
}

// ─────────────────────────────────────────────
// PropertyGallery — clean, minimal overlay
// ─────────────────────────────────────────────

function PropertyGallery({ property }: { property: RichProperty }) {
  const galleryImages = property.imageUrl ? [property.imageUrl] : []
  const [activeIndex, setActiveIndex] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"])

  useEffect(() => {
    if (galleryImages.length <= 1) return
    const id = window.setInterval(
      () => setActiveIndex((p) => (p + 1) % galleryImages.length),
      6000
    )
    return () => window.clearInterval(id)
  }, [galleryImages.length])

  return (
    <div ref={containerRef} className="relative">
      {/* Main frame */}
      <div className="relative w-full overflow-hidden rounded-none h-[45vh] md:h-[60vh] lg:h-[65vh]">
        {galleryImages.length > 0 ? (
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeIndex}
              className="absolute inset-0"
              style={{ y: shouldReduceMotion ? 0 : imageY }}
            >
              <motion.img
                src={galleryImages[activeIndex]}
                alt={property.title}
                className="h-[115%] w-full object-cover"
                variants={shouldReduceMotion ? undefined : imageFade}
                initial="initial"
                animate="animate"
                exit="exit"
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="h-full w-full bg-muted/40 grid place-items-center">
            <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">
              Sem imagem
            </span>
          </div>
        )}

        {/* Featured badge */}
        <AnimatePresence>
          {property.featured && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-4 right-4 md:top-5 md:right-5"
            >
              <Badge variant="featured">FEATURED</Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dot indicators — only small gradient here for contrast */}
        {galleryImages.length > 1 && (
          <>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {galleryImages.map((_, i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  animate={
                    i === activeIndex
                      ? { width: 20, backgroundColor: "var(--primary)" }
                      : { width: 6, backgroundColor: "rgba(255,255,255,0.5)" }
                  }
                  transition={springSnap}
                  className="h-1.5 rounded-full cursor-pointer"
                  aria-label={`Imagem ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {galleryImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 md:px-6 lg:px-10 py-3 scrollbar-none">
          {galleryImages.map((src, i) => (
            <motion.button
              key={`thumb-${i}`}
              type="button"
              onClick={() => setActiveIndex(i)}
              whileHover={shouldReduceMotion ? undefined : gummyHover}
              whileTap={shouldReduceMotion ? undefined : gummyTap}
              transition={comicSpring}
              className={cn(
                "relative flex-shrink-0 w-20 h-14 md:w-28 md:h-20 overflow-hidden rounded-lg border-2 transition-colors group",
                i === activeIndex
                  ? "border-primary"
                  : "border-foreground/25 hover:border-foreground/60"
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="112px"
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
                <span className="font-mono text-[8px] uppercase tracking-widest font-bold">Ver</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// PropertyHeroText — LED glow title, below gallery
// ─────────────────────────────────────────────

function PropertyHeroText({ property }: { property: RichProperty }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="px-4 md:px-6 lg:px-10 pt-6 md:pt-8 pb-2">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-3"
      >
        {/* Location */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.18, duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="font-mono text-sm font-bold text-muted-foreground uppercase tracking-widest">
            {property.location}
          </span>
        </motion.div>

        {/* Title with LED glow */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1, y: 0 }
              : {
                  opacity: 1,
                  y: 0,
                  filter: [
                    "drop-shadow(0 0 0px transparent)",
                    "drop-shadow(0 0 14px hsl(var(--primary) / 0.7)) drop-shadow(0 0 30px hsl(var(--primary) / 0.3))",
                    "drop-shadow(0 0 8px hsl(var(--primary) / 0.45)) drop-shadow(0 0 18px hsl(var(--primary) / 0.15))",
                    "drop-shadow(0 0 16px hsl(var(--primary) / 0.65)) drop-shadow(0 0 34px hsl(var(--primary) / 0.28))",
                    "drop-shadow(0 0 8px hsl(var(--primary) / 0.45)) drop-shadow(0 0 18px hsl(var(--primary) / 0.15))",
                  ],
                }
          }
          transition={{
            opacity: { delay: 0.22, duration: 0.36, ease: [0.22, 1, 0.36, 1] },
            y:       { delay: 0.22, duration: 0.36, ease: [0.22, 1, 0.36, 1] },
            filter: {
              delay: 0.58,
              duration: 3.8,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
              times: [0, 0.25, 0.5, 0.75, 1],
            },
          }}
          className="text-4xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.88] tracking-tight"
        >
          {property.title}
        </motion.h1>

        {/* Rating + price */}
        <div className="flex items-center gap-4 flex-wrap pt-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, ...springBounce }}
            whileHover={pillHover}
            whileTap={pillTap}
          >
            <Badge variant="rating">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span>{property.rating}</span>
            </Badge>
          </motion.div>

          <div className="h-px w-8 bg-foreground/20" />

          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.36, duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono font-black text-xl md:text-2xl text-primary"
          >
            €{property.price}
            <span className="text-sm font-normal text-foreground/50 ml-1">/noite</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PropertyBreadcrumb
// ─────────────────────────────────────────────

function PropertyBreadcrumb({ property }: { property: RichProperty }) {
  return (
    <RevealSection>
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest flex-wrap">
        <span>Propriedades</span>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span>{property.location}</span>
        <ChevronRight className="h-3 w-3 opacity-40" />
        <span className="text-foreground font-black">{property.title}</span>
      </div>
    </RevealSection>
  )
}

// ─────────────────────────────────────────────
// PropertyStats
// ─────────────────────────────────────────────

const STAT_CONFIG = [
  { key: "maxGuests", icon: Users,     label: "Hóspedes", suffix: ""   },
  { key: "bedrooms",  icon: BedDouble, label: "Quartos",  suffix: ""   },
  { key: "area",      icon: Maximize2, label: "Área",     suffix: "m²" },
] as const

function PropertyStats({ property }: { property: RichProperty }) {
  const stats = STAT_CONFIG.map(({ key, icon, label, suffix }) => ({
    icon,
    label,
    value: property[key] != null ? `${property[key]}${suffix}` : "—",
  }))

  return (
    // Single RevealSection wrapping the grid — no nested whileInView
    <RevealSection delay={0.05}>
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, value, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.06, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            whileHover={gummyHover}
            whileTap={gummyTap}
          >
            <div className="rounded-xl border-2 border-foreground bg-background shadow-[3px_3px_0_0_rgb(0,0,0)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.8)] p-4 flex flex-col items-center gap-2 text-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="font-black text-lg md:text-xl leading-none tabular-nums">{value}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </RevealSection>
  )
}

// ─────────────────────────────────────────────
// PropertyDescription
// ─────────────────────────────────────────────

const DESCRIPTION_COLLAPSE_THRESHOLD = 220

function PropertyDescription({ property }: { property: RichProperty }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = property.description.length > DESCRIPTION_COLLAPSE_THRESHOLD

  return (
    <RevealSection delay={0.06}>
      <BrutalShard rotate="secondary">
        <SectionLabel>Sobre a propriedade</SectionLabel>
        <div className="mt-3 relative">
          <p className={cn(
            "font-mono text-base leading-relaxed text-muted-foreground",
            !expanded && isLong && "line-clamp-4"
          )}>
            {property.description}
          </p>
          {isLong && !expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          )}
        </div>
        {isLong && (
          <motion.button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            whileHover={pillHover}
            whileTap={pillTap}
            transition={springSnap}
            className="mt-3 font-mono text-xs font-black uppercase tracking-wider text-primary underline underline-offset-4"
          >
            {expanded ? "Ver menos" : "Ler mais"}
          </motion.button>
        )}
      </BrutalShard>
    </RevealSection>
  )
}

// ─────────────────────────────────────────────
// PropertyAmenities
// ─────────────────────────────────────────────

function PropertyAmenities({ property }: { property: RichProperty }) {
  if (!property.tags?.length) return null

  return (
    <RevealSection delay={0.08}>
      <BrutalShard rotate="primary">
        <SectionLabel>Comodidades</SectionLabel>
        <div className="mt-4 flex flex-wrap gap-2">
          {property.tags.map((tag, i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 + i * 0.04, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              whileHover={pillHover}
              whileTap={pillTap}
            >
              <div className="flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-3 py-1.5 shadow-[2px_2px_0_0_rgb(0,0,0)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.8)]">
                <Check className="h-3 w-3 text-primary shrink-0" />
                <span className="font-mono text-[11px] uppercase font-bold tracking-wide">{tag}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </BrutalShard>
    </RevealSection>
  )
}

// ─────────────────────────────────────────────
// BookingSidebar
// ─────────────────────────────────────────────

interface BookingSidebarProps {
  property: RichProperty
  booking: BookingState
  nights: number | null
  total: number | null
  onBookNow: () => void
  onContactOwner: () => void
}

function BookingSidebar({ property, booking, nights, total, onBookNow, onContactOwner }: BookingSidebarProps) {
  const hasDateRange = Boolean(booking.checkIn && booking.checkOut && nights)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border-2 border-foreground bg-background shadow-[6px_6px_0_0_rgb(0,0,0)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.8)] overflow-hidden"
    >
      {/* Price header */}
      <div className="p-5 border-b-2 border-foreground">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          A partir de
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-black text-primary">€{property.price}</span>
          <span className="font-mono text-sm text-muted-foreground">/noite</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="font-mono text-xs font-bold">{property.rating}</span>
          <span className="font-mono text-xs text-muted-foreground">· {property.location}</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <AnimatePresence mode="wait">
          {hasDateRange ? (
            <motion.div
              key="dates-set"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <SidebarDateChip label="Check-in" date={booking.checkIn} />
                <SidebarDateChip label="Check-out" date={booking.checkOut} />
              </div>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>€{property.price} × {nights} noite{nights !== 1 ? "s" : ""}</span>
                  <span className="font-bold text-foreground">€{total}</span>
                </div>
                <div className="flex justify-between border-t-2 border-foreground pt-2 font-black text-base">
                  <span className="uppercase">Total</span>
                  <motion.span
                    key={total}
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={springSnap}
                    className="text-primary tabular-nums"
                  >
                    €{total}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="no-dates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 rounded-lg border-2 border-dashed border-foreground/25 p-3 text-muted-foreground"
            >
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="font-mono text-xs">Seleciona as datas abaixo</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div whileHover={gummyHover} whileTap={gummyTap} transition={comicSpring}>
          <Button
            variant="brutal"
            className="w-full h-12 text-sm font-black uppercase tracking-wider shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)]"
            onClick={onBookNow}
          >
            {hasDateRange ? "Confirmar reserva" : "Escolher datas"}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </motion.div>

        <motion.div whileHover={pillHover} whileTap={pillTap} transition={springSnap}>
          <Button
            variant="brutal-outline"
            className="w-full h-10 text-xs font-black uppercase"
            onClick={onContactOwner}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-2" />
            Contactar proprietário
          </Button>
        </motion.div>

        <p className="text-center font-mono text-[10px] text-muted-foreground/50 uppercase tracking-wider">
          Sem cobrança até à confirmação
        </p>
      </div>
    </motion.div>
  )
}

function SidebarDateChip({ label, date }: { label: string; date: Date | null }) {
  return (
    <div className="rounded-lg border-2 border-foreground p-3 shadow-[2px_2px_0_0_rgb(0,0,0)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.8)]">
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-black text-sm mt-0.5">{date ? format(date, "dd MMM") : "—"}</div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MobileBookingBar
// ─────────────────────────────────────────────

function MobileBookingBar({
  property, nights, total, onBookNow,
}: {
  property: RichProperty
  nights: number | null
  total: number | null
  onBookNow: () => void
}) {
  const hasTotal = total !== null && nights !== null
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t-2 border-foreground bg-background/95 backdrop-blur-sm px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
        <div>
          <div className="font-black text-xl text-primary leading-none tabular-nums">
            {hasTotal ? `€${total}` : `€${property.price}`}
            {!hasTotal && <span className="font-normal text-sm text-muted-foreground ml-1">/noite</span>}
          </div>
          {hasTotal && (
            <div className="font-mono text-[10px] text-muted-foreground uppercase mt-0.5">
              {nights} noite{nights !== 1 ? "s" : ""}
            </div>
          )}
        </div>
        <motion.div whileHover={gummyHover} whileTap={gummyTap} transition={comicSpring}>
          <Button
            variant="brutal"
            className="h-11 px-6 font-black uppercase text-sm shadow-[3px_3px_0_0_rgb(0,0,0)]"
            onClick={onBookNow}
          >
            {hasTotal ? "Reservar" : "Escolher datas"}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// RevealSection — scroll-triggered, with correct initial state
// ─────────────────────────────────────────────

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  // `initial` set to false tells framer-motion to NOT animate on first render —
  // we control the initial state ourselves via the `initial` prop below
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// SectionLabel
// ─────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="h-4 w-1 bg-primary rounded-full shrink-0" />
      <h3 className="font-mono text-[11px] font-black uppercase tracking-widest text-muted-foreground">
        {children}
      </h3>
    </div>
  )
}

// ─────────────────────────────────────────────
// useSwipeBack — stable ref, passive listeners
// ─────────────────────────────────────────────

function useSwipeBack(onBack: () => void) {
  const onBackRef = useRef(onBack)
  useEffect(() => { onBackRef.current = onBack }, [onBack])

  useEffect(() => {
    let startX = 0
    let startY = 0
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && e.deltaX < -20) onBackRef.current()
    }
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX
      const dy = e.changedTouches[0].clientY - startY
      if (dx > 50 && Math.abs(dx) > Math.abs(dy)) onBackRef.current()
    }
    window.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
    }
  }, [])
}

"use client"

/**
 * DateRangeCalendar — v2
 *
 * Contexto
 * - Selector de datas reutilizado em `BookingDetails` para iniciar uma reserva.
 *
 * Responsabilidades
 * - Permitir seleccionar um intervalo (check-in/check-out) com UX consistente.
 * - Calcular noites e total (baseado em `pricePerNight`) localmente.
 * - Emitir callbacks com payload tipado para avançar no fluxo (reserva/contacto).
 *
 * Notas
 * - A validação de disponibilidade real deve viver no backend/channel manager.
 * - Este componente aplica apenas guardas UX (ex: impedir datas no passado).
 */

import * as React from "react"
import { BrutalCalendar } from "@/components/ui/calendars/calendar"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/forms/button"
import { BrutalCard } from "@/components/ui/data-display/card"
import { useMediaQuery } from "@/hooks/use-media-query"
import { AnimatePresence, motion } from "framer-motion"
import { Calendar, MessageCircle, ChevronRight, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import {
  springSnap, springBounce,
  gummyHover, gummyTap, comicSpring,
  pillHover, pillTap,
  fadeUpEnter,
} from "@/features/bookings/motion"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type BookingActionPayload = {
  range: DateRange
  totalPrice: number
  nights: number
}

interface DateRangeCalendarProps {
  className?: string
  pricePerNight: number
  defaultValue?: DateRange
  onConfirmBooking?: (data: BookingActionPayload) => void
  onContactOwner?: (data: BookingActionPayload) => void
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function calcNights(range: DateRange | undefined): number {
  if (!range?.from || !range?.to) return 0
  return Math.max(1, Math.ceil(
    Math.abs(range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24)
  ))
}

const TODAY = new Date(new Date().setHours(0, 0, 0, 0))

// ─────────────────────────────────────────────
// DateRangeCalendar
// ─────────────────────────────────────────────

export function DateRangeCalendar({
  className,
  pricePerNight,
  defaultValue,
  onConfirmBooking,
  onContactOwner,
}: DateRangeCalendarProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(defaultValue)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const nights = React.useMemo(() => calcNights(date), [date])
  const total = nights * pricePerNight

  const isValid = Boolean(date?.from && date?.to)
  const payload = React.useMemo<BookingActionPayload | null>(
    () => (isValid && date?.from && date?.to ? { range: date, totalPrice: total, nights } : null),
    [isValid, date, total, nights]
  )

  return (
    <div className={cn("grid gap-6 grid-cols-1 lg:grid-cols-[1fr_360px]", className)}>

      {/* Left — Calendar */}
      <motion.div
        {...fadeUpEnter(0, 12, 0.3)}
      >
        <BrutalCalendar
          title="Selecionar datas"
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={isDesktop ? 2 : 1}
          className="w-full max-w-[300px] md:max-w-none"
          disabled={(d) => d < TODAY}
        />
      </motion.div>

      {/* Right — Pricing summary */}
      <motion.div
        {...fadeUpEnter(0.08, 12, 0.3)}
        className="space-y-4"
      >
        <BrutalCard>
          <PricingSummary
            pricePerNight={pricePerNight}
            nights={nights}
            total={total}
            date={date}
          />
          <BookingActions
            payload={payload}
            isValid={isValid}
            onConfirmBooking={onConfirmBooking}
            onContactOwner={onContactOwner}
          />
        </BrutalCard>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PricingSummary
// ─────────────────────────────────────────────

function PricingSummary({
  pricePerNight,
  nights,
  total,
  date,
}: {
  pricePerNight: number
  nights: number
  total: number
  date: DateRange | undefined
}) {
  const hasDates = Boolean(date?.from && date?.to)

  return (
    <div className="space-y-5">
      {/* Price header */}
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <span className="font-mono text-2xl font-black">€{pricePerNight}</span>
          <span className="font-mono text-sm text-muted-foreground ml-1">/noite</span>
        </div>

        <AnimatePresence mode="wait">
          {nights > 0 && (
            <motion.div
              key={nights}
              initial={{ opacity: 0, scale: 0.85, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 4 }}
              transition={springBounce}
              className="rounded-full border-2 border-primary bg-primary/10 px-3 py-1"
            >
              <span className="font-mono text-xs font-black text-primary uppercase">
                {nights} noite{nights !== 1 ? "s" : ""}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Date chips */}
      <AnimatePresence mode="wait">
        {hasDates ? (
          <motion.div
            key="date-chips"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-2 gap-2"
          >
            <DateChip label="Check-in" date={date?.from} />
            <DateChip label="Check-out" date={date?.to} />
          </motion.div>
        ) : (
          <motion.div
            key="date-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-2.5 rounded-lg border-2 border-dashed border-foreground/20 p-3.5 text-muted-foreground"
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="font-mono text-xs leading-relaxed">
              Seleciona um intervalo de datas no calendário
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breakdown — only when dates are set */}
      <AnimatePresence>
        {hasDates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-2.5 font-mono text-sm pt-1">
              <div className="flex justify-between text-muted-foreground">
                <span className="underline decoration-dotted underline-offset-2">
                  €{pricePerNight} × {nights} noite{nights !== 1 ? "s" : ""}
                </span>
                <span className="font-bold text-foreground">€{nights * pricePerNight}</span>
              </div>

              <div className="flex justify-between border-t-2 border-foreground pt-3 font-black text-base">
                <span className="uppercase">Total</span>
                <motion.span
                  key={total}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={springSnap}
                  className="text-primary tabular-nums"
                >
                  €{total}
                </motion.span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────
// DateChip — small date display
// ─────────────────────────────────────────────

function DateChip({ label, date }: { label: string; date?: Date }) {
  return (
    <div className="rounded-lg border-2 border-foreground bg-background p-3 shadow-[2px_2px_0_0_rgb(0,0,0)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.8)]">
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">
        {label}
      </div>
      <div className="font-black text-sm leading-none">
        {date ? format(date, "dd MMM") : "—"}
      </div>
      {date && (
        <div className="font-mono text-[10px] text-muted-foreground mt-0.5">
          {format(date, "yyyy")}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// BookingActions
// ─────────────────────────────────────────────

function BookingActions({
  payload,
  isValid,
  onConfirmBooking,
  onContactOwner,
}: {
  payload: BookingActionPayload | null
  isValid: boolean
  onConfirmBooking?: (data: BookingActionPayload) => void
  onContactOwner?: (data: BookingActionPayload) => void
}) {
  return (
    <div className="mt-6 space-y-3">
      {/* Primary CTA */}
      <motion.div
        whileHover={isValid ? gummyHover : undefined}
        whileTap={isValid ? gummyTap : undefined}
        transition={comicSpring}
      >
        <Button
          variant="brutal"
          className="w-full h-12 text-base font-black uppercase tracking-wider shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)]"
          disabled={!isValid}
          onClick={() => payload && onConfirmBooking?.(payload)}
        >
          {isValid ? (
            <span className="flex items-center gap-2">
              Reservar
              <ChevronRight className="h-4 w-4" />
            </span>
          ) : (
            "Seleciona as datas"
          )}
        </Button>
      </motion.div>

      {/* Fine print */}
      <p className="text-center font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">
        Sem cobrança até à confirmação
      </p>

      {/* Secondary — contact owner */}
      <div className="pt-1 border-t border-foreground/10">
        <motion.div whileHover={pillHover} whileTap={pillTap} transition={springSnap}>
          <Button
            variant="brutal-outline"
            className="w-full h-10 text-xs font-black uppercase"
            disabled={!isValid}
            onClick={() => payload && onContactOwner?.(payload)}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-2" />
            Contactar proprietário
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

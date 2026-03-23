"use client"

/**
 * BookingSearchBar
 *
 * Contexto
 * - Barra de pesquisa usada no ecrã de listagem (BookingView).
 *
 * Responsabilidades
 * - Capturar critérios de pesquisa (destino, datas, hóspedes, preço máximo).
 * - Emitir callbacks por campo para o parent aplicar filtros.
 *
 * UX/Animação
 * - Secções compactas e popovers para manter densidade correcta em mobile.
 * - Indicadores “filled” para feedback rápido sem ocupar espaço.
 * - Presets de motion centralizados em `features/bookings/motion.ts`.
 */
import { Calendar as CalendarIcon, DollarSign, MapPin, Minus, Plus, Search, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/forms/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/overlay/popover"
import {
  SearchBar,
  SearchBarContent,
  SearchBarInputContainer,
  SearchBarLabel,
  SearchBarSection,
} from "@/components/ui/data-display/search-bar"
import {
  staggerContainer,
  staggerItem,
  popoverVariants,
  indicatorDot,
  springSnap,
  pillHover,
  pillTap,
} from "@/features/bookings/motion"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface BookingSearchBarProps {
  destination?: string
  guests?: string
  adults?: number
  childrenCount?: number
  maxPrice?: number | ""
  checkInDate?: Date | null
  checkOutDate?: Date | null
  onDestinationChange?: (value: string) => void
  onGuestsChange?: (value: string) => void
  onAdultsChange?: (value: number) => void
  onChildrenChange?: (value: number) => void
  onMaxPriceChange?: (value: number | "") => void
  onCheckInChange?: (value: Date | null) => void
  onCheckOutChange?: (value: Date | null) => void
  className?: string
}

// ─────────────────────────────────────────────
// BookingSearchBar
// ─────────────────────────────────────────────

/** Componente raiz da barra de pesquisa (delegando a UI em secções). */
export function BookingSearchBar({
  destination,
  guests,
  adults = 1,
  childrenCount = 0,
  maxPrice = "",
  checkInDate: initialCheckIn,
  checkOutDate: initialCheckOut,
  onDestinationChange,
  onGuestsChange,
  onAdultsChange,
  onChildrenChange,
  onMaxPriceChange,
  onCheckInChange,
  onCheckOutChange,
  className,
}: BookingSearchBarProps) {
  const [checkInDate, setCheckInDate] = useState<Date | null>(initialCheckIn ?? null)
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(initialCheckOut ?? null)

  const computedGuestsLabel = useMemo(() => {
    const total = adults + childrenCount
    return `${total} Guest${total !== 1 ? "s" : ""}`
  }, [adults, childrenCount])

  const displayedGuestsLabel = guests ?? computedGuestsLabel

  useEffect(() => {
    onGuestsChange?.(computedGuestsLabel)
  }, [computedGuestsLabel, onGuestsChange])

  return (
    <SearchBar className={className}>
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <SearchBarContent>
          <motion.div variants={staggerItem} className="col-span-2 md:col-span-1">
            <DestinationSection destination={destination} onChange={onDestinationChange} />
          </motion.div>

          <motion.div variants={staggerItem} className="col-span-2 md:col-span-1">
            <DatesSection
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              onCheckInChange={(date) => {
                setCheckInDate(date)
                onCheckInChange?.(date)
              }}
              onCheckOutChange={(date) => {
                setCheckOutDate(date)
                onCheckOutChange?.(date)
              }}
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <GuestsSection
              guestsLabel={displayedGuestsLabel}
              adults={adults}
              childrenCount={childrenCount}
              onAdultsChange={onAdultsChange}
              onChildrenChange={onChildrenChange}
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <PriceSection maxPrice={maxPrice} onMaxPriceChange={onMaxPriceChange} />
          </motion.div>
        </SearchBarContent>
      </motion.div>
    </SearchBar>
  )
}

// ─────────────────────────────────────────────
// Section components
// ─────────────────────────────────────────────

/** Secção: destino (input livre). */
function DestinationSection({
  destination,
  onChange,
}: {
  destination?: string
  onChange?: (val: string) => void
}) {
  const filled = Boolean(destination && destination.trim().length > 0)

  return (
    <SearchBarSection className={cn("col-span-2 md:col-span-1 transition-colors", filled && "bg-primary/5")}>
      <SearchBarLabel className={cn("transition-colors", filled && "text-primary")}>
        <MapPin className={cn("h-3 w-3 md:h-3.5 md:w-3.5 transition-colors", filled && "text-primary")} />
        <span>Destination</span>
        {filled && (
          <motion.span
            initial={indicatorDot.initial}
            animate={indicatorDot.animate}
            className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
          />
        )}
      </SearchBarLabel>
      <SearchBarInputContainer>
        <Search className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent font-mono text-[10px] md:text-xs uppercase outline-none placeholder:text-muted-foreground/70"
          value={destination ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </SearchBarInputContainer>
    </SearchBarSection>
  )
}

/** Secção: datas (2 date pickers em popover). */
function DatesSection({
  checkInDate,
  checkOutDate,
  onCheckInChange,
  onCheckOutChange,
}: {
  checkInDate: Date | null
  checkOutDate: Date | null
  onCheckInChange: (d: Date | null) => void
  onCheckOutChange: (d: Date | null) => void
}) {
  const filled = Boolean(checkInDate || checkOutDate)

  return (
    <SearchBarSection className={cn("col-span-2 md:col-span-1 transition-colors", filled && "bg-primary/5")}>
      <SearchBarLabel className={cn("transition-colors", filled && "text-primary")}>
        <CalendarIcon className={cn("h-3 w-3 md:h-3.5 md:w-3.5 transition-colors", filled && "text-primary")} />
        <span>Dates</span>
        {filled && (
          <motion.span
            initial={indicatorDot.initial}
            animate={indicatorDot.animate}
            className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
          />
        )}
      </SearchBarLabel>
      <SearchBarInputContainer className="justify-between">
        <DatePicker
          date={checkInDate}
          onSelect={(date) => {
            onCheckInChange(date ?? null)
            if (date && checkOutDate && date >= checkOutDate) {
              onCheckOutChange(null)
            }
          }}
          disabled={(date) => date < new Date()}
          placeholder="Check-in"
        />
        <span className="text-muted-foreground/50 text-[10px] select-none">—</span>
        <DatePicker
          date={checkOutDate}
          onSelect={(date) => onCheckOutChange(date ?? null)}
          disabled={(date) => (checkInDate ? date <= checkInDate : date < new Date())}
          placeholder="Check-out"
        />
      </SearchBarInputContainer>
    </SearchBarSection>
  )
}

/** Secção: hóspedes (popover com counters). */
function GuestsSection({
  guestsLabel,
  adults,
  childrenCount,
  onAdultsChange,
  onChildrenChange,
}: {
  guestsLabel: string
  adults: number
  childrenCount: number
  onAdultsChange?: (v: number) => void
  onChildrenChange?: (v: number) => void
}) {
  const filled = adults > 1 || childrenCount > 0

  return (
    <SearchBarSection className={cn("transition-colors", filled && "bg-primary/5")}>
      <SearchBarLabel className={cn("transition-colors", filled && "text-primary")}>
        <Users className={cn("h-3 w-3 md:h-3.5 md:w-3.5 transition-colors", filled && "text-primary")} />
        <span>Guests</span>
        {filled && (
          <motion.span
            initial={indicatorDot.initial}
            animate={indicatorDot.animate}
            className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
          />
        )}
      </SearchBarLabel>
      <GuestSelector
        guestsLabel={guestsLabel}
        adults={adults}
        childrenCount={childrenCount}
        onAdultsChange={onAdultsChange}
        onChildrenChange={onChildrenChange}
      />
    </SearchBarSection>
  )
}

/** Secção: preço máximo (input com “brutal shadow” e micro-interactions). */
function PriceSection({
  maxPrice,
  onMaxPriceChange,
}: {
  maxPrice: number | ""
  onMaxPriceChange?: (v: number | "") => void
}) {
  const filled = maxPrice !== "" && maxPrice > 0

  return (
    <SearchBarSection className={cn("transition-colors", filled && "bg-primary/5")}>
      <SearchBarLabel className={cn("relative overflow-hidden transition-colors", filled && "text-primary")}>
        <span
          className={cn(
            "absolute inset-0 -skew-x-6 origin-left transition-colors",
            filled ? "bg-primary/20" : "bg-primary/90"
          )}
        />
        <div className="relative flex items-center gap-2">
          <DollarSign className="h-3 w-3 md:h-3.5 md:w-3.5" />
          <span className="relative z-10">Max Price</span>
        </div>
      </SearchBarLabel>
      <SearchBarInputContainer className="justify-between">
        <span className="font-mono text-[9px] md:text-[11px] uppercase text-muted-foreground">
          Up to
        </span>
        <PriceInput value={maxPrice} onChange={onMaxPriceChange} />
      </SearchBarInputContainer>
    </SearchBarSection>
  )
}

// ─────────────────────────────────────────────
// DatePicker
// ─────────────────────────────────────────────

interface DatePickerProps {
  date: Date | null
  onSelect: (date: Date | undefined) => void
  disabled: (date: Date) => boolean
  placeholder?: string
}

function DatePicker({ date, onSelect, disabled, placeholder = "Date" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={pillHover}
          whileTap={pillTap}
          className="flex items-center gap-1.5 md:gap-2 font-mono text-[10px] md:text-[11px] uppercase text-foreground outline-none cursor-pointer"
        >
          <CalendarIcon className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
          <span className={cn(!date && "text-muted-foreground/70")}>
            {date ? format(date, "dd/MM") : placeholder}
          </span>
        </motion.button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" asChild>
        <motion.div
          variants={popoverVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={onSelect}
            disabled={disabled}
            initialFocus
          />
        </motion.div>
      </PopoverContent>
    </Popover>
  )
}

// ─────────────────────────────────────────────
// GuestSelector
// ─────────────────────────────────────────────

interface GuestSelectorProps {
  guestsLabel: string
  adults: number
  childrenCount: number
  onAdultsChange?: (value: number) => void
  onChildrenChange?: (value: number) => void
}

function GuestSelector({
  guestsLabel,
  adults,
  childrenCount,
  onAdultsChange,
  onChildrenChange,
}: GuestSelectorProps) {
  const [open, setOpen] = useState(false)
  const totalGuests = adults + childrenCount
  const computedLabel = `${totalGuests} Guest${totalGuests !== 1 ? "s" : ""}`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <motion.div
          whileHover={{ backgroundColor: "var(--muted)" }}
          whileTap={{ scale: 0.985 }}
          transition={springSnap}
          className={cn(
            "flex items-center gap-2 md:gap-3 bg-secondary px-3 py-2 md:px-4 md:py-3 dark:bg-background",
            "w-full text-left outline-none cursor-pointer rounded-sm"
          )}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
        >
          <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground shrink-0" />
          <span className="font-mono text-[10px] md:text-xs uppercase text-foreground truncate">
            {guestsLabel || computedLabel}
          </span>
        </motion.div>
      </PopoverTrigger>
      <AnimatePresence>
        {open && (
          <PopoverContent
            className="w-80 p-4 border-2 border-foreground shadow-[4px_4px_0_0_rgb(0,0,0)]"
            align="start"
            forceMount
            asChild
          >
            <motion.div
              variants={popoverVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="grid gap-4">
                <GuestCounter
                  label="Adults"
                  sub="Ages 13+"
                  count={adults}
                  onChange={(d) => onAdultsChange?.(Math.max(1, adults + d))}
                  min={1}
                />
                <div className="h-px w-full bg-border" />
                <GuestCounter
                  label="Children"
                  sub="Ages 2–12"
                  count={childrenCount}
                  onChange={(d) => onChildrenChange?.(Math.max(0, childrenCount + d))}
                  min={0}
                />
              </div>
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  )
}

// ─────────────────────────────────────────────
// GuestCounter
// ─────────────────────────────────────────────

function GuestCounter({
  label,
  sub,
  count,
  onChange,
  min,
}: {
  label: string
  sub: string
  count: number
  onChange: (d: number) => void
  min: number
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="grid gap-0.5">
        <span className="font-mono text-sm font-bold uppercase">{label}</span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
      <div className="flex items-center gap-3">
        <motion.div whileTap={{ scale: 0.88 }} transition={springSnap}>
          <Button
            variant="brutal"
            size="icon"
            className="h-8 w-8"
            onClick={() => onChange(-1)}
            disabled={count <= min}
          >
            <Minus className="h-3 w-3" />
          </Button>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="w-4 text-center font-mono text-sm font-bold tabular-nums"
          >
            {count}
          </motion.span>
        </AnimatePresence>

        <motion.div whileTap={{ scale: 0.88 }} transition={springSnap}>
          <Button
            variant="brutal"
            size="icon"
            className="h-8 w-8"
            onClick={() => onChange(1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// PriceInput
// ─────────────────────────────────────────────

interface PriceInputProps {
  value: number | ""
  onChange?: (value: number | "") => void
}

function PriceInput({ value, onChange }: PriceInputProps) {
  const [localValue, setLocalValue] = useState(value === "" ? "" : String(value))
  const [focused, setFocused] = useState(false)

  const commit = () => {
    if (!onChange) return
    if (localValue === "") { onChange(""); return }
    const parsed = Number(localValue)
    if (!Number.isNaN(parsed)) onChange(parsed)
  }

  return (
    <motion.div
      className="relative flex-1 min-w-[60px] md:min-w-[80px]"
      animate={focused ? { rotate: -1.5 } : { rotate: -1 }}
      transition={springSnap}
    >
      {/* Shadow layer */}
      <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] border-2 border-foreground bg-foreground/10" />

      {/* Input layer */}
      <motion.div
        animate={focused ? { scale: 1.02 } : { scale: 1 }}
        transition={springSnap}
        className="relative flex items-center gap-1 bg-background px-2 py-1 md:px-3 md:py-2 border-2 border-foreground"
      >
        <DollarSign className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground shrink-0" />
        <input
          type="number"
          min={0}
          inputMode="numeric"
          className="w-full bg-transparent font-mono text-[10px] md:text-xs uppercase outline-none min-w-0"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); commit() }}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          placeholder="500"
        />
      </motion.div>
    </motion.div>
  )
}

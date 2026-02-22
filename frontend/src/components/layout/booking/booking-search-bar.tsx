"use client"

import { Calendar, DollarSign, MapPin, Minus, Plus, Search, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/forms/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/overlay/popover"

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

function SingleDateCalendar({
  value,
  onChange,
  minDate,
}: {
  value: Date | null
  onChange: (d: Date) => void
  minDate: Date
}) {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    value && value > minDate ? startOfDay(value) : startOfDay(minDate)
  )

  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"]
  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const firstDayOfMonth = new Date(year, month, 1)
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const cells = useMemo(() => {
    const arr: (Date | null)[] = []
    for (let index = 0; index < totalCells; index += 1) {
      const dayNumber = index - startOffset + 1
      if (dayNumber < 1 || dayNumber > daysInMonth) {
        arr.push(null)
      } else {
        arr.push(new Date(year, month, dayNumber))
      }
    }
    return arr
  }, [year, month, startOffset, daysInMonth, totalCells])

  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })

  return (
    <div className="w-80 space-y-3">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="border-[2px] border-foreground bg-secondary hover:bg-secondary/80 shadow-[2px_2px_0_0_rgb(0,0,0)]"
          onClick={() =>
            setVisibleMonth(new Date(year, month - 1, 1))
          }
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]">
          {monthLabel}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="border-[2px] border-foreground bg-secondary hover:bg-secondary/80 shadow-[2px_2px_0_0_rgb(0,0,0)]"
          onClick={() =>
            setVisibleMonth(new Date(year, month + 1, 1))
          }
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map((d, i) => (
          <div key={`${d}-${i}`} className="text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {d}
          </div>
        ))}
        {cells.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />
          const disabled = startOfDay(date) < startOfDay(minDate)
          const selected = value && startOfDay(date).getTime() === startOfDay(value).getTime()
          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onChange(date)}
              className={cn(
                "h-8 rounded-md border-[2px] border-foreground/40 bg-background/70 text-xs font-mono transition-all hover:-translate-y-[1px] hover:shadow-[2px_2px_0_0_rgb(0,0,0)]",
                disabled && "opacity-40 cursor-not-allowed hover:translate-y-0 hover:shadow-none",
                selected && "bg-primary text-primary-foreground border-foreground shadow-[2px_2px_0_0_rgb(0,0,0)]"
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function BookingSearchBar({
  destination,
  guests,
  adults = 1,
  childrenCount = 0,
  maxPrice = "",
  checkInDate = null,
  checkOutDate = null,
  onDestinationChange,
  onGuestsChange,
  onAdultsChange,
  onChildrenChange,
  onMaxPriceChange,
  onCheckInChange,
  onCheckOutChange,
  className,
}: BookingSearchBarProps) {
  const [open, setOpen] = useState(false)
  const [priceInput, setPriceInput] = useState(
    maxPrice === "" ? "" : String(maxPrice)
  )

  const today = new Date()
  const fmt = (d: Date | null) => {
    if (!d) return "Select date"
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    return `${dd}/${mm}`
  }

  const handleAdultsChange = (delta: number) => {
    const newValue = Math.max(1, adults + delta)
    onAdultsChange?.(newValue)
  }

  const handleChildrenChange = (delta: number) => {
    const newValue = Math.max(0, childrenCount + delta)
    onChildrenChange?.(newValue)
  }

  const totalGuests = adults + childrenCount
  const guestLabel = `${totalGuests} Guest${totalGuests !== 1 ? "s" : ""}`

  const BRUTAL_SHADOW = "shadow-[5px_5px_0_0_rgb(0,0,0)] dark:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)]"
  const BRUTAL_SHADOW_SMALL = "shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)]"
  const BRUTAL_SHADOW_XSMALL = "shadow-[2px_2px_0_0_rgb(0,0,0)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.9)]"
  
  const LABEL_STYLES = "flex items-center gap-2 bg-foreground px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-background dark:bg-muted dark:text-foreground"
  const INPUT_CONTAINER_STYLES = "flex items-center gap-3 bg-secondary px-4 py-3 dark:bg-background transition-transform active:scale-[0.98]"
  const BUTTON_ICON_STYLES = cn(
    "h-8 w-8 rounded-none border-[2px] border-foreground active:translate-x-[1px] active:translate-y-[1px] active:shadow-none",
    BRUTAL_SHADOW_XSMALL
  )
  const SECTION_CONTAINER_STYLES = "border-white/20 dark:border-white/20"

  return (
    <div
      className={cn(
        "mx-auto mb-10 max-w-6xl border-[2px] border-foreground bg-card text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700",
        BRUTAL_SHADOW,
        className
      )}
    >
      <div className="grid grid-cols-1 divide-y divide-white/20 md:grid-cols-4 md:divide-y-0 md:divide-x dark:divide-white/20">
        {/* Destination */}
        <div className={SECTION_CONTAINER_STYLES}>
          <div className={LABEL_STYLES}>
            <MapPin className="h-3.5 w-3.5" />
            <span>Destination</span>
          </div>
          <div className={INPUT_CONTAINER_STYLES}>
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for a city or region..."
              className="w-full bg-transparent font-mono text-xs uppercase outline-none placeholder:text-muted-foreground/70"
              value={destination ?? ""}
              onChange={(event) => onDestinationChange?.(event.target.value)}
            />
          </div>
        </div>

        {/* Check-in/out */}
        <div className={SECTION_CONTAINER_STYLES}>
          <div className={LABEL_STYLES}>
            <Calendar className="h-3.5 w-3.5" />
            <span>Check-in / Check-out</span>
          </div>
          <div className={cn(INPUT_CONTAINER_STYLES, "justify-between")}>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 font-mono text-[11px] uppercase text-foreground outline-none">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{fmt(checkInDate)}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className={cn("w-auto border-[2px] border-foreground bg-background p-3", BRUTAL_SHADOW_SMALL)}>
                <SingleDateCalendar
                  value={checkInDate}
                  minDate={today}
                  onChange={(d) => {
                    onCheckInChange?.(d)
                  }}
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground/70">—</span>
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-2 font-mono text-[11px] uppercase text-foreground outline-none">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{fmt(checkOutDate)}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className={cn("w-auto border-[2px] border-foreground bg-background p-3", BRUTAL_SHADOW_SMALL)}>
                <SingleDateCalendar
                  value={checkOutDate}
                  minDate={checkInDate ? new Date(checkInDate.getFullYear(), checkInDate.getMonth(), checkInDate.getDate() + 1) : today}
                  onChange={(d) => {
                    onCheckOutChange?.(d)
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Guests */}
        <div className={SECTION_CONTAINER_STYLES}>
          <div className={LABEL_STYLES}>
            <Users className="h-3.5 w-3.5" />
            <span>Guests</span>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button className={cn(
                INPUT_CONTAINER_STYLES, 
                "w-full text-left outline-none transition-colors hover:bg-secondary/80 dark:hover:bg-muted/20"
              )}>
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xs uppercase text-foreground">
                  {totalGuests > 0 ? guestLabel : "Add guests"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className={cn("w-80 border-[2px] border-foreground bg-background p-4", BRUTAL_SHADOW_SMALL)}>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="grid gap-0.5">
                    <span className="font-mono text-sm font-bold uppercase">
                      Adults
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Ages 13+
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className={BUTTON_ICON_STYLES}
                      onClick={() => handleAdultsChange(-1)}
                      disabled={adults <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-4 text-center font-mono text-sm font-bold">
                      {adults}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className={BUTTON_ICON_STYLES}
                      onClick={() => handleAdultsChange(1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="h-[1px] w-full bg-border" />
                <div className="flex items-center justify-between">
                  <div className="grid gap-0.5">
                    <span className="font-mono text-sm font-bold uppercase">
                      Children
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Ages 2-12
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className={BUTTON_ICON_STYLES}
                      onClick={() => handleChildrenChange(-1)}
                      disabled={childrenCount <= 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-4 text-center font-mono text-sm font-bold">
                      {childrenCount}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className={BUTTON_ICON_STYLES}
                      onClick={() => handleChildrenChange(1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className={SECTION_CONTAINER_STYLES}>
          <div className={cn(LABEL_STYLES, "relative overflow-hidden")}
          >
            <span className="absolute inset-0 bg-primary/90 -skew-x-6 origin-left" />
            <div className="relative flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5" />
              <span className="relative z-10">Max Price</span>
            </div>
          </div>
          <div className={cn(INPUT_CONTAINER_STYLES, "justify-between")}
          >
            <span className="font-mono text-[11px] uppercase text-muted-foreground">
              Up to
            </span>
            <div className="relative">
              <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] border-[2px] border-foreground bg-foreground/10 -rotate-2" />
              <div className="relative flex items-center gap-1 bg-background px-3 py-2 border-[2px] border-foreground rotate-[-2deg]">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  className="w-20 bg-transparent font-mono text-xs uppercase outline-none"
                  value={priceInput}
                  onChange={(event) => setPriceInput(event.target.value)}
                  onBlur={() => {
                    if (!onMaxPriceChange) return
                    if (priceInput === "") {
                      onMaxPriceChange("")
                      return
                    }
                    const parsed = Number(priceInput)
                    if (!Number.isNaN(parsed)) {
                      onMaxPriceChange(parsed)
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      if (!onMaxPriceChange) return
                      if (priceInput === "") {
                        onMaxPriceChange("")
                        return
                      }
                      const parsed = Number(priceInput)
                      if (!Number.isNaN(parsed)) {
                        onMaxPriceChange(parsed)
                      }
                    }
                  }}
                  placeholder="500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

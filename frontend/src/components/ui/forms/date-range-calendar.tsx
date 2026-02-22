"use client"

import { useMemo, useState } from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/forms/button"

type DateRange = {
  start: Date | null
  end: Date | null
}

type DateRangeCalendarProps = {
  value?: DateRange
  defaultValue?: DateRange
  onChange?: (value: DateRange) => void
  pricePerNight?: number
  currency?: string
  className?: string
  minDate?: Date
  onConfirmBooking?: (params: {
    range: DateRange
    totalPrice: number
    nights: number
  }) => void
  onContactOwner?: (params: {
    range: DateRange
    totalPrice: number
    nights: number
  }) => void
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isDateInRange(date: Date, start: Date, end: Date) {
  const time = startOfDay(date).getTime()
  const startTime = startOfDay(start).getTime()
  const endTime = startOfDay(end).getTime()

  return time >= startTime && time <= endTime
}

function formatLong(date: Date | null) {
  if (!date) return "Select dates"

  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()

  return `${day}/${month}/${year}`
}

export function DateRangeCalendar({
  value,
  defaultValue,
  onChange,
  pricePerNight,
  currency = "€",
  className,
  minDate,
  onConfirmBooking,
  onContactOwner,
}: DateRangeCalendarProps) {
  const initialRange: DateRange =
    value ??
    defaultValue ?? {
      start: null,
      end: null,
    }

  const today = startOfDay(new Date())
  const effectiveMinDate = startOfDay(minDate ?? today)

  const [internalRange, setInternalRange] = useState<DateRange>(initialRange)
  const initialVisible =
    internalRange.start && internalRange.start > effectiveMinDate
      ? internalRange.start
      : effectiveMinDate
  const [visibleMonth, setVisibleMonth] = useState(startOfDay(initialVisible))

  const range = value ?? internalRange

  const nights = useMemo(() => {
    if (!range.start || !range.end) return 0

    const start = startOfDay(range.start)
    const end = startOfDay(range.end)
    const diff = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diff <= 0) {
      return 1
    }

    return diff
  }, [range.start, range.end])

  const totalPrice =
    pricePerNight && nights > 0 ? pricePerNight * nights : 0

  const handleRangeChange = (next: DateRange) => {
    if (!value) {
      setInternalRange(next)
    }
    onChange?.(next)
  }

  // Monday-first
  const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"]

  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  // Convert JS Sunday-first (0..6) to Monday-first (0..6)
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - startOffset + 1
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cells.push(null)
    } else {
      cells.push(new Date(year, month, dayNumber))
    }
  }

  const handleDayClick = (date: Date) => {
    if (date < effectiveMinDate) return
    const start = range.start
    const end = range.end

    if (!start || (start && end)) {
      handleRangeChange({ start: date, end: null })
      return
    }

    if (date.getTime() < start.getTime()) {
      handleRangeChange({ start: date, end: null })
      return
    }

    if (isSameDay(date, start)) {
      handleRangeChange({ start, end: start })
      return
    }

    handleRangeChange({ start, end: date })
  }

  const handlePreviousMonth = () => {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1)
    )
  }

  const handleNextMonth = () => {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
    )
  }

  const handleConfirmBooking = () => {
    if (!range.start || !range.end || nights <= 0) return

    onConfirmBooking?.({
      range,
      totalPrice,
      nights,
    })
  }

  const handleContactOwner = () => {
    if (!range.start || !range.end || nights <= 0) return

    onContactOwner?.({
      range,
      totalPrice,
      nights,
    })
  }

  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })

  return (
    <div
      className={cn(
        "w-full max-w-3xl border-[2px] border-foreground bg-card/70 shadow-[5px_5px_0_0_rgb(0,0,0)] dark:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)] p-4 md:p-6 space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border-[2px] border-foreground bg-foreground text-background">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Select your stay
            </span>
            <span className="font-mono text-xs uppercase">
              {formatLong(range.start)}{" "}
              <span className="mx-1">→</span> {formatLong(range.end)}
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-md border-[2px] border-foreground bg-background px-2 py-1 font-mono text-[11px] uppercase tracking-[0.18em]">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="border-[2px] border-foreground bg-secondary hover:bg-secondary/80 shadow-[2px_2px_0_0_rgb(0,0,0)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.9)]"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="min-w-[120px] text-center text-[11px] font-semibold">
            {monthLabel}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="border-[2px] border-foreground bg-secondary hover:bg-secondary/80 shadow-[2px_2px_0_0_rgb(0,0,0)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.9)]"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 rounded-md border-[2px] border-foreground bg-secondary/60 p-3">
        {daysOfWeek.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {cells.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} />
          }

          const isDisabled = date < effectiveMinDate

          const isStart = range.start && isSameDay(date, range.start)
          const isEnd = range.end && isSameDay(date, range.end)

          const isInRange =
            range.start &&
            range.end &&
            isDateInRange(date, range.start, range.end)

          const isSelected = isStart || isEnd

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => handleDayClick(date)}
              disabled={isDisabled}
              className={cn(
                "relative flex h-10 items-center justify-center rounded-md border-[2px] border-foreground/40 bg-background/70 font-mono text-xs transition-all hover:-translate-y-[1px] hover:shadow-[2px_2px_0_0_rgb(0,0,0)]",
                isDisabled && "opacity-40 cursor-not-allowed hover:translate-y-0 hover:shadow-none",
                isInRange && "bg-primary/10 border-primary/60",
                isSelected &&
                  "bg-primary text-primary-foreground border-foreground shadow-[2px_2px_0_0_rgb(0,0,0)]"
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 border-t-[2px] border-dashed border-foreground/40 pt-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Summary
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            {nights > 0 ? (
              <>
                <span className="font-mono text-sm font-bold">
                  {nights} night{nights !== 1 ? "s" : ""}
                </span>
                {pricePerNight && (
                  <>
                    <span className="font-mono text-xs text-muted-foreground">
                      × {currency}
                      {pricePerNight.toLocaleString()}
                    </span>
                    <span className="font-mono text-sm font-bold">
                      = {currency}
                      {totalPrice.toLocaleString()}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="font-mono text-xs text-muted-foreground">
                Select a check-in and check-out date to see the total price.
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Button
            type="button"
            disabled={nights <= 0}
            className="h-10 flex-1 border-[2px] border-foreground bg-primary text-primary-foreground font-mono text-xs font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_0_rgb(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            onClick={handleConfirmBooking}
          >
            Book this stay
          </Button>
          <Button
            type="button"
            disabled={nights <= 0}
            variant="outline"
            className="h-10 flex-1 border-[2px] border-foreground bg-background font-mono text-xs font-black uppercase tracking-[0.18em] shadow-[4px_4px_0_0_rgb(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
            onClick={handleContactOwner}
          >
            Contact owner
          </Button>
        </div>
      </div>
    </div>
  )
}

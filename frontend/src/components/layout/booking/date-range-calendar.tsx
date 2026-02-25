"use client"

import * as React from "react"
import { BrutalCalendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/forms/button"
import { BrutalCard } from "@/components/ui/data-display/card"
import { useMediaQuery } from "@/hooks/use-media-query"

interface DateRangeCalendarProps {
  className?: string
  pricePerNight: number
  defaultValue?: DateRange
  onConfirmBooking?: (data: { range: DateRange; totalPrice: number; nights: number }) => void
  onContactOwner?: (data: { range: DateRange; totalPrice: number; nights: number }) => void
}

export function DateRangeCalendar({
  className,
  pricePerNight,
  defaultValue,
  onConfirmBooking,
  onContactOwner,
}: DateRangeCalendarProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(defaultValue)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const nights = React.useMemo(() => {
    if (!date?.from || !date?.to) return 0
    return Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))
  }, [date])

  const totalPrice = nights * pricePerNight
  const serviceFee = Math.round(totalPrice * 0.12) // 12% service fee
  const cleaningFee = 45 // Fixed cleaning fee
  const total = totalPrice + serviceFee + cleaningFee

  return (
    <div className={cn("grid gap-6 grid-cols-1 lg:grid-cols-[1fr_380px]", className)}>
      <BrutalCalendar
        title="Select Dates"
        initialFocus
        mode="range"
        defaultMonth={date?.from}
        selected={date}
        onSelect={setDate}
        numberOfMonths={isDesktop ? 2 : 1}
        className="w-full max-w-[300px] md:max-w-none"
        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
      />

      <div className="space-y-6">
        <BrutalCard>
          <div className="flex items-baseline justify-between">
            <h3 className="font-mono text-xl font-bold uppercase">
              €{pricePerNight}
              <span className="text-sm text-muted-foreground">/night</span>
            </h3>
            {nights > 0 && (
                <span className="font-mono text-sm font-bold text-primary">
                    {nights} night{nights !== 1 ? "s" : ""}
                </span>
            )}
          </div>

          <div className="my-6 space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground underline decoration-dotted">
                €{pricePerNight} x {nights} nights
              </span>
              <span>€{totalPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground underline decoration-dotted">
                Cleaning fee
              </span>
              <span>€{cleaningFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground underline decoration-dotted">
                Nexus service fee
              </span>
              <span>€{serviceFee}</span>
            </div>
            <div className="mt-4 flex justify-between border-t-[2px] border-foreground pt-4 text-base font-bold">
              <span>Total</span>
              <span>€{total}</span>
            </div>
          </div>

          <Button
            variant="brutal"
            className="w-full h-12 text-base font-bold uppercase tracking-wider"
            disabled={!date?.from || !date?.to}
            onClick={() => date?.from && date?.to && onConfirmBooking?.({ range: date, totalPrice: total, nights })}
          >
            Reserve
          </Button>
          
          <div className="mt-4 text-center">
             <span className="text-xs text-muted-foreground block mb-2">You won't be charged yet</span>
             <Button 
                variant="link" 
                className="h-auto p-0 text-xs text-foreground underline decoration-2 hover:text-primary"
                onClick={() => date?.from && date?.to && onContactOwner?.({ range: date, totalPrice: total, nights })}
             >
                Contact Owner
             </Button>
          </div>
        </BrutalCard>
      </div>
    </div>
  )
}

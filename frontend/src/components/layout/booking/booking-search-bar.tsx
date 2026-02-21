"use client"

import { Calendar, MapPin, Minus, Plus, Search, Users } from "lucide-react"
import { useState } from "react"

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
  onDestinationChange?: (value: string) => void
  onGuestsChange?: (value: string) => void
  onAdultsChange?: (value: number) => void
  onChildrenChange?: (value: number) => void
  className?: string
}

export function BookingSearchBar({
  destination,
  guests,
  adults = 1,
  childrenCount = 0,
  onDestinationChange,
  onGuestsChange,
  onAdultsChange,
  onChildrenChange,
  className,
}: BookingSearchBarProps) {
  const [open, setOpen] = useState(false)

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
      <div className="grid grid-cols-1 divide-y divide-white/20 md:grid-cols-3 md:divide-y-0 md:divide-x dark:divide-white/20">
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
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Select dates</span>
            </div>
            <span className="text-muted-foreground/70">—</span>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Select dates</span>
            </div>
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
      </div>
    </div>
  )
}


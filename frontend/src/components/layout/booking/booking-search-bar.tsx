"use client"

import { Calendar as CalendarIcon, DollarSign, MapPin, Minus, Plus, Search, Users } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/forms/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  BrutalPopoverContent,
  PopoverTrigger,
} from "@/components/ui/overlay/popover"
import {
  SearchBar,
  SearchBarContent,
  SearchBarInputContainer,
  SearchBarLabel,
  SearchBarSection,
} from "@/components/ui/data-display/search-bar"

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

  return (
    <SearchBar className={className}>
      <SearchBarContent>
        {/* Destination */}
        <SearchBarSection className="col-span-2 md:col-span-1">
          <SearchBarLabel>
            <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5" />
            <span>Destination</span>
          </SearchBarLabel>
          <SearchBarInputContainer>
            <Search className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent font-mono text-[10px] md:text-xs uppercase outline-none placeholder:text-muted-foreground/70"
              value={destination ?? ""}
              onChange={(event) => onDestinationChange?.(event.target.value)}
            />
          </SearchBarInputContainer>
        </SearchBarSection>

        {/* Check-in/out */}
        <SearchBarSection className="col-span-2 md:col-span-1">
          <SearchBarLabel>
            <CalendarIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
            <span>Dates</span>
          </SearchBarLabel>
          <SearchBarInputContainer className="justify-between">
            <DatePicker
              date={checkInDate}
              onSelect={(date) => {
                setCheckInDate(date ?? null)
                onCheckInChange?.(date ?? null)
                if (date && checkOutDate && date >= checkOutDate) {
                  setCheckOutDate(null)
                  onCheckOutChange?.(null)
                }
              }}
              disabled={(date) => date < new Date()}
            />
            <span className="text-muted-foreground/70 text-[10px]">—</span>
            <DatePicker
              date={checkOutDate}
              onSelect={(date) => {
                setCheckOutDate(date ?? null)
                onCheckOutChange?.(date ?? null)
              }}
              disabled={(date) => (checkInDate && date < checkInDate) || date < new Date()}
            />
          </SearchBarInputContainer>
        </SearchBarSection>

        {/* Guests */}
        <SearchBarSection>
          <SearchBarLabel>
            <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
            <span>Guests</span>
          </SearchBarLabel>
          <GuestSelector 
            adults={adults}
            childrenCount={childrenCount}
            onAdultsChange={onAdultsChange}
            onChildrenChange={onChildrenChange}
          />
        </SearchBarSection>

        <SearchBarSection>
          <SearchBarLabel className="relative overflow-hidden">
            <span className="absolute inset-0 bg-primary/90 -skew-x-6 origin-left" />
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
      </SearchBarContent>
    </SearchBar>
  )
}

interface DatePickerProps {
  date: Date | null
  onSelect: (date: Date | undefined) => void
  disabled: (date: Date) => boolean
}

function DatePicker({ date, onSelect, disabled }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex items-center gap-1.5 md:gap-2 font-mono text-[10px] md:text-[11px] uppercase text-foreground outline-none cursor-pointer">
          <CalendarIcon className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
          <span>{date ? format(date, "dd/MM") : "Date"}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={onSelect}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

interface GuestSelectorProps {
  adults: number
  childrenCount: number
  onAdultsChange?: (value: number) => void
  onChildrenChange?: (value: number) => void
}

function GuestSelector({ adults, childrenCount, onAdultsChange, onChildrenChange }: GuestSelectorProps) {
  const [open, setOpen] = useState(false)
  const totalGuests = adults + childrenCount
  const guestLabel = `${totalGuests} Guest${totalGuests !== 1 ? "s" : ""}`

  const handleAdultsChange = (delta: number) => {
    const newValue = Math.max(1, adults + delta)
    onAdultsChange?.(newValue)
  }

  const handleChildrenChange = (delta: number) => {
    const newValue = Math.max(0, childrenCount + delta)
    onChildrenChange?.(newValue)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div 
          className={cn(
            "flex items-center gap-2 md:gap-3 bg-secondary px-3 py-2 md:px-4 md:py-3 dark:bg-background transition-transform active:scale-[0.98]", 
            "w-full text-left outline-none transition-colors hover:bg-secondary/80 dark:hover:bg-muted/20 cursor-pointer"
          )}
          role="button"
          tabIndex={0}
        >
          <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
          <span className="font-mono text-[10px] md:text-xs uppercase text-foreground truncate">
            {totalGuests > 0 ? guestLabel : "Add"}
          </span>
        </div>
      </PopoverTrigger>
      <BrutalPopoverContent className="w-80">
        <div className="grid gap-4">
          {[
            { label: "Adults", sub: "Ages 13+", count: adults, onChange: handleAdultsChange, min: 1 },
            { label: "Children", sub: "Ages 2-12", count: childrenCount, onChange: handleChildrenChange, min: 0 }
          ].map((type, index, array) => (
            <div key={type.label}>
              <div className="flex items-center justify-between">
                <div className="grid gap-0.5">
                  <span className="font-mono text-sm font-bold uppercase">{type.label}</span>
                  <span className="text-xs text-muted-foreground">{type.sub}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="brutal" size="icon" className="h-8 w-8" onClick={() => type.onChange(-1)} disabled={type.count <= type.min}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-4 text-center font-mono text-sm font-bold">{type.count}</span>
                  <Button variant="brutal" size="icon" className="h-8 w-8" onClick={() => type.onChange(1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {index < array.length - 1 && <div className="h-[1px] w-full bg-border mt-4" />}
            </div>
          ))}
        </div>
      </BrutalPopoverContent>
    </Popover>
  )
}

interface PriceInputProps {
  value: number | ""
  onChange?: (value: number | "") => void
}

function PriceInput({ value, onChange }: PriceInputProps) {
  const [localValue, setLocalValue] = useState(value === "" ? "" : String(value))

  const handleBlurOrEnter = () => {
    if (!onChange) return
    if (localValue === "") {
      onChange("")
      return
    }
    const parsed = Number(localValue)
    if (!Number.isNaN(parsed)) {
      onChange(parsed)
    }
  }

  return (
    <div className="relative flex-1 min-w-[60px] md:min-w-[80px]">
      <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] border-[2px] border-foreground bg-foreground/10 -rotate-2" />
      <div className="relative flex items-center gap-1 bg-background px-2 py-1 md:px-3 md:py-2 border-[2px] border-foreground rotate-[-2deg]">
        <DollarSign className="h-2.5 w-2.5 md:h-3 md:w-3 text-muted-foreground shrink-0" />
        <input
          type="number"
          min={0}
          inputMode="numeric"
          className="w-full bg-transparent font-mono text-[10px] md:text-xs uppercase outline-none min-w-0"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlurOrEnter}
          onKeyDown={(e) => e.key === "Enter" && handleBlurOrEnter()}
          placeholder="500"
        />
      </div>
    </div>
  )
}

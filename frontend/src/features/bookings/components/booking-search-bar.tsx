"use client"

import { Calendar as CalendarIcon, DollarSign, MapPin, Minus, Plus, Search, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { format } from "date-fns"

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

/**
 * Barra de Pesquisa de Reservas (Booking Search Bar).
 * 
 * Componente central para filtragem de propriedades.
 * Implementa um design modular onde cada critério de busca (Destino, Datas, Hóspedes, Preço)
 * é uma seção independente.
 * 
 * Características:
 * - Inputs estilizados com ícones.
 * - Seletores de data (Date Picker) com validação de intervalo.
 * - Contador de hóspedes (Adultos/Crianças) em popover.
 * - Input numérico para preço máximo.
 * 
 * @param destination - Valor atual do filtro de destino.
 * @param adults - Número de adultos selecionados.
 * @param childrenCount - Número de crianças selecionadas.
 * @param maxPrice - Preço máximo definido pelo utilizador.
 * @param checkInDate - Data de início da estadia.
 * @param checkOutDate - Data de fim da estadia.
 * @param onDestinationChange - Callback para atualização do destino.
 * @param onAdultsChange - Callback para atualização do número de adultos.
 * @param onChildrenChange - Callback para atualização do número de crianças.
 * @param onMaxPriceChange - Callback para atualização do preço máximo.
 * @param onCheckInChange - Callback para atualização da data de check-in.
 * @param onCheckOutChange - Callback para atualização da data de check-out.
 */
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
      <SearchBarContent>
        {/* Seção 1: Destino */}
        <DestinationSection destination={destination} onChange={onDestinationChange} />
        
        {/* Seção 2: Datas (Check-in / Check-out) */}
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

        {/* Seção 3: Hóspedes */}
        <GuestsSection 
          guestsLabel={displayedGuestsLabel}
          adults={adults}
          childrenCount={childrenCount}
          onAdultsChange={onAdultsChange}
          onChildrenChange={onChildrenChange}
        />

        {/* Seção 4: Preço Máximo */}
        <PriceSection maxPrice={maxPrice} onMaxPriceChange={onMaxPriceChange} />
      </SearchBarContent>
    </SearchBar>
  )
}

// --- Sub-components ---

/**
 * Subcomponente: Seção de Destino.
 * Input de texto simples para filtrar por localização ou nome da propriedade.
 */
function DestinationSection({ destination, onChange }: { destination?: string, onChange?: (val: string) => void }) {
  return (
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
          onChange={(event) => onChange?.(event.target.value)}
        />
      </SearchBarInputContainer>
    </SearchBarSection>
  )
}

/**
 * Subcomponente: Seção de Datas.
 * Contém dois seletores de data (DatePickers) para definir o intervalo da estadia.
 * Garante que a data de check-out seja posterior à de check-in.
 */
function DatesSection({ 
  checkInDate, 
  checkOutDate, 
  onCheckInChange, 
  onCheckOutChange 
}: { 
  checkInDate: Date | null, 
  checkOutDate: Date | null, 
  onCheckInChange: (d: Date | null) => void, 
  onCheckOutChange: (d: Date | null) => void 
}) {
  return (
    <SearchBarSection className="col-span-2 md:col-span-1">
      <SearchBarLabel>
        <CalendarIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
        <span>Dates</span>
      </SearchBarLabel>
      <SearchBarInputContainer className="justify-between">
        <DatePicker
          date={checkInDate}
          onSelect={(date) => {
            onCheckInChange(date ?? null)
            // Reseta o check-out se a nova data de check-in for inválida em relação ao check-out atual
            if (date && checkOutDate && date >= checkOutDate) {
              onCheckOutChange(null)
            }
          }}
          disabled={(date) => date < new Date()}
          placeholder="Check-in"
        />
        <span className="text-muted-foreground/70 text-[10px]">—</span>
        <DatePicker
          date={checkOutDate}
          onSelect={(date) => onCheckOutChange(date ?? null)}
          disabled={(date) => (checkInDate ? date < checkInDate : date < new Date())}
          placeholder="Check-out"
        />
      </SearchBarInputContainer>
    </SearchBarSection>
  )
}

/**
 * Subcomponente: Seção de Hóspedes.
 * Exibe o total de hóspedes e abre um popover para ajuste detalhado (Adultos/Crianças).
 */
function GuestsSection({ 
  guestsLabel,
  adults, 
  childrenCount, 
  onAdultsChange, 
  onChildrenChange 
}: { 
  guestsLabel: string
  adults: number, 
  childrenCount: number, 
  onAdultsChange?: (v: number) => void, 
  onChildrenChange?: (v: number) => void 
}) {
  return (
    <SearchBarSection>
      <SearchBarLabel>
        <Users className="h-3 w-3 md:h-3.5 md:w-3.5" />
        <span>Guests</span>
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

/**
 * Subcomponente: Seção de Preço.
 * Input numérico para definir o orçamento máximo por noite.
 */
function PriceSection({ maxPrice, onMaxPriceChange }: { maxPrice: number | "", onMaxPriceChange?: (v: number | "") => void }) {
  return (
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
  )
}

// --- Helper Components ---

interface DatePickerProps {
  date: Date | null
  onSelect: (date: Date | undefined) => void
  disabled: (date: Date) => boolean
  placeholder?: string
}

/**
 * Componente Auxiliar: Seletor de Data (Date Picker).
 * Wrapper em torno do componente Calendar do shadcn/ui dentro de um Popover.
 */
function DatePicker({ date, onSelect, disabled, placeholder = "Date" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 md:gap-2 font-mono text-[10px] md:text-[11px] uppercase text-foreground outline-none cursor-pointer hover:text-primary transition-colors">
          <CalendarIcon className="h-3 w-3 md:h-3.5 md:w-3.5 text-muted-foreground" />
          <span>{date ? format(date, "dd/MM") : placeholder}</span>
        </button>
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
  guestsLabel: string
  adults: number
  childrenCount: number
  onAdultsChange?: (value: number) => void
  onChildrenChange?: (value: number) => void
}

/**
 * Componente Auxiliar: Seletor de Hóspedes.
 * Popover contendo contadores para Adultos e Crianças.
 */
function GuestSelector({ guestsLabel, adults, childrenCount, onAdultsChange, onChildrenChange }: GuestSelectorProps) {
  const [open, setOpen] = useState(false)
  const totalGuests = adults + childrenCount
  const computedLabel = `${totalGuests} Guest${totalGuests !== 1 ? "s" : ""}`

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
            {totalGuests > 0 ? guestsLabel || computedLabel : "Add"}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 border-2 border-foreground shadow-[4px_4px_0_0_rgb(0,0,0)]">
        <div className="grid gap-4">
          <GuestCounter 
            label="Adults" 
            sub="Ages 13+" 
            count={adults} 
            onChange={handleAdultsChange} 
            min={1} 
          />
          <div className="h-[1px] w-full bg-border" />
          <GuestCounter 
            label="Children" 
            sub="Ages 2-12" 
            count={childrenCount} 
            onChange={handleChildrenChange} 
            min={0} 
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Componente Auxiliar: Contador de Hóspedes.
 * Linha individual com rótulo e botões de incremento/decremento.
 */
function GuestCounter({ label, sub, count, onChange, min }: { label: string, sub: string, count: number, onChange: (d: number) => void, min: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="grid gap-0.5">
        <span className="font-mono text-sm font-bold uppercase">{label}</span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="brutal" size="icon" className="h-8 w-8" onClick={() => onChange(count - 1)} disabled={count <= min}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-4 text-center font-mono text-sm font-bold">{count}</span>
        <Button variant="brutal" size="icon" className="h-8 w-8" onClick={() => onChange(count + 1)}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

interface PriceInputProps {
  value: number | ""
  onChange?: (value: number | "") => void
}

/**
 * Componente Auxiliar: Input de Preço.
 * Campo numérico estilizado com rotação e ícone de dólar.
 * Lida com a conversão de string para número e validação básica.
 */
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

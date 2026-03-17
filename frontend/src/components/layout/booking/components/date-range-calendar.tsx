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

/**
 * Componente de Calendário de Reservas e Cálculo de Preços.
 * 
 * Este componente combina a seleção de datas (via calendário) com um resumo financeiro da reserva.
 * 
 * Funcionalidades:
 * - Seleção de intervalo de datas (check-in / check-out).
 * - Cálculo automático do número de noites.
 * - Cálculo detalhado de custos (diárias, taxa de limpeza, taxa de serviço).
 * - Botões de ação para confirmar reserva ou contactar o proprietário.
 * - Responsividade: Exibe 1 mês em mobile e 2 meses em desktop.
 * 
 * @param pricePerNight - Valor da diária da propriedade.
 * @param defaultValue - Intervalo de datas inicial (opcional).
 * @param onConfirmBooking - Callback executado ao clicar em "Reserve".
 * @param onContactOwner - Callback executado ao clicar em "Contact Owner".
 */
export function DateRangeCalendar({
  className,
  pricePerNight,
  defaultValue,
  onConfirmBooking,
  onContactOwner,
}: DateRangeCalendarProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(defaultValue)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Calcula o número de noites baseado no intervalo selecionado
  const nights = React.useMemo(() => {
    if (!date?.from || !date?.to) return 0
    const diffTime = Math.abs(date.to.getTime() - date.from.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }, [date])

  // Cálculos financeiros
  const totalPrice = nights * pricePerNight
  const serviceFee = Math.round(totalPrice * 0.12) // Taxa de serviço fixa de 12%
  const cleaningFee = 45 // Taxa de limpeza fixa
  const total = totalPrice + serviceFee + cleaningFee

  return (
    <div className={cn("grid gap-6 grid-cols-1 lg:grid-cols-[1fr_380px]", className)}>
      {/* Seção Esquerda: Calendário */}
      <CalendarSection 
        date={date} 
        setDate={setDate} 
        isDesktop={isDesktop} 
      />

      {/* Seção Direita: Resumo de Custos */}
      <div className="space-y-6">
        <BrutalCard>
          <PricingHeader 
            pricePerNight={pricePerNight} 
            nights={nights} 
          />
          
          <PricingBreakdown 
            pricePerNight={pricePerNight} 
            nights={nights} 
            totalPrice={totalPrice} 
            cleaningFee={cleaningFee} 
            serviceFee={serviceFee} 
            total={total} 
          />

          <ActionButtons 
            date={date} 
            total={total} 
            nights={nights} 
            onConfirmBooking={onConfirmBooking} 
            onContactOwner={onContactOwner} 
          />
        </BrutalCard>
      </div>
    </div>
  )
}

// --- Sub-components ---

/**
 * Subcomponente: Seção do Calendário.
 * Renderiza o componente BrutalCalendar configurado para seleção de intervalo.
 */
function CalendarSection({ 
  date, 
  setDate, 
  isDesktop 
}: { 
  date: DateRange | undefined, 
  setDate: (d: DateRange | undefined) => void, 
  isDesktop: boolean 
}) {
  return (
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
  )
}

/**
 * Subcomponente: Cabeçalho de Preço.
 * Mostra o preço por noite e o total de noites selecionadas.
 */
function PricingHeader({ pricePerNight, nights }: { pricePerNight: number, nights: number }) {
  return (
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
  )
}

/**
 * Subcomponente: Detalhamento de Custos.
 * Lista discriminada de todos os valores que compõem o preço final.
 */
function PricingBreakdown({ 
  pricePerNight, 
  nights, 
  totalPrice, 
  cleaningFee, 
  serviceFee, 
  total 
}: { 
  pricePerNight: number, 
  nights: number, 
  totalPrice: number, 
  cleaningFee: number, 
  serviceFee: number, 
  total: number 
}) {
  return (
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
  )
}

/**
 * Subcomponente: Botões de Ação.
 * Botão principal de reserva e link secundário para contato.
 * Desabilitados se o intervalo de datas não for válido.
 */
function ActionButtons({ 
  date, 
  total, 
  nights, 
  onConfirmBooking, 
  onContactOwner 
}: { 
  date: DateRange | undefined, 
  total: number, 
  nights: number, 
  onConfirmBooking?: (data: any) => void, 
  onContactOwner?: (data: any) => void 
}) {
  const isValid = date?.from && date?.to

  return (
    <>
      <Button
        variant="brutal"
        className="w-full h-12 text-base font-bold uppercase tracking-wider"
        disabled={!isValid}
        onClick={() => isValid && onConfirmBooking?.({ range: date, totalPrice: total, nights })}
      >
        Reserve
      </Button>
      
      <div className="mt-4 text-center">
         <span className="text-xs text-muted-foreground block mb-2">You won't be charged yet</span>
         <Button 
            variant="link" 
            className="h-auto p-0 text-xs text-foreground underline decoration-2 hover:text-primary"
            onClick={() => isValid && onContactOwner?.({ range: date, totalPrice: total, nights })}
         >
            Contact Owner
         </Button>
      </div>
    </>
  )
}

"use client"

import { BrutalButton } from "@/components/ui/forms/button"
import { Switch } from "@/components/ui/forms/switch"
import { ArrowLeft, ArrowRight } from "lucide-react"

export function DashboardMonthHeader({
  viewDate,
  monthNames,
  today,
  focusedPropertyLabel,
  onClearFocus,
  filterActiveOnly,
  onFilterActiveOnlyChange,
  filterWithBookingsOnly,
  onFilterWithBookingsOnlyChange,
  onPrev,
  onNext,
  onResetToday,
}: {
  viewDate: Date
  monthNames: string[]
  today: Date | null
  focusedPropertyLabel?: string
  onClearFocus?: () => void
  filterActiveOnly: boolean
  onFilterActiveOnlyChange: (value: boolean) => void
  filterWithBookingsOnly: boolean
  onFilterWithBookingsOnlyChange: (value: boolean) => void
  onPrev: () => void
  onNext: () => void
  onResetToday: () => void
}) {
  const isViewingToday =
    Boolean(today) &&
    today!.getFullYear() === viewDate.getFullYear() &&
    today!.getMonth() === viewDate.getMonth()

  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <BrutalButton onClick={onPrev}>
          <ArrowLeft size={14} />
        </BrutalButton>

        <div
          className="rounded-2xl bg-black px-4 py-3 text-xl font-black uppercase tracking-wider text-white"
          onClick={onResetToday}
        >
          {isViewingToday ? (
            <>
              <h1>TODAY is</h1>
              <span>{today!.getDate()}</span>
            </>
          ) : null}
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </div>

        <BrutalButton onClick={onNext}>
          <ArrowRight size={14} />
        </BrutalButton>

        {focusedPropertyLabel ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border-2 border-foreground bg-card/70 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-widest">
              {focusedPropertyLabel}
            </div>
            <BrutalButton
              variant="brutal-outline"
              size="xs"
              onClick={onClearFocus}
              title="Voltar a ver todas as propriedades"
            >
              Ver todas
            </BrutalButton>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 rounded-xl border-2 border-foreground/30 bg-card/60 px-3 py-2">
          <Switch
            size="sm"
            checked={filterActiveOnly}
            onCheckedChange={onFilterActiveOnlyChange}
          />
          <span className="font-mono text-[10px] font-black uppercase tracking-widest">
            Só ativas
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-xl border-2 border-foreground/30 bg-card/60 px-3 py-2">
          <Switch
            size="sm"
            checked={filterWithBookingsOnly}
            onCheckedChange={onFilterWithBookingsOnlyChange}
          />
          <span className="font-mono text-[10px] font-black uppercase tracking-widest">
            Só com reservas
          </span>
        </div>
      </div>
    </div>
  )
}

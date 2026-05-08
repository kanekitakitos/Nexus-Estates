/**
 * @file DashboardMonthHeader.tsx
 * @author Nexus Estates team
 * @description Componente de cabeçalho para o calendário do Dashboard.
 *              Inclui controlos de navegação temporal (mês anterior/seguinte), apresentação do mês focado
 *              e controlos de filtros ("Só ativas", "Só com reservas") juntamente com a visualização do foco.
 */

"use client"

import { BrutalButton } from "@/components/ui/forms/button"
import { Switch } from "@/components/ui/forms/switch"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"

/**
 * Cabeçalho do Dashboard (mês/ano, navegação, foco e filtros).
 *
 * Notas:
 * - "Só com reservas" está bloqueado via `Switch disabled` no componente;
 *   o estado vem do container e é mantido como `true` por default.
 * - O botão "Ver todas" só aparece quando existe `focusedPropertyLabel`.
 */
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
              <h1>Today is</h1>
              <span>{today!.getDate()}</span>
            </>
          ) : null}
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </div>

        <BrutalButton onClick={onNext}>
          <ArrowRight size={14} />
        </BrutalButton>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-4">
        <AnimatePresence initial={false}>
          {focusedPropertyLabel ? (
            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
            >
              <div className="max-w-[260px] truncate rounded-xl border-2 border-foreground bg-card/70 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-widest">
                {focusedPropertyLabel}
              </div>
              <motion.div
                initial={{ scale: 0.96 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
              >

                <div className="pb-2">
                <BrutalButton
                  variant="brutal-outline"
                  size="xs"
                  onClick={onClearFocus}
                  title="Voltar a ver todas as propriedades"
                >
                  Ver todas
                </BrutalButton>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

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
            disabled
          />
          <span className="font-mono text-[10px] font-black uppercase tracking-widest">
            Só com reservas
          </span>
        </div>
      </div>
    </div>
  )
}

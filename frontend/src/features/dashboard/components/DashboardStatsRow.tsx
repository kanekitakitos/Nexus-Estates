/**
 * @file DashboardStatsRow.tsx
 * @author Nexus Estates team
 * @description Linha de cartões estatísticos (KPIs) exibida no topo do dashboard.
 *              Apresenta o número de check-ins, check-outs, total de reservas e valores financeiros faturados/por faturar no mês em foco.
 */

"use client"

import { StatCard } from "@/features/property/components/property-stats"
import {
  BanknoteArrowUp,
  BanknoteX,
  SquareArrowRightEnter,
  SquareArrowRightExit,
} from "lucide-react"

/**
 * Linha de StatCards do dashboard (KPIs do mês).
 */
export function DashboardStatsRow({
  checkIn,
  checkOut,
  bookingCount,
  lucrado,
  porLucrar,
}: {
  checkIn: number
  checkOut: number
  bookingCount: number
  lucrado: number
  porLucrar: number
}) {
  const formatCurrencyText = (value: number): string => {
    const abs = Math.abs(value)
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M€`
    if (abs >= 10_000) return `${(value / 1000).toFixed(1)}K€`
    return `${value.toFixed(2)}€`
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label={"CHECK-IN"}
        value={checkIn}
        color={"text-emerald-500"}
        glowColor={"bg-emerald-500"}
        icon={SquareArrowRightEnter}
        suffix={"Enter this month"}
        index={0}
        animatedCount={false}
      />
      <StatCard
        label={"CHECK-OUT"}
        value={checkOut}
        color={"text-rose-500"}
        glowColor={"bg-rose-500"}
        icon={SquareArrowRightExit}
        suffix={"Leave this month"}
        index={0}
        animatedCount={false}
      />
      <StatCard
        label={"Reservas"}
        value={bookingCount}
        color={"text-amber-600"}
        glowColor={"bg-amber-600"}
        icon={SquareArrowRightExit}
        suffix={""}
        index={0}
        animatedCount={false}
      />
      <StatCard
        label={"Faturado"}
        value={formatCurrencyText(lucrado)}
        color={"text-lime-700"}
        glowColor={"bg-lime-700"}
        icon={BanknoteArrowUp}
        suffix={""}
        index={0}
        animatedCount={false}
      />
      <StatCard
        label={"Por faturar"}
        value={formatCurrencyText(porLucrar)}
        color={"text-sky-300"}
        glowColor={"bg-sky-300"}
        icon={BanknoteX}
        suffix={""}
        index={0}
        animatedCount={false}
      />
    </div>
  )
}

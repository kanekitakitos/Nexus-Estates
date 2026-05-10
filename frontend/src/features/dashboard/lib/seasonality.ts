/**
 * @file seasonality.ts
 * @author Nexus Estates team
 * @description Lógica de sazonalidade do Dashboard. Converte regras (intervalos + modificador de preço) num
 *              array de multiplicadores por dia do mês, usado para projeções visuais no calendário.
 */

import type { SeasonalityRuleDTO } from "@/types"
import { isDateInRange, parseISODateLocal } from "@/features/dashboard/lib/date"

const DAY_OF_WEEK: Record<number, NonNullable<SeasonalityRuleDTO["dayOfWeek"]>> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
}

function toFiniteNumber(x: unknown, fallback: number): number {
  if (typeof x === "number" && Number.isFinite(x)) return x
  if (typeof x === "string") {
    const n = Number(x)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

/**
 * Gera um multiplicador por dia do mês (default 1.0).
 *
 * Regras:
 * - se não houver regra aplicável, o dia fica a 1
 * - se houver overlap de regras, aplica o maior multiplicador
 */
export function computeSeasonalityMultipliers(
  rules: SeasonalityRuleDTO[],
  year: number,
  month: number
): number[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const multipliers = Array.from({ length: daysInMonth }, () => 1)

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day)
    let best = 1

    for (const rule of rules) {
      const start = parseISODateLocal(rule.startDate)
      const end = parseISODateLocal(rule.endDate)
      if (!isDateInRange(date, start, end)) continue

      if (rule.dayOfWeek) {
        const dow = DAY_OF_WEEK[date.getDay()]
        if (dow !== rule.dayOfWeek) continue
      }

      const modifier = toFiniteNumber(rule.priceModifier, 1)
      if (modifier > best) best = modifier
    }

    multipliers[day - 1] = best
  }

  return multipliers
}

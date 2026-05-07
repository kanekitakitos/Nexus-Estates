import type { SeasonalityRuleDTO } from "@/types"
import { isDateInRange, parseISODateLocal } from "@/features/dashboard/lib/date"

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

      const modifier = typeof rule.priceModifier === "number" ? rule.priceModifier : 1
      if (modifier > best) best = modifier
    }

    multipliers[day - 1] = best
  }

  return multipliers
}


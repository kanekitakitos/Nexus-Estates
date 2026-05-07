/**
 * @file create-calendar-items.ts
 * @author Nexus Estates team
 * @description Constrói os itens do calendário (timeline) do Dashboard a partir de propriedades e reservas,
 *              agregando períodos por propriedade e enriquecendo-os com meta para hover na UI.
 */

import type { BookingResponse, Period, PropertyListItem, TimelineItemWithNames } from "@/types"

/**
 * Constrói os items do calendário (timeline) para o dashboard.
 *
 * Responsabilidades:
 * - agrupar reservas por propriedade
 * - normalizar datas (checkIn/checkOut) para `Date`
 * - enriquecer o `Period` com meta para hover (email/guestCount)
 */
export function createCalendarItems(
  properties: PropertyListItem[],
  bookings: BookingResponse[],
  userEmailById?: Map<number, string>
): TimelineItemWithNames[] {
  const calendarItems: TimelineItemWithNames[] = []
  const colors = ["bg-red-500", "bg-green-500", "bg-blue-500", "bg-purple-500"]
  let i = 0

  properties.forEach((p) => {
    const id: number = Number(p.id)
    if (Number.isNaN(id)) return

    const bsOfP: BookingResponse[] = bookings.filter((b) => id === b.propertyId)
    const periods: Period[] = []

    bsOfP.forEach((b: BookingResponse) => {
      const fallbackName = typeof b.userId === "number" ? `User ${b.userId}` : "Unknown User"
      const email =
        typeof b.userId === "number" ? userEmailById?.get(b.userId) : undefined
      const name = email ?? fallbackName

      periods.push({
        startDay: new Date(b.checkInDate),
        endDay: new Date(b.checkOutDate),
        name,
        color: colors[i],
        meta: {
          email,
          guestCount: b.guestCount,
        },
      } as Period)

      i = (i + 1) % colors.length
    })

    calendarItems.push({
      properti: p,
      id,
      label: p.name,
      periods,
    } as TimelineItemWithNames)
  })

  return calendarItems
}

import type { BookingResponse, Period, PropertyListItem, TimelineItemWithNames } from "@/types"

export function createCalendarItems(
  properties: PropertyListItem[],
  bookings: BookingResponse[]
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
      const name =
        typeof b.userId === "number" ? `User ${b.userId}` : "Unknown User"

      periods.push({
        startDay: new Date(b.checkInDate),
        endDay: new Date(b.checkOutDate),
        name,
        color: colors[i],
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


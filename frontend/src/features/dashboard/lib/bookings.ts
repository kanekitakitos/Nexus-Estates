/**
 * @file bookings.ts
 * @author Nexus Estates team
 * @description Utilitários de reservas usados no Dashboard para suportar filtros, agregações e validações
 *              de calendário (ex.: detetar se uma propriedade tem reservas no mês em foco).
 */

import type { BookingResponse } from "@/types"

/**
 * Indica se existe pelo menos uma reserva que intersecta o mês indicado.
 *
 * A reserva conta como "no mês" se existir overlap com o intervalo [monthStart, monthEnd].
 */
export function hasBookingInMonth(
  bookings: BookingResponse[],
  year: number,
  month: number
): boolean {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)

  return bookings.some((b) => {
    const checkIn = new Date(b.checkInDate)
    const checkOut = new Date(b.checkOutDate)
    return checkIn <= monthEnd && checkOut >= monthStart
  })
}

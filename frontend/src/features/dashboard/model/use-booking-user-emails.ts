/**
 * @file use-booking-user-emails.ts
 * @author Nexus Estates team
 * @description Hook do Dashboard que resolve e memoiza emails de utilizadores associados às reservas em
 *              contexto, reduzindo requests repetidos e suportando hover rico no calendário.
 */

import { UserService } from "@/services"
import type { BookingResponse } from "@/types"
import { useEffect, useState } from "react"

/**
 * Mantém um cache local (Map) de userId -> email para as reservas em contexto.
 *
 * Objetivo: suportar hover rico no calendário sem fazer requests repetidos.
 */
export function useBookingUserEmails(filteredBookings: BookingResponse[]): Map<number, string> {
  const [userEmailById, setUserEmailById] = useState<Map<number, string>>(new Map())

  useEffect(() => {
    let cancelled = false

    const ids = Array.from(
      new Set(
        filteredBookings
          .map((b) => (typeof b.userId === "number" ? b.userId : null))
          .filter((x): x is number => typeof x === "number")
      )
    )

    const missing = ids.filter((id) => !userEmailById.has(id))
    if (missing.length === 0) return

    const load = async () => {
      const results = await Promise.allSettled(missing.map((id) => UserService.getUserId(id)))
      if (cancelled) return

      setUserEmailById((prev) => {
        const next = new Map(prev)
        results.forEach((res, idx) => {
          if (res.status !== "fulfilled") return
          const id = missing[idx]
          next.set(id, res.value.email)
        })
        return next
      })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [filteredBookings, userEmailById])

  return userEmailById
}

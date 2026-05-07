"use client"

import { useMemo } from "react"
import type { BookingResponse, BookingStatus, PropertyListItem } from "@/types"
import type { LineChartData } from "@/components/ui/data-display/Charts/ChartLineMultiple"
import type { RadarChartData } from "@/components/ui/data-display/Charts/ChartRadarLegend"
import type { BarChartData } from "@/components/ui/data-display/Charts/ChartBarMultiple"
import type { BookingsByPropertyDatum } from "@/features/dashboard/components/DashboardBookingsByPropertyChart"
import type { PieLabelDatum } from "@/components/ui/data-display/Charts/PieChart"

export function useDashboardStats({
  filteredBookings,
  filteredProperties,
  viewDate,
}: {
  filteredBookings: BookingResponse[]
  filteredProperties: PropertyListItem[]
  viewDate: Date
}): {
  checkIn: number
  checkOut: number
  lucrado: number
  porLucrar: number
  count: number
  barCharData: BarChartData[]
  radarCharData: RadarChartData[]
  lineCharData: LineChartData[]
  bookingStatusPie: PieLabelDatum[]
  bookingsByProperty: BookingsByPropertyDatum[]
} {
  return useMemo(() => {
    const totals = {
      checkIn: 0,
      checkOut: 0,
      lucrado: 0,
      porLucrar: 0,
      count: filteredBookings.length,
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const totalDailyPotentialRevenue = filteredProperties.reduce(
      (acc, p) => acc + p.basePrice,
      0
    )

    const barMap: Map<number, BarChartData> = new Map()
    filteredProperties.forEach((p) => {
      barMap.set(Number(p.id), {
        name: p.name,
        occupancy: 0,
        profit: 0,
      } as BarChartData)
    })

    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ]
    const radarData: RadarChartData[] = monthNames.map(
      (name) => ({ month: name, occupancy: 0, profit: 0 } as RadarChartData)
    )

    const daysInMonth = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth() + 1,
      0
    ).getDate()
    const lineData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      date: new Date(currentYear, currentMonth, i + 1),
      bookedCount: 0,
      profit: 0,
    }))

    filteredBookings.forEach((b) => {
      const checkIn = new Date(b.checkInDate)
      const checkOut = new Date(b.checkOutDate)

      const isSameMonth =
        checkIn.getMonth() === viewDate.getMonth() &&
        checkIn.getFullYear() === viewDate.getFullYear()

      const isSameMonthOut =
        checkOut.getMonth() === viewDate.getMonth() &&
        checkOut.getFullYear() === viewDate.getFullYear()

      if (isSameMonth) totals.checkIn++
      if (isSameMonthOut) totals.checkOut++

      if (checkOut < now) totals.lucrado += b.totalPrice
      else if (checkIn > now) totals.porLucrar += b.totalPrice

      const currentBar = barMap.get(Number(b.propertyId))
      if (
        currentBar &&
        checkIn.getMonth() <= viewDate.getMonth() &&
        checkOut.getMonth() >= viewDate.getMonth() &&
        checkIn.getFullYear() <= viewDate.getFullYear() &&
        checkOut.getFullYear() >= viewDate.getFullYear()
      ) {
        currentBar.profit += b.totalPrice

        const daysOccupied =
          (checkOut.getMonth() > viewDate.getMonth()
            ? daysInMonth
            : checkOut.getDate()) -
          (checkIn.getMonth() < viewDate.getMonth() ? 0 : checkIn.getDate()) +
          1

        currentBar.occupancy =
          ((currentBar.occupancy / 100) * daysInMonth + daysOccupied) /
          daysInMonth *
          100
      }

      if (checkIn.getFullYear() === currentYear) {
        const m = checkIn.getMonth()
        radarData[m].profit += b.totalPrice
        const daysOccupied: number =
          checkIn.getDate() +
          (checkOut.getMonth() > checkIn.getMonth()
            ? daysInMonth
            : checkOut.getDate())
        if (filteredProperties.length > 0)
          radarData[m].occupancy =
            (radarData[m].occupancy * (daysInMonth * filteredProperties.length) +
              daysOccupied) /
            (daysInMonth * filteredProperties.length)
        else radarData[m].occupancy = 0
      }

      if (
        checkIn.getFullYear() == viewDate.getFullYear() &&
        checkOut.getFullYear() == viewDate.getFullYear() &&
        checkIn.getMonth() <= viewDate.getMonth() &&
        checkOut.getMonth() >= viewDate.getMonth()
      ) {
        let day = checkIn.getMonth() == viewDate.getMonth() ? checkIn.getDate() : 0
        const endDay =
          checkOut.getMonth() == viewDate.getMonth()
            ? checkOut.getDate()
            : daysInMonth

        for (; day < endDay; day++) {
          lineData[day].bookedCount++
          lineData[day].profit += b.totalPrice
        }
      }
    })

    const statuses: BookingStatus[] = [
      "PENDING_PAYMENT",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
      "REFUNDED",
    ]
    const statusCounts = statuses.reduce<Record<BookingStatus, number>>(
      (acc, status) => {
        acc[status] = 0
        return acc
      },
      {} as Record<BookingStatus, number>
    )
    filteredBookings.forEach((b) => {
      statusCounts[b.status] = (statusCounts[b.status] ?? 0) + 1
    })
    const statusColors: Record<BookingStatus, string> = {
      PENDING_PAYMENT: "var(--chart-3)",
      CONFIRMED: "var(--chart-1)",
      CANCELLED: "var(--chart-5)",
      COMPLETED: "var(--chart-2)",
      REFUNDED: "var(--chart-4)",
    }
    const bookingStatusPie: PieLabelDatum[] = statuses.map((status) => ({
      name: status,
      value: statusCounts[status] ?? 0,
      fill: statusColors[status],
    }))

    const bookingsByPropertyMap = new Map<number, { name: string; bookings: number }>()
    filteredProperties.forEach((p) => {
      bookingsByPropertyMap.set(Number(p.id), { name: p.name, bookings: 0 })
    })
    filteredBookings.forEach((b) => {
      const entry = bookingsByPropertyMap.get(Number(b.propertyId))
      if (entry) entry.bookings += 1
    })
    const bookingsByProperty: BookingsByPropertyDatum[] = Array.from(bookingsByPropertyMap.values())
      .filter((entry) => entry.bookings > 0)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 12)

    return {
      ...totals,
      barCharData: Array.from(barMap.values()),
      radarCharData: radarData.map((m) => ({
        ...m,
        occupancy:
          filteredProperties.length > 0
            ? (m.occupancy / (filteredProperties.length * 3)) * 100
            : 0,
      })) as RadarChartData[],
      lineCharData: lineData.map((d) => ({
        day: `${d.day}`,
        occupancy:
          filteredProperties.length > 0
            ? (d.bookedCount / filteredProperties.length) * 100
            : 0,
        profit:
          totalDailyPotentialRevenue > 0
            ? (d.profit / totalDailyPotentialRevenue) * 100
            : 0,
      })) as LineChartData[],
      bookingStatusPie,
      bookingsByProperty,
    }
  }, [filteredBookings, filteredProperties, viewDate])
}

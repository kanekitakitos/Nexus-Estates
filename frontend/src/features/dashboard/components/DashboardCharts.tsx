"use client"

import { ChartLineMultiple } from "@/components/ui/data-display/Charts/ChartLineMultiple"
import { ChartRadarLegend } from "@/components/ui/data-display/Charts/ChartRadarLegend"
import { ChartBarMultiple } from "@/components/ui/data-display/Charts/ChartBarMultiple"
import { ChartPieLabel } from "@/components/ui/data-display/Charts/PieChart"
import { DashboardBookingsByPropertyChart, type BookingsByPropertyDatum } from "@/features/dashboard/components/DashboardBookingsByPropertyChart"
import type { BarChartData } from "@/components/ui/data-display/Charts/ChartBarMultiple"
import type { LineChartData } from "@/components/ui/data-display/Charts/ChartLineMultiple"
import type { RadarChartData } from "@/components/ui/data-display/Charts/ChartRadarLegend"
import type { PieLabelDatum } from "@/components/ui/data-display/Charts/PieChart"

/**
 * Grid de gráficos do dashboard.
 *
 * Nota: este bloco é renderizado apenas quando `isClient` é true para evitar
 * problemas de SSR/hydration em bibliotecas de charting.
 */
export function DashboardCharts({
  isClient,
  barCharData,
  radarCharData,
  lineCharData,
  bookingStatusPie,
  bookingsByProperty,
}: {
  isClient: boolean
  barCharData: BarChartData[]
  radarCharData: RadarChartData[]
  lineCharData: LineChartData[]
  bookingStatusPie: PieLabelDatum[]
  bookingsByProperty: BookingsByPropertyDatum[]
}) {
  if (!isClient) return null

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <div className="xl:col-span-6 xl:h-[420px]">
        <ChartLineMultiple className="h-full" chartData={lineCharData} />
      </div>
      <div className="xl:col-span-6 xl:h-[420px]">
        <DashboardBookingsByPropertyChart className="h-full" chartData={bookingsByProperty} />
      </div>
      <div className="xl:col-span-4 xl:h-[420px]">
        <ChartPieLabel
          className="h-full"
          title="Estados das Reservas"
          descriptionText="Distribuição"
          chartData={bookingStatusPie}
          heightClassName="h-full"
        />
      </div>
      <div className="xl:col-span-4 xl:h-[420px]">
        <ChartBarMultiple className="h-full" chartData={barCharData} />
      </div>
      <div className="xl:col-span-4 xl:h-[420px]">
        <ChartRadarLegend className="h-full" chartData={radarCharData} />
      </div>
    </div>
  )
}

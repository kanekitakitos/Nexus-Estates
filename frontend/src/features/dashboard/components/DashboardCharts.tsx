/**
 * @file DashboardCharts.tsx
 * @author Nexus Estates team
 * @description Componente contentor que organiza a grelha de gráficos do dashboard.
 *              Inclui gráficos de linha, barras, radar, pie chart e barras horizontais para métricas de propriedades.
 */

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
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-12">
      <div className="min-w-0 h-[360px] md:h-[420px] xl:col-span-6">
        <ChartLineMultiple className="h-full" chartData={lineCharData} />
      </div>
      <div className="min-w-0 h-[360px] md:h-[420px] xl:col-span-6">
        <DashboardBookingsByPropertyChart className="h-full" chartData={bookingsByProperty} />
      </div>
      <div className="min-w-0 h-[360px] md:h-[420px] xl:col-span-4">
        <ChartPieLabel
          className="h-full"
          title="Estados das Reservas"
          descriptionText="Distribuição"
          chartData={bookingStatusPie}
          heightClassName="h-full"
        />
      </div>
      <div className="min-w-0 h-[360px] md:h-[420px] xl:col-span-4">
        <ChartBarMultiple className="h-full" chartData={barCharData} />
      </div>
      <div className="min-w-0 h-[360px] md:h-[420px] xl:col-span-4">
        <ChartRadarLegend className="h-full" chartData={radarCharData} />
      </div>
    </div>
  )
}

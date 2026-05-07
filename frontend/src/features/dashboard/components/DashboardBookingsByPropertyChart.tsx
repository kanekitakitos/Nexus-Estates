"use client"

import { BrutalCard } from "@/components/ui/data-display/brutal-card"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/data-display/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/data-display/Charts/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"

export type BookingsByPropertyDatum = {
  name: string
  bookings: number
}

const chartConfig = {
  bookings: { label: "Reservas", color: "var(--chart-1)" },
} satisfies ChartConfig

export function DashboardBookingsByPropertyChart({
  chartData,
  className,
  title = "Reservas por Propriedade",
  descriptionText = "Top por volume",
}: {
  chartData: BookingsByPropertyDatum[]
  className?: string
  title?: string
  descriptionText?: string
}) {
  return (
    <BrutalCard className={cn("flex flex-col bg-card", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{descriptionText}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 12, top: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={140}
              tickFormatter={(value) =>
                typeof value === "string" ? value.slice(0, 18) : String(value)
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) => `${value} reservas`}
                />
              }
            />
            <Bar
              name="bookings"
              dataKey="bookings"
              fill="var(--color-bookings)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </BrutalCard>
  )
}

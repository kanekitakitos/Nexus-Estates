"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/data-display/card"
import { BrutalCard } from "@/components/ui/data-display/brutal-card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/data-display/Charts/chart"
import { cn } from "@/lib/utils"

export const description = "A multiple line chart"

export type LineChartData = {
    day :string,
    occupancy : number,
    profit :number
}

const chartConfig = {
    occupancy: {
        label: "occupancy",
        color: "var(--chart-1)",
    },
    profit: {
        label: "profit",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function ChartLineMultiple({ className, chartData }: { className?: string, chartData?: LineChartData[] }) {
    return (
        <BrutalCard className={cn("flex flex-col bg-card", className)}>
            <CardHeader>
                <CardTitle>Performance de Reservas</CardTitle>
                <CardDescription>Ocupação vs Lucro Diário</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart data={chartData} margin={{ left: 0, right: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent formatter={(value, name) => (
                                <span>{value}{name === "occupancy" ? "%" : "€"}</span>
                            )}/>}
                        />
                        <Line
                            dataKey="occupancy"
                            type="monotone"
                            stroke="var(--color-occupancy)"
                            strokeWidth={3} // Um pouco mais grossa para destacar
                            dot={true}      // Pontos ajudam a ler percentagens exatas
                        />
                        <Line
                            dataKey="profit"
                            type="monotone"
                            stroke="var(--color-profit)"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">
                            Showing total visitors for the last 6 months
                        </div>
                    </div>
                </div>
            </CardFooter>
        </BrutalCard>
    )
}

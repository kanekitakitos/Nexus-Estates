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
    type ChartConfig, ChartLegend, ChartLegendContent,
} from "@/components/ui/data-display/Charts/chart"
import { cn } from "@/lib/utils"
import {useMemo} from "react";

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

export function ChartLineMultiple({ className, chartData }: { className?: string, chartData: LineChartData[] }) {

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
                            tickLine={true}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            tickLine={true}
                            axisLine={true}
                            tickFormatter={(value) => `${value}€`}
                        />

                        {/* Eixo Y Direito - Ocupação (%) */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickLine={true}
                            axisLine={true}
                            domain={[0, 100]} // Força o máximo a ser 100%
                            tickFormatter={(value) => `${value}%`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="line"
                                    // Customizar o formatter para mostrar o valor real
                                    formatter={(value, name, item) => {
                                        if (name === "occupancy") return `${item.payload.occupancy}%`;
                                        if(name === "profit") return `${item.payload.profit}€`
                                        return value;
                                    }}
                                />
                            }
                        />
                        <ChartLegend content={<ChartLegendContent />}/>
                        <Line
                            yAxisId="right"
                            name="occupancy"
                            dataKey="occupancy"
                            type="monotone"
                            stroke="var(--color-occupancy)"
                            strokeWidth={3} // Um pouco mais grossa para destacar
                            dot={true}      // Pontos ajudam a ler percentagens exatas
                        />
                        <Line
                            yAxisId="left"
                            name="profit"
                            dataKey="profit"
                            type="monotone"
                            stroke="var(--color-profit)"
                            strokeWidth={2}
                        />
                    </LineChart>

                </ChartContainer>
            </CardContent>

        </BrutalCard>
    )
}

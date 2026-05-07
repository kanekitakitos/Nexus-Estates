"use client"

import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/data-display/card"
import { BrutalCard } from "@/components/ui/data-display/brutal-card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig, ChartLegendContent, ChartLegend,
} from "@/components/ui/data-display/Charts/chart"
import {useMemo} from "react";
import { cn } from "@/lib/utils";

export const description = "A multiple bar chart"

const chartData_MOCK = [
    { name: "January", occupancy: 186, profit: 80 },
    { name: "February", occupancy: 305, profit: 200 },
    { name: "March", occupancy: 237, profit: 120 },
    { name: "April", occupancy: 73, profit: 190 },
    { name: "May", occupancy: 209, profit: 130 },
    { name: "June", occupancy: 214, profit: 140 },
] as BarChartData[]

export type BarChartData = {
    name :string,
    occupancy : number,
    profit :number
}


const chartConfig = {
    occupancy: {
        label: "Ocupação",
        color: "var(--chart-1)",
    },
    profit: {
        label: "Lucro",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function ChartBarMultiple({
    chartData = chartData_MOCK,
    className,
}: {
    chartData : BarChartData[]
    className?: string
}) {


    return (
        <BrutalCard className={cn("flex flex-col bg-card overflow-hidden", className)}>
            <CardHeader className="pb-3">
                <CardTitle>Bar Chart - Multiple</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
                    <BarChart accessibilityLayer data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 5)}
                        />
                        {/* Eixo Esquerdo - Lucro (€) */}
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            tickLine={true}
                            axisLine={true}
                            tickFormatter={(v) => `${v}€`}
                        />

                        {/* Eixo Direito - Ocupação (0-100%) */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickLine={true}
                            axisLine={true}
                            domain={[0, 100]} // Define o máximo fixo em 100
                            tickFormatter={(v) => `${v}%`}
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
                        <Bar
                            yAxisId="right"
                            name="occupancy"
                            dataKey="occupancy"
                            fill="var(--color-occupancy)"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            yAxisId="left"
                            name="profit"
                            dataKey="profit"
                            fill="var(--color-profit)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </BrutalCard>
    )
}

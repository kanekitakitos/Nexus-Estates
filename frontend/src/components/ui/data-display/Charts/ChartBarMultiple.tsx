"use client"

import { TrendingUp } from "lucide-react"
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts"

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
    type ChartConfig, ChartLegendContent, ChartLegend,
} from "@/components/ui/data-display/Charts/chart"
import {useMemo} from "react";

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

export function ChartBarMultiple({chartData = chartData_MOCK} : {chartData : BarChartData[]}) {


    return (
        <BrutalCard>
            <CardHeader>
                <CardTitle>Bar Chart - Multiple</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
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
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total visitors for the last 6 months
                </div>
            </CardFooter>
        </BrutalCard>
    )
}

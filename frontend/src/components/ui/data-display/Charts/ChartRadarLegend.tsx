"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

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
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/data-display/Charts/chart"
import {useMemo} from "react";

export const description = "A radar chart with a legend"


export type RadarChartData = {
    month :string,
    occupancy :number,
    profit :number
}

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "var(--chart-1)",
    },
    profit: {
        label: "Lucro",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function ChartRadarLegend({chartData} : { chartData:RadarChartData[] }) {

    // Normalizar os dados
    const processedData = useMemo(() => {
        if (!chartData.length) return [];

        // Encontrar o maior lucro para servir de "teto"
        const maxProfit = Math.max(...chartData.map(d => d.profit), 1); // evita divisão por zero

        return chartData.map(item => ({
            ...item,
            // O valor visual: (percentagem / 100) * valor máximo do lucro
            normalizedOccupancy: (item.occupancy / 100) * maxProfit,
            // Guardamos o original para o tooltip se necessário,
            // mas o Recharts já tem acesso ao item original
        }));
    }, [chartData]);

    return (
        <BrutalCard className={"bg-card"}>
            <CardHeader className="items-center">
                <CardTitle>Radar Chart - Legend</CardTitle>
                <CardDescription>
                    Showing total visitors for the last 6 months
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <RadarChart
                        data={processedData}
                        margin={{
                            top: -40,
                            bottom: -10,
                            left: 0,
                            right: 0,
                        }}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="line"
                                    // CORREÇÃO 2: Formatar o valor no Tooltip para mostrar os 0-100% originais
                                    formatter={(value, name, props) => {
                                        if (name === "occupancy") {
                                            return `${props.payload.occupancy}%`;
                                        }
                                        // Formata como moeda se for lucro (opcional)
                                        if (name === "profit") {
                                            return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value as number);
                                        }
                                        return value;
                                    }}
                                />
                            }
                        />
                        <PolarAngleAxis dataKey="month" />
                        <PolarGrid />
                        <Radar
                            name="occupancy"
                            dataKey="normalizedOccupancy"
                            fill="var(--color-desktop)"
                            dot={{
                                r: 1.5,
                                fillOpacity: 1,
                            }}
                        />
                        <Radar
                            name={"profit"}
                            dataKey="profit"
                            fill="var(--color-profit)"
                            fillOpacity={0.6}
                            dot={{
                                r: 1.5,
                                fillOpacity: 1,
                            }}
                        />
                        <ChartLegend className="mt-8" content={<ChartLegendContent />} />
                    </RadarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 pt-4 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                    Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    January - June 2024
                </div>
            </CardFooter>
        </BrutalCard>
    )
}

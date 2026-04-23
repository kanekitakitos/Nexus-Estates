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
    mobile: {
        label: "Mobile",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function ChartRadarLegend({chartData} : { chartData?:RadarChartData[] }) {
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
                        data={chartData}
                        margin={{
                            top: -40,
                            bottom: -10,
                            left: 0,
                            right: 0,
                        }}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <PolarAngleAxis dataKey="month" />
                        <PolarGrid />
                        <Radar
                            dataKey="occupancy"
                            fill="var(--color-desktop)"
                            dot={{
                                r: 4,
                                fillOpacity: 1,
                            }}
                        />
                        <Radar
                            dataKey="profit"
                            fill="var(--color-mobile)"
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

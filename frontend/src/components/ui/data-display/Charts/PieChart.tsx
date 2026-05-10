"use client"

import { Pie, PieChart } from "recharts"

import {
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
    type ChartConfig,
} from "@/components/ui/data-display/Charts/chart"
import {cn} from "@/lib/utils";

export const description = "A pie chart with a label"

export type PieLabelDatum = {
    name: string
    value: number
    fill?: string
}

const defaultChartConfig = {} satisfies ChartConfig

export function ChartPieLabel({
    className,
    title = "Pie Chart",
    descriptionText,
    chartData,
    chartConfig = defaultChartConfig,
    heightClassName = "max-h-[240px]",
}: {
    className?: string
    title?: string
    descriptionText?: string
    chartData: PieLabelDatum[]
    chartConfig?: ChartConfig
    heightClassName?: string
}) {
    const dataWithFill = chartData.map((item) => ({
        ...item,
        fill: item.fill ?? `var(--color-${item.name})`,
    }))

    return (
        <BrutalCard className={cn("flex flex-col bg-card overflow-hidden", className)}>
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                {descriptionText ? <CardDescription>{descriptionText}</CardDescription> : null}
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex items-center justify-center pb-0">
                <ChartContainer
                    config={chartConfig}
                    className={cn(
                        "mx-auto aspect-square w-full pb-0 [&_.recharts-pie-label-text]:fill-foreground",
                        heightClassName
                    )}
                >
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie data={dataWithFill} dataKey="value" label nameKey="name" />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </BrutalCard>
    )
}

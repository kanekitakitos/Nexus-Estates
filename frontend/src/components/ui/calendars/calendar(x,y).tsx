"use client"

import React, { useEffect, useRef } from "react";
import { BrutalCard } from "../data-display/brutal-card";
import { Period, TimelineItemWithNames } from "@/types";
import {ActiveArea} from "@/components/ui/calendars/components/ActiveArea";
import { SeasonalityMultiplierRow } from "@/components/ui/calendars/components/SeasonalityMultiplierRow";

const border = {
    b: "border-b-0",
    r: "border-r-2",
    color: "border-black",
}

export interface CalendarTimelineProps {
    items: TimelineItemWithNames[];
    year: number;
    month: number;
    onClickData?: (item: TimelineItemWithNames) => void;
    onClickActiveArea?: (period: Period) => void;
    scroolOnScroolEvent? : boolean;
    density?: "compact" | "comfortable";
    maxHeightClassName?: string;
    headerLeft?: React.ReactNode;
    /**
     * Sazonalidade (multiplicadores de preço) para a propriedade em foco.
     * Deve ser passado apenas quando o calendário está filtrado para uma propriedade.
     */
    seasonality?: {
        multipliers: number[];
    };
}

/**
 *
 * @param items
 * @param year
 * @param month - Janeiro = 0, Fevereiro = 1, ...
 * @param title
 * @constructor
 */
export function CalendarTimeline({
    items,
    year,
    month,
    onClickData,
    onClickActiveArea,
    scroolOnScroolEvent = true,
    density = "comfortable",
    maxHeightClassName = "max-h-[520px]",
    headerLeft,
    seasonality,
}: CalendarTimelineProps) {
    const dayWidth = density === "compact" ? 38 : 56
    const cellW = density === "compact" ? "w-[38px]" : "w-14"
    const cellH = density === "compact" ? "h-12" : "h-16"
    const labelW = density === "compact" ? "w-32" : "w-48"
    const dayLetterClass = density === "compact" ? "text-[10px]" : "text-ms"
    const dayNumberClass = density === "compact" ? "text-base" : "text-lg"
    const gapY = density === "compact" ? "gap-4" : "gap-5"
    const activeAreaHeight = density === "compact" ? 34 : 48
    const activeAreaTop = density === "compact" ? 7 : 8

    // Calcular número de dias no mês
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Define o controlo da roda do rato
    useEffect(() => {
        if (!scroolOnScroolEvent)
            return;
        const el = scrollRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            el.scrollLeft += e.deltaX;
            return;
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [scroolOnScroolEvent]);

    return (
        <div className="flex relative w-full">

            <div
                id={"calender"}
                ref={scrollRef}
                className={`overflow-auto ${maxHeightClassName} pe-5 pb-5 bg-transparent ${border.color}
                /* 1. Definimos a altura da scrollbar */
                [&::-webkit-scrollbar]:h-4
                
                /* 2. Estilo da Track (Trilho) */
                [&::-webkit-scrollbar-track]:bg-zinc-200
                [&::-webkit-scrollbar-track]:rounded-full
                [&::-webkit-scrollbar-track]:border-2
        
                /* 3. O Puxador (Thumb) com o "espaço" */
                [&::-webkit-scrollbar-thumb]:bg-black
                [&::-webkit-scrollbar-thumb]:rounded-full
                
                /* A MÁGICA: Borda transparente + clip */
                [&::-webkit-scrollbar-thumb]:border-[4px]
                [&::-webkit-scrollbar-thumb]:border-transparent
                [&::-webkit-scrollbar-thumb]:bg-clip-padding
                `}
            >

                <div className={`flex flex-col ${gapY} min-w-max w-fit mx-auto`}>

                    <BrutalCard className={"sticky top-0 z-30 p-0 bg-card overflow-clip"}>
                        {/* Header - Dias do mês */}
                        <div id={"Item Header"}
                             className="flex"
                        >
                            <div
                                className={`sticky left-0 z-20 ${labelW} bg-card ${border.r} ${border.color}  p-4`}>
                                <div className="flex items-center gap-2">
                                    {headerLeft}
                                </div>
                            </div>

                            <div id={"days"} className="flex">
                                {days.map((day, index) => {
                                    const date = new Date(year, month, day);
                                    const dayOfWeek = date.getDay();
                                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                    const isLast = days.length == index + 1;

                                    return (
                                        <div
                                            key={day}
                                            className={`${cellH} ${cellW} flex-shrink-0 flex items-center justify-center ${isLast ? "" : border.r} ${border.color}  ${
                                                isWeekend ? 'bg-primary text-white' : ''
                                            }`}
                                        >
                                            <div className="text-center">
                                                <div className={`${dayLetterClass} font-mono font-bold`}>
                                                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][dayOfWeek]}
                                                </div>
                                                <div className={`${dayNumberClass} font-mono font-bold`}>{day}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </BrutalCard>

                    {/* Linhas - Items */}
                    {items.map((item, indx) => (
                        <React.Fragment key={indx}>
                            <BrutalCard className={"p-0 bg-card overflow-clip"}>
                                <div id={String(item.id)} key={item.id}
                                     className={`flex ${border.color}`}
                                >

                                    {/* Item lables*/}
                                    <div
                                        id={"item label"}
                                        className={`sticky left-0 z-10 ${labelW} bg-card ${border.r} ${border.color} p-4 flex items-center`}
                                        onClick={()=>onClickData?.(item)}
                                    >
                                    <span className="truncate font-bold uppercase text-sm">{
                                        item.label
                                    }</span>
                                    </div>

                                    <div className={`flex relative overflow-hidden ${cellH}`}>

                                        {days.map((day, index) => {
                                            const date = new Date(year, month, day);
                                            const dayOfWeek = date.getDay();
                                            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                            const isLast = days.length == index + 1;

                                            return (
                                                <div
                                                    key={day}
                                                    className={`${cellW} ${cellH} ${isLast ? "" : border.r} ${border.color}
                                                ${isWeekend ? 'bg-primary text-white' : ""}
                                            `}
                                                />
                                            )
                                        })}

                                        {item.periods.map((period, idx) => {
                                            // Verifica se existe alguém que acaba exatamente quando este começa
                                            const hasLeftNeighbor = item.periods.some(p => p !== period && p.endDay.getTime() === period.startDay.getTime());
                                            // Verifica se existe alguém que começa exatamente quando este acaba
                                            const hasRightNeighbor = item.periods.some(p => p !== period && p.startDay.getTime() === period.endDay.getTime());

                                            if (period.startDay < new Date(year, month+1, 1) && period.endDay >= new Date(year, month, 1))
                                                return (
                                                    <ActiveArea
                                                        year={year}
                                                        month={month}
                                                        key={idx}
                                                        period={period}
                                                        isStart={!hasLeftNeighbor}
                                                        isEnd={!hasRightNeighbor}
                                                        pading_x={5}
                                                        dayWidth={dayWidth}
                                                        height={activeAreaHeight}
                                                        top={activeAreaTop}
                                                        onClick={()=>onClickActiveArea?.(period)}
                                                    />
                                                )
                                        })}
                                    </div>
                                </div>
                            </BrutalCard>

                            {seasonality && items.length === 1 && indx === 0 ? (
                                <BrutalCard className={"p-0 bg-card overflow-clip"}>
                                    <SeasonalityMultiplierRow
                                        year={year}
                                        month={month}
                                        dayWidth={dayWidth}
                                        cellWClassName={cellW}
                                        cellHClassName={cellH}
                                        rowCellClassName={`flex relative overflow-hidden h-8`}
                                        labelClassName={`sticky left-0 z-10 ${labelW} bg-card ${border.r} ${border.color} px-4 flex items-center`}
                                        borderRightClassName={border.r}
                                        borderColorClassName={border.color}
                                        multipliers={seasonality.multipliers}
                                    />
                                </BrutalCard>
                            ) : null}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}

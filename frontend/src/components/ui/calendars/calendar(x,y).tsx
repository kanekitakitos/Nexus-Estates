
import React, {MouseEventHandler, useEffect, useRef} from "react";
import Link from "next/link"
import { BrutalCard } from "../data-display/brutal-card";
import {OwnProperty, Period, TimelineItemWithNames} from "@/types";
import {ActiveArea} from "@/components/ui/calendars/components/ActiveArea";

const cell ={
    w: "w-14",
    h: "h-16"
}
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
}

/**
 *
 * @param items
 * @param year
 * @param month - Janeiro = 0, Fevereiro = 1, ...
 * @param title
 * @constructor
 */
export function CalendarTimeline({ items, year, month, onClickData, onClickActiveArea, scroolOnScroolEvent = true}: CalendarTimelineProps) {
    // Calcular número de dias no mês
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);


    const isThisMonth = year == new Date().getFullYear()

    // Nomes dos meses
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const scrollRef = useRef<HTMLDivElement>(null);

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
    }, []);

    return (
        <div className="flex relative w-full">

            <div
                id={"calender"}
                ref={scrollRef}
                className={`overflow-x-auto pe-5 pb-5 bg-transparent ${border.color}
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

                <div className="flex flex-col gap-5 min-w-max">

                    <BrutalCard className={"p-0 bg-card overflow-clip"}>
                        {/* Header - Dias do mês */}
                        <div id={"Item Header"}
                             className="flex"
                        >
                            <div
                                className={`sticky left-0 z-20 w-48 bg-card ${border.r} ${border.color}  p-4`}>
                                <span className="font-mono font-bold uppercase text-sm"></span>
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
                                            className={`${cell.h} ${cell.w} flex-shrink-0 flex items-center justify-center ${isLast ? "" : border.r} ${border.color}  ${
                                                isWeekend ? 'bg-primary text-white' : ''
                                            }`}
                                        >
                                            <div className="text-center">
                                                <div className="text-ms font-mono font-bold">
                                                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'][dayOfWeek]}
                                                </div>
                                                <div className="text-lg font-mono font-bold">{day}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </BrutalCard>

                    {/* Linhas - Items */}
                    {items.map((item, indx) => (
                        <BrutalCard key={indx} className={"p-0 bg-card overflow-clip"}>
                            <div id={String(item.id)} key={item.id}
                                 className={`flex ${border.color}`}
                            >

                                {/* Item lables*/}
                                <div
                                    id={"item label"}
                                    className={`sticky left-0 z-10 w-48 bg-card ${border.r} ${border.color} p-4 flex items-center`}
                                    onClick={()=>onClickData?.(item)}
                                >
                                <span className="truncate font-bold uppercase text-sm">{
                                    item.label
                                }</span>
                                </div>

                                <div className="flex relative overflow-hidden" style={{height: '64px'}}>

                                    {days.map((day, index) => {
                                        const date = new Date(year, month, day);
                                        const dayOfWeek = date.getDay();
                                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                        const isLast = days.length == index + 1;

                                        return (
                                            <div
                                                key={day}
                                                className={`${cell.w} ${cell.h} ${isLast ? "" : border.r} ${border.color}
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
                                                    onClick={()=>onClickActiveArea?.(period)}
                                                />
                                            )
                                    })}
                                </div>
                            </div>
                        </BrutalCard>
                    ))}
                </div>
            </div>
        </div>
    );
}

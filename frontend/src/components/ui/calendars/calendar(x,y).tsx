
import React from "react";
import Link from "next/link"
import { BrutalCard } from "../data-display/brutal-card";
import {OwnProperty, Period, TimelineItemWithNames} from "@/types";
import {ActiveArea} from "@/components/ui/calendars/components/ActiveArea";

const cell ={
    w: "w-14",
    h: "h-16"
}
const border = {
    b: "border-b-",
    r: "border-r-2",
    color: "border-black",
}

export interface CalendarTimelineProps {
    items: TimelineItemWithNames[];
    year: number;
    month: number;
}

/**
 *
 * @param items
 * @param year
 * @param month - Janeiro = 0, Fevereiro = 1, ...
 * @param title
 * @constructor
 */
export function CalendarTimeline({ items, year, month }: CalendarTimelineProps) {
    // Calcular número de dias no mês
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1);

    const isThisMonth = year == new Date().getFullYear()

    // Nomes dos meses
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return (
        <div className="flex relative w-full">

            <BrutalCard id={"calender"} className={`block overflow-x-auto p-0 pb-0 bg-card ${border.color}`}>

                <div className="min-w-max">

                    {/* Header - Dias do mês */}
                    <div id={"Item Header"} className="flex">
                        <div
                            className={`sticky left-0 z-20 w-48 flex-shrink-0 bg-card ${border.r} ${border.color}  p-4`}>
                            <span className="font-mono font-bold uppercase text-sm"></span>
                        </div>

                        <div id={"days"} className="flex">
                            {days.map((day) => {
                                const date = new Date(year, month, day);
                                const dayOfWeek = date.getDay();
                                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                                return (
                                    <div
                                        key={day}
                                        className={`${cell.h} ${cell.w} flex-shrink-0 flex items-center justify-center ${border.r} ${border.color}  ${
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

                    {/* Linhas - Items */}
                    {items.map((item) => (
                        <div id={String(item.id)} key={item.id} className={`flex border-t-4 ${border.color}`}>

                            {/* Item lables*/}
                            <div
                                id={"item label"}
                                className={`sticky left-0 z-10 w-48 bg-secondary ${border.r} ${border.color} p-4 flex items-center`}
                            >
                                <span className="truncate font-bold uppercase text-sm">{
                                    item.label
                                }</span>
                            </div>

                            <div className="flex relative overflow-hidden" style={{height: '64px'}}>

                                {days.map((day) => {
                                    const date = new Date(year, month, day);
                                    const dayOfWeek = date.getDay();
                                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                                    return (
                                        <div
                                            key={day}
                                            className={`${cell.w} ${cell.h} ${border.r} ${border.color}
                                            ${isWeekend ? 'bg-primary text-white' : ""}
                                        `}
                                        />
                                    )
                                })}

                                {item.periods.map((period, idx) => {
                                    // Verifica se existe alguém que acaba exatamente quando este começa
                                    const hasLeftNeighbor = item.periods.some(p => p !== period && p.endDay === period.startDay);
                                    // Verifica se existe alguém que começa exatamente quando este acaba
                                    const hasRightNeighbor = item.periods.some(p => p !== period && p.startDay === period.endDay);

                                    return (
                                        <ActiveArea
                                            year={year}
                                            month={month}
                                            key={idx}
                                            period={period}
                                            isStart={!hasLeftNeighbor}
                                            isEnd={!hasRightNeighbor}
                                        />
                                    )

                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </BrutalCard>
        </div>
    );
}

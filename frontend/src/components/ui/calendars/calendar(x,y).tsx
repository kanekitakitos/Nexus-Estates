
import React from "react";
import {ReactElement} from "react";
import {formatDate} from "date-fns";
import { BrutalCard } from "../data-display/brutal-card";

interface TimelineItemWithNames {
    id: string;
    label: string;
    periods: period[];
}

interface period {
    startDay: number;
    endDay: number;
    name: string;
    color: string;
}

interface CalendarTimelineProps {
    items: TimelineItemWithNames[];
    year: number;
    month: number;
    title: string;
}


const cell ={
    w: "w-14",
    h: "h-16"
}
const border = {
    b: "border-b-",
    r: "border-r-2",
    color: "border-black",
}


export function CalendarTimeline({ items, year, month, title }: CalendarTimelineProps) {
    // Calcular número de dias no mês
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const isThisMonth = year == new Date().getFullYear()

    // Nomes dos meses
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return (
        <div className="relative w-full">
            {/* Título e Data */}
            <div className="mb-4">
                <h2 className="mb-6 uppercase tracking-tight border-b-8 border-black pb-2 font-black">{title}</h2>
                <div className="text-xl mb-4 font-black uppercase tracking-wider bg-black text-white px-4 py-3 inline-block">
                    {monthNames[month]} {year}
                </div>
            </div>

            <BrutalCard id={"calender"} className={`block overflow-x-auto p-0 pb-0 bg-card ${border.color}`}>

                <div className="min-w-max">

                    {/* Header - Dias do mês */}
                    <div id={"Item Header"} className="flex">
                        <div className={`sticky left-0 z-20 w-48 flex-shrink-0 bg-card ${border.r} ${border.color}  p-4`}>
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
                        <div id={item.id} key={item.id} className={`flex border-t-4 ${border.color}`}>

                            {/* Item lables*/}
                            <div id={"item label"} className={`sticky left-0 z-10 w-48 bg-secondary ${border.r} ${border.color} p-4 flex items-center`}>
                                <span className="truncate font-bold uppercase text-sm">{item.label}</span>
                            </div>

                            <div className="flex relative" style={{ height: '64px' }}>
                                
                                {days.map((day) => {
                                    const date = new Date(year, month, day);
                                    const dayOfWeek = date.getDay();
                                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                                    return(
                                    <div
                                        key={day}
                                        className={`${cell.w} ${cell.h} ${border.r} ${border.color}
                                            ${isWeekend ? 'bg-primary text-white' : ""}
                                        `}
                                    />
                                )})}

                                {item.periods.map((period, idx) => (
                                    <ActiveArea key={idx} period={period}/>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </BrutalCard>
        </div>
    );
}


function ActiveArea({id, period}:{id?:number, period: period}){
    // Largura de cada célula de dia
    const dayWidth = 56; // w-16 = 3.5rem = 56px
    const lineH = 2

    const startPos = (period.startDay - 1) * dayWidth;
    const duration = period.endDay - period.startDay + 1;
    const width = duration * dayWidth - 4; // -4 para compensar bordas

    return (
        <div
            key={id}
            className={`absolute ${period.color} flex items-center justify-start px-3 overflow-hidden`}
            style={{
                left: `${startPos}px`,
                width: `${width}px`,
                height: '48px',
                top: '8px',
                borderRadius: '24px',
            }}
        >
            <span className="font-mono font-bold uppercase text-sm text-black truncate drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
              {period.name}
            </span>
        </div>
    );
}

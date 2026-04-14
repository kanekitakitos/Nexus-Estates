
import React from "react";
import Link from "next/link"
import { BrutalCard } from "../data-display/brutal-card";
import {OwnProperty} from "@/types";

interface TimelineItemWithNames {
    properti : OwnProperty
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
                            <Link
                                id={"item label"}
                                className={`sticky left-0 z-10 w-48 bg-secondary ${border.r} ${border.color} p-4 flex items-center`}
                                href={item.properti ? `/properties/${item.properti.id}` : "#"}
                            >
                                <span className="truncate font-bold uppercase text-sm">{
                                    item.label
                                }</span>
                            </Link>

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

                                {item.periods.map((period, idx) => {
                                    // Verifica se existe alguém que acaba exatamente quando este começa
                                    const hasLeftNeighbor = item.periods.some(p => p !== period && p.endDay === period.startDay);
                                    // Verifica se existe alguém que começa exatamente quando este acaba
                                    const hasRightNeighbor = item.periods.some(p => p !== period && p.startDay === period.endDay);

                                    return (
                                        <ActiveArea
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

function ActiveArea({ period, isStart, isEnd }: { period: period, isStart: boolean, isEnd: boolean }) {
    const dayWidth = 56; // w-14

    // Se houver transição, esticamos um pouco a largura para elas se sobreporem e o corte ser visível
    const startPos = (period.startDay - 1) * dayWidth;
    const duration = period.endDay - period.startDay + 1;

    // Ajuste de largura: se não houver vizinho, damos um pequeno gap (como tinhas antes)
    // Se houver vizinho, a largura vai até ao limite exato para o clip-path funcionar
    const width = duration * dayWidth;

    // Definição do Clip Path (O segredo do corte oblíquo)
    // Se for meio: corta esquerda e direita. Se for ponta: só corta um lado.
    const slant = 15; // Inclinação em pixels
    const clipPath = `polygon(
        ${isStart ? '0% 0%' : `${slant}px 0%`}, 
        ${isEnd ? '100% 0%' : `100% 0%`}, 
        ${isEnd ? '100% 100%' : `calc(100% - ${slant}px) 100%`}, 
        ${isStart ? '0% 100%' : '0% 100%'}
    )`;

    return (
        <div
            className={`absolute ${period.color} flex items-center px-4 group transition-all`}
            style={{
                left: `${startPos}px`,
                width: `${width}px`,
                height: '48px',
                top: '8px',
                zIndex: 5,
                clipPath: clipPath,
                // Raio apenas nas extremidades reais da sequência
                borderTopLeftRadius: isStart ? '24px' : '0',
                borderBottomLeftRadius: isStart ? '24px' : '0',
                borderTopRightRadius: isEnd ? '24px' : '0',
                borderBottomRightRadius: isEnd ? '24px' : '0',
            }}
        >
            {/* O "Traço Oblíquo" (apenas se tiver vizinho à direita) */}
            {!isEnd && (
                <div
                    className="absolute right-0 top-0 h-full w-[4px] bg-black"
                    style={{
                        transform: `skewX(-${slant}deg)`,
                        transformOrigin: 'top',
                        marginRight: '-2px'
                    }}
                />
            )}

            <span className="font-mono font-bold uppercase text-xs text-black truncate relative z-10">
                {period.name}
            </span>
        </div>
    );
}
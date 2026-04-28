
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
    onClickData?: MouseEventHandler<HTMLDivElement> | undefined;
    onClickActiveArea?: MouseEventHandler<HTMLDivElement> | undefined;
}

/**
 *
 * @param items
 * @param year
 * @param month - Janeiro = 0, Fevereiro = 1, ...
 * @param title
 * @constructor
 */
export function CalendarTimeline({ items, year, month, onClickData, onClickActiveArea }: CalendarTimelineProps) {
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
        const el = scrollRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            // Apenas interceptamos se for um scroll vertical (deltaY)
            // Se o utilizador já estiver a fazer scroll horizontal nativo (deltaX), deixamos o browser agir.
            if (e.deltaY === 0 || e.deltaX !== 0) return;

            const isAtStart = el.scrollLeft <= 0;
            const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1; // -1 para margem de erro de pixel

            const scrollingUp = e.deltaY < 0;
            const scrollingDown = e.deltaY > 0;

            // CONDIÇÕES PARA NÃO CONSUMIR O EVENTO (Deixar a página rolar):
            // 1. Está no início e quer subir
            if (isAtStart && scrollingUp) {
                return; // Sai da função sem preventDefault()
            }

            // 2. Está no fim e quer descer
            if (isAtEnd && scrollingDown) {
                return; // Sai da função sem preventDefault()
            }

            // CASO CONTRÁRIO: Consumimos o evento e movemos a timeline
            e.preventDefault();
            el.scrollLeft += e.deltaY;
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

                    <BrutalCard className={"p-0 bg-card"}>
                    {/* Header - Dias do mês */}
                    <div id={"Item Header"}
                         className="flex"
                         style={{
                             clipPath: 'inset(0px round 2rem)', // '2rem' equivale ao 'rounded-4xl' (32px)
                             WebkitClipPath: 'inset(0px round 2rem)' // Suporte para Safari
                         }}
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
                        <BrutalCard key={indx} className={"p-0 bg-card"}>
                        <div id={String(item.id)} key={item.id}
                             className={`flex ${border.color}`}
                             style={{
                                 clipPath: 'inset(0px round 2rem)', // '2rem' equivale ao 'rounded-4xl' (32px)
                                 WebkitClipPath: 'inset(0px round 2rem)' // Suporte para Safari
                             }}
                        >

                            {/* Item lables*/}
                            <div
                                id={"item label"}
                                className={`sticky left-0 z-10 w-48 bg-card ${border.r} ${border.color} p-4 flex items-center`}
                                onClick={onClickData}
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

                                    if (period.startDay <= new Date(year, month+1, 0) && period.endDay >= new Date(year, month, 1))
                                        return (
                                            <ActiveArea
                                                year={year}
                                                month={month}
                                                key={idx}
                                                period={period}
                                                isStart={!hasLeftNeighbor}
                                                isEnd={!hasRightNeighbor}
                                                pading_x={5}
                                                onClick={onClickActiveArea}
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

import {Period} from "@/types"
import {useEffect, useState} from "react";


export function ActiveArea({year, month, period, isStart, isEnd }: {year:number, month:number, period: Period, isStart: boolean, isEnd: boolean }) {
    const dayWidth = 56; // w-14

    const show = (period.startDay.getMonth() <= month || period.endDay.getMonth() >= month)
        && (period.startDay.getFullYear() == year || period.endDay.getFullYear() == year)

    let startPos: number = 0
    let duration: number = 0
    if (period.startDay.getMonth() < month && period.endDay.getMonth() > month){
        startPos =  -1 * dayWidth
        duration =  new Date(year, month + 1, 0).getDate() + 2
    }
    else {
    // Se houver transição, esticamos um pouco a largura para elas se sobreporem e o corte ser visível
        startPos = (period.startDay.getMonth() < month ? -1 : period.startDay.getDate() - 1) * dayWidth
        duration = period.endDay.getDate() - period.startDay.getDate() + 1
            + (period.endDay.getMonth() > month ? new Date(year, month+1, 0).getDate() + 1 : 0)
    }



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

    if (!show) {
        return (<></>)
    }
    else
        return (
            <div
                id={"active"}
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
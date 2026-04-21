import {period} from "@/types"


export function ActiveArea({ period, isStart, isEnd }: { period: period, isStart: boolean, isEnd: boolean }) {
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
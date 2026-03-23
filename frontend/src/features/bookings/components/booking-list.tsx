/**
 * @description
 *  Ficheiro para implementar um contentor para listar as propriedades
 *  Tambem para controlar e gerir a animação de saida da lista das propriedades
 * 
 * @version 1.0
 */

import { BookingCard, BookingProperty } from "./booking-card"
import { BookingHowItWorks } from "./booking-how-it-works"
import { BrutalEmptyState } from "@/components/ui/data-display/card"
import { cn } from "@/lib/utils"

const GRID_CONTAINER_STYLES = "grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 md:gap-8 transition-[grid-template-columns,gap] duration-200 ease-[cubic-bezier(0.2,0.8,0.4,1)] pb-12"
const CARD_ROTATION_BASE = "hover:rotate-0 hover:z-10 transition-transform duration-300"
const HOW_IT_WORKS_ROTATION = "aspect-[4/5] rotate-2 hover:rotate-0 hover:z-10 transition-transform duration-300"


/**
 * @prop properties - BookingProperty[]
 * @prop onBook? - (id: string) => void
 * @prop isLeaving? - boolean
 * @prop isReturning? - boolean
 */
interface BookingListProps {
    properties: BookingProperty[]
    onBook?: (id: string) => void
    isLeaving?: boolean
    isReturning?: boolean
}

/**
 * Componete para gerir a listagem de propriedades disponiveis para o boocking
 *   e gerir as animações de saidada e entrada desta listagem
 * 
 * @param {BookingListProps} props - Propriedades do componente. link: {@link BookingListProps}
 * @param {BookingProperty[]} props.properties - Lista de propriedades a exibir.
 * @param {(id: string) => void} [props.onBook] - Callback executado ao selecionar uma propriedade.
 * @param {boolean} [props.isLeaving] - Ativa as animações de saída (fly-out).
 * @param {boolean} [props.isReturning] - Ativa as animações de entrada (fly-in).
 * @returns Um elemento JSX contendo a grelha com propriedades ou o estado vazio.
 */
export function BookingList({ properties, onBook, isLeaving, isReturning }: BookingListProps) {
    
    // caso não hava propriedades, retorna o estado vazio
    if (properties.length === 0) {
        return (
            <BrutalEmptyState className={cn(
                !isLeaving && "animate-in fade-in-50",
                isLeaving && "animate-fly-out-chaos-3",
                isReturning && "animate-fly-in-chaos-3"
            )}>
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <h3 className="mt-4 font-mono text-xl font-bold uppercase tracking-tight">No properties found</h3>
                    <p className="mb-4 mt-2 text-sm text-muted-foreground font-mono">
                        We could not find any properties matching your criteria. Try adjusting your filters.
                    </p>
                </div>
            </BrutalEmptyState>
        )
    }

    return (
        <div className={GRID_CONTAINER_STYLES}>
            {properties.map((property, index) => {
                {/* Determine chaos animation based on index (modulo 4)*/}
                const outAnimations = [
                    "animate-fly-out-chaos-1",
                    "animate-fly-out-chaos-2",
                    "animate-fly-out-chaos-3",
                    "animate-fly-out-chaos-4"
                ]
                
                const inAnimations = [
                    "animate-fly-in-chaos-1",
                    "animate-fly-in-chaos-2",
                    "animate-fly-in-chaos-3",
                    "animate-fly-in-chaos-4"
                ]

                const animationClass = isLeaving 
                    ? outAnimations[index % 4] 
                    : (isReturning ? inAnimations[index % 4] : "")
                
                {/* Add staggered delay*/}
                const delayStyle = { animationDelay: `${(index % 5) * 50}ms` }

                const card = (
                    <div 
                        key={property.id} 
                        className={cn(
                            index % 2 === 0 ? "rotate-1" : "-rotate-1",
                            CARD_ROTATION_BASE,
                            animationClass
                        )}
                        style={isLeaving || isReturning ? delayStyle : undefined}
                    >
                        <BookingCard 
                            property={property} 
                            onBook={onBook} 
                        />
                    </div>
                )

                {/* insere o BookingHowItWorks no meio das propriedades disponiveis + a card*/}
                if (index === 4) {
                    return (
                        <div key={`wrapper-${property.id}`} className="contents">
                            <div 
                                key="how-it-works" 
                                className={cn(
                                    HOW_IT_WORKS_ROTATION,
                                    isLeaving ? "animate-fly-out-chaos-2" : (isReturning ? "animate-fly-in-chaos-2" : "")
                                )}
                                style={isLeaving || isReturning ? { animationDelay: "150ms" } : undefined}
                            >
                                <BookingHowItWorks mode="card" className="h-full w-full" />
                            </div>
                            {card}
                        </div>
                    )
                }

                {/* insere a card com a informação da propreiadade na lista */}
                return card
            })}
        </div>
    )
}

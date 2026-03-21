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
import { motion } from "framer-motion"
import { comicPopVariants, listContainerVariants, listItemVariants, panelVariants } from "@/features/bookings/motion"

const GRID_CONTAINER_STYLES = "grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 md:gap-8 transition-[grid-template-columns,gap] duration-200 ease-[cubic-bezier(0.2,0.8,0.4,1)] pb-12"
const CARD_ROTATION_BASE = "hover:rotate-0 hover:z-10 transition-transform duration-300"
const HOW_IT_WORKS_ROTATION = "aspect-[4/5] rotate-2 hover:rotate-0 hover:z-10 transition-transform duration-300"


/**
 * @prop properties - BookingProperty[]
 * @prop onBook? - (id: string) => void
 */
interface BookingListProps {
    properties: BookingProperty[]
    onBook?: (id: string) => void
}

/**
 * Componete para gerir a listagem de propriedades disponiveis para o boocking
 *   e gerir as animações de saidada e entrada desta listagem
 * 
 * @param {BookingListProps} props - Propriedades do componente. link: {@link BookingListProps}
 * @param {BookingProperty[]} props.properties - Lista de propriedades a exibir.
 * @param {(id: string) => void} [props.onBook] - Callback executado ao selecionar uma propriedade.
 * @returns Um elemento JSX contendo a grelha com propriedades ou o estado vazio.
 */
export function BookingList({ properties, onBook }: BookingListProps) {
    
    // caso não hava propriedades, retorna o estado vazio
    if (properties.length === 0) {
        return (
            <motion.div variants={panelVariants} initial="initial" animate="animate">
                <BrutalEmptyState>
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <h3 className="mt-4 font-mono text-xl font-bold uppercase tracking-tight">No properties found</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground font-mono">
                            We could not find any properties matching your criteria. Try adjusting your filters.
                        </p>
                    </div>
                </BrutalEmptyState>
            </motion.div>
        )
    }

    return (
        <motion.div
            className={GRID_CONTAINER_STYLES}
            variants={listContainerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            {properties.map((property, index) => {
                const card = (
                    <motion.div
                        key={property.id}
                        variants={listItemVariants}
                        className={cn(
                            index % 2 === 0 ? "rotate-1" : "-rotate-1",
                            CARD_ROTATION_BASE
                        )}
                    >
                        <BookingCard property={property} onBook={onBook} />
                    </motion.div>
                )

                if (index === 4) {
                    return (
                        <div key={`wrapper-${property.id}`} className="contents">
                            <motion.div
                                key="how-it-works"
                                variants={comicPopVariants}
                                className={HOW_IT_WORKS_ROTATION}
                            >
                                <BookingHowItWorks mode="card" className="h-full w-full" />
                            </motion.div>
                            {card}
                        </div>
                    )
                }

                return card
            })}
        </motion.div>
    )
}

/**
 * @description
 * * Este ficheiro implementa cartão interativo estilo "brutalista" que exibe o resumo de uma propriedade.
 * Projetado para ser usado em grids ou listas de propriedades.
 * 
 * @version 1.0
*/

import { BrutalInteractiveCard } from "@/components/ui/data-display/card"
import { Button } from "@/components/ui/forms/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ArrowRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, useReducedMotion } from "framer-motion"
import { gummyHover, gummyTap } from "@/features/bookings/motion"

/**
 * Interface de Dados da Propriedade (Booking Property).
 * 
 * Define a estrutura completa de dados necessária para renderizar uma propriedade
 * tanto no cartão de listagem quanto na página de detalhes.
 * 
 * @property id - Identificador único da propriedade.
 * @property title - Título comercial da propriedade.
 * @property description - Descrição curta ou longa.
 * @property location - Localização (Cidade, Estado/País).
 * @property price - Preço base por noite.
 * @property imageUrl - URL da imagem principal de capa.
 * @property status - Estado atual de disponibilidade.
 * @property rating - Avaliação média (0-5).
 * @property featured - Se a propriedade deve ter destaque visual.
 * @property tags - Lista de características ou amenidades principais.
 */
export interface BookingProperty {
    id: string
    title: string
    description: string
    location: string
    price: number
    imageUrl: string
    status: "AVAILABLE" | "BOOKED" | "MAINTENANCE"
    rating?: number
    featured?: boolean
    tags?: string[]
}

/**
 * @prop property - BookingProperty
 * @prop onBook? - (id: string) => void
 * @props className? - string
 */
interface BookingCardProps {
    property: BookingProperty
    onBook?: (id: string) => void
    className?: string
}

/**
 * Componente de Cartão de Propriedade (Booking Card).
 * 
 * Um cartão interativo estilo "brutalista" que exibe o resumo de uma propriedade.
 * Projetado para ser usado em grids ou listas de propriedades.
 * 
 * Características:
 * - Imagem com efeito de grayscale no hover.
 * - Badges flutuantes para localização e avaliação.
 * - Layout responsivo com padding ajustável.
 * - Botão de ação rápida para reserva.
 * 
 * @param property - Dados da propriedade a ser renderizada.
 * @param onBook - Função de callback executada ao clicar no cartão ou no botão de seta.
 * @param className - Classes CSS adicionais para customização de layout externo.
 */
export function BookingCard({ property, onBook, className }: BookingCardProps) {
    const shouldReduceMotion = useReducedMotion()

    return (
        <motion.div
            className={cn("group relative aspect-[4/5] w-full max-w-[240px] mx-auto md:max-w-none", className)}
            whileHover={shouldReduceMotion ? undefined : gummyHover}
            whileTap={shouldReduceMotion ? undefined : gummyTap}
        >
            <BrutalInteractiveCard onClick={() => onBook?.(property.id)} className="h-full py-2">
                <CardImageSection property={property} />
                <CardDetailsSection property={property} onBook={onBook} />
            </BrutalInteractiveCard>
        </motion.div>
    )
}

// --- Sub-components ---

/**
 * Subcomponente: Seção de Imagem do Cartão.
 * 
 * Renderiza a imagem da propriedade com tratamento visual (bordas, grayscale)
 * e sobrepõe os badges de informação (Localização, Rating).
 */
function CardImageSection({ property }: { property: BookingProperty }) {
    const CARD_PADDING_X = "px-3 md:px-3"
    
    return (
        <div className={cn("relative h-[70%] pb-2 flex flex-col min-h-0 pt-2 md:pt-3", CARD_PADDING_X)}>
            <Badge variant="brutal" className="absolute top-2 md:top-3 left-2 md:left-3 z-10 gap-1">
                <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3" />
                <span className="truncate max-w-[100px] md:max-w-none">{property.location}</span>
            </Badge>
            
            {property.rating && (
                <Badge variant="brutal" className="absolute top-2 md:top-3 right-2 md:right-3 z-10 gap-1">
                    <Star className="h-2.5 w-2.5 md:h-3 md:w-3 fill-current" />
                    <span>{property.rating}</span>
                </Badge>
            )}
            
            {property.imageUrl ? (
                <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="h-full w-full rounded-[5px] border-[2px] border-foreground object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <div className="h-full w-full rounded-[5px] border-[2px] border-foreground bg-muted/50 grid place-items-center">
                    <span className="font-mono text-[10px] uppercase text-muted-foreground">Sem imagem</span>
                </div>
            )}
        </div>
    )
}

/**
 * Subcomponente: Seção de Detalhes do Cartão.
 * 
 * Renderiza o título, preço por noite e o botão de ação.
 * Gerencia a propagação de eventos para garantir que o clique no botão
 * funcione independentemente do clique no cartão.
 */
function CardDetailsSection({ property, onBook }: { property: BookingProperty, onBook?: (id: string) => void }) {
    const CARD_PADDING_X = "px-3 md:px-3"

    return (
        <div className={cn("relative flex-1 flex flex-col justify-between pb-2", CARD_PADDING_X)}>
            <div className="flex flex-col shrink-0">
                <h3 className="text-sm md:text-base font-black uppercase leading-tight tracking-tight line-clamp-1 truncate mt-1 md:mt-0">
                    {property.title}
                </h3>
                <div className="w-full my-1">
                    <div className="h-[2px] md:h-[3px] w-full bg-foreground" />
                </div>
            </div>
            
            <div className="flex items-center justify-between bg-secondary pt-0 shrink-0">
                <div className="flex flex-col justify-center">
                    <span className="text-[9px] md:text-[9px] font-bold uppercase text-muted-foreground leading-none mb-0.5">
                        Starting from
                    </span>
                    <span className="font-mono text-xs md:text-sm font-bold text-primary leading-none">
                        €{property.price}/night
                    </span>
                </div>
                <Button
                    variant="brutal"
                    onClick={(e) => {
                        // Impede que o clique no botão dispare o onClick do cartão pai
                        e.stopPropagation()
                        onBook?.(property.id)
                    }}
                    className="flex h-8 w-10 md:h-10 md:w-16 items-center justify-center p-0"
                >
                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
            </div>
        </div>
    )
}

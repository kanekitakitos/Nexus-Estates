/**
 * @description
 * * Este ficheiro implementa a página individual de uma propriedade.
 * 
 * @version 1.0
*/

import { useEffect, useCallback, useState } from "react"
import { ArrowLeft, MapPin, Star, Users, Home, Maximize, Check } from "lucide-react"
import { Button } from "@/components/ui/forms/button"
import { Badge } from "@/components/ui/badge"
import { BrutalShard } from "@/components/ui/data-display/card"
import { BookingProperty } from "./booking-card"
import { cn } from "@/lib/utils"
import { DateRangeCalendar } from "./date-range-calendar"

const PAGE_CONTAINER_STYLES = "flex flex-col space-y-6 p-4 md:p-6 lg:px-[150px] min-h-screen overflow-x-hidden"
const MAIN_IMAGE_WRAPPER_STYLES = "relative w-full overflow-hidden rounded-xl md:rounded-3xl h-[60vh] md:h-auto md:aspect-[16/5]"
const THUMBNAIL_STYLES = "relative aspect-[4/3] overflow-hidden rounded-lg md:rounded-xl border-[2px] border-foreground/70 bg-muted/50 hover:bg-primary/10 transition-colors cursor-pointer group"
const THUMBNAIL_LABEL_STYLES = "absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 group-hover:opacity-100 font-mono text-[8px] md:text-[10px] font-bold uppercase tracking-[0.18em] text-foreground"
const PRICE_TEXT_STYLES = "font-mono font-bold text-primary text-lg md:text-xl"
const SUMMARY_CARD_STYLES = "flex items-center gap-2 md:gap-3 border-[2px] border-foreground p-2 md:p-3 bg-secondary/30"


/**
 * @prop property - BookingProperty
 * @prop onBack - () => void
 * @prop isExiting? - boolean
 * @prop checkInDate? - Date | null
 * @prop checkOutDate? - Date | null
 */
interface BookingDetailsProps {
    property: BookingProperty
    onBack: () => void
    isExiting?: boolean
    checkInDate?: Date | null
    checkOutDate?: Date | null
}

/**
 * Componente de Detalhes da Propriedade (Booking Details).
 * 
 * Responsável por apresentar a visão completa de uma propriedade selecionada.
 * Este componente orquestra vários subcomponentes para exibir:
 * 1. Galeria de imagens interativa.
 * 2. Informações principais (título, localização, preço, avaliação).
 * 3. Descrição detalhada e especificações (hóspedes, quartos, área).
 * 4. Lista de amenidades e botão de ação principal.
 * 5. Calendário de disponibilidade e cálculo de custos.
 * 
 * Além disso, gerencia a navegação de retorno através de botões e gestos (swipe/wheel).
 * 
 * @param property - Objeto contendo todos os dados da propriedade a ser exibida.
 * @param onBack - Função de callback para retornar à listagem anterior.
 * @param isExiting - Booleano que controla a animação de saída (fly-out) quando o utilizador volta.
 * @param checkInDate - Data de check-in pré-selecionada (opcional, vinda da busca).
 * @param checkOutDate - Data de check-out pré-selecionada (opcional, vinda da busca).
 */
export function BookingDetails({ property, onBack, isExiting, checkInDate = null, checkOutDate = null }: BookingDetailsProps) {
    const handleBack = useCallback(() => {
        onBack()
    }, [onBack])

    // Hook personalizado para detetar gestos de navegação (voltar)
    useSwipeBack(handleBack)

    return (
        <div className={cn(
            PAGE_CONTAINER_STYLES,
            // Aplica animações de entrada (fly-in) ou saída (fly-out) baseadas no estado
            isExiting ? "animate-fly-out-right fill-mode-forwards" : "animate-fly-in fill-mode-forwards"
        )}>
            {/* Botão para voltar */}
            <div className="mb-4">
                <Button 
                    onClick={handleBack}
                    variant="brutal-outline" 
                    className="group"
                >
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                    <span className="flex items-center gap-1">
                        <span className="opacity-70">&lt;</span>
                        <span>Back to listings</span>
                    </span>
                </Button>
            </div>

            <div className="space-y-6">
                {/* Galeria de Imagens */}
                <PropertyGallery property={property} />

                <div className="space-y-6">
                    {/* Cartão de Cabeçalho (Título, Preço, Avaliação) */}
                    <PropertyHeaderCard property={property} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cartão de Descrição e Detalhes (Hóspedes, Quartos, Área) */}
                        <PropertyDescriptionCard property={property} />

                        {/* Cartão de Amenidades e Ação de Reserva */}
                        <PropertyActionCard property={property} />
                    </div>
                </div>
            </div>

            <div className="mt-10">
                {/* Calendário de Seleção de Datas e Resumo de Preços */}
                <DateRangeCalendar
                    pricePerNight={property.price}
                    defaultValue={
                        checkInDate && checkOutDate 
                        ? { from: checkInDate, to: checkOutDate } 
                        : undefined
                    }
                    onConfirmBooking={({ range, totalPrice, nights }) => {
                        // TODO: Integrar com o backend de reservas
                        alert(`Booking Confirmed! Total: €${totalPrice} for ${nights} nights`)
                    }}
                    onContactOwner={({ range }) => {
                        // TODO: Abrir modal de contato ou redirecionar para chat
                        alert("Contact owner feature coming soon")
                    }}
                />
            </div>
        </div>
    )
}

// --- Sub-components & Hooks ---

/**
 * Subcomponente: Cabeçalho da Propriedade.
 * 
 * Exibe as informações mais críticas para a decisão do utilizador:
 * - Localização e Título.
 * - Avaliação (Rating).
 * - Preço por noite.
 * 
 * Utiliza o componente `BrutalShard` para manter a consistência visual do design system.
 */
function PropertyHeaderCard({ property }: { property: BookingProperty }) {
    return (
        <BrutalShard rotate="primary">
            <div className="flex flex-col space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="font-mono text-sm md:text-lg font-bold text-muted-foreground uppercase">{property.location}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl lg:text-6xl font-black uppercase leading-[0.9] tracking-tight mb-4 text-foreground drop-shadow-[2px_2px_0_rgba(0,0,0,0.1)]">
                        {property.title}
                    </h1>
                    <div className="flex items-center gap-4">
                        <Badge variant="rating">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{property.rating}</span>
                        </Badge>
                        <div className="h-px w-12 bg-foreground/30" />
                        <span className={PRICE_TEXT_STYLES}>
                            ${property.price}<span className="text-sm text-muted-foreground">/night</span>
                        </span>
                    </div>
                </div>
            </div>
        </BrutalShard>
    )
}

/**
 * Subcomponente: Descrição e Especificações.
 * 
 * Apresenta o texto descritivo da propriedade e um grid de ícones
 * resumindo as características físicas (capacidade, quartos, metragem).
 */
function PropertyDescriptionCard({ property }: { property: BookingProperty }) {
    return (
        <BrutalShard rotate="secondary">
            <div className="border-t-[3px] border-b-[3px] border-foreground py-6 space-y-4">
                <p className="font-mono text-base md:text-lg leading-relaxed text-muted-foreground">
                    {property.description}
                </p>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6">
                    {[
                        { icon: Users, label: "2 Guests" },
                        { icon: Home, label: "1 Bedroom" },
                        { icon: Maximize, label: "85 m²" }
                    ].map((item, i) => (
                        <div key={i} className={SUMMARY_CARD_STYLES}>
                            <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                            <span className="font-mono font-bold uppercase text-xs md:text-sm">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </BrutalShard>
    )
}

/**
 * Subcomponente: Ações e Amenidades.
 * 
 * Lista as tags de amenidades (ex: Wi-Fi, Piscina) e contém o botão
 * de chamada para ação (CTA) principal "Book Now".
 */
function PropertyActionCard({ property }: { property: BookingProperty }) {
    return (
        <BrutalShard rotate="primary">
            <div className="space-y-4">
                <h3 className="font-mono text-xl font-black uppercase border-l-4 border-primary pl-3">Amenities</h3>
                <div className="flex flex-wrap gap-3">
                    {property.tags?.map((tag) => (
                        <Badge key={tag} variant="amenity">
                            <Check className="h-3 w-3" />
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <Button variant="brutal" className="w-full h-14 md:h-16 text-lg md:text-xl font-black uppercase tracking-wider shadow-[6px_6px_0_0_rgb(0,0,0)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.9)]">
                    Book Now
                </Button>
            </div>
        </BrutalShard>
    )
}

/**
 * Subcomponente: Galeria de Imagens.
 * 
 * Exibe a imagem principal em destaque e uma lista de miniaturas.
 * Inclui funcionalidade de rotação automática (slideshow) a cada 6 segundos.
 */
function PropertyGallery({ property }: { property: BookingProperty }) {
    // TODO: Substituir URLs hardcoded por imagens reais da propriedade quando disponíveis na API
    const galleryImages = [
        property.imageUrl,
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
    ]

    const [activeImageIndex, setActiveImageIndex] = useState(0)

    // Efeito para rotação automática das imagens
    useEffect(() => {
        if (galleryImages.length <= 1) return
        const intervalId = window.setInterval(() => {
            setActiveImageIndex((prev) => (prev + 1) % galleryImages.length)
        }, 6000)
        return () => window.clearInterval(intervalId)
    }, [galleryImages.length])

    return (
        <div>
            <div className={MAIN_IMAGE_WRAPPER_STYLES}>
                <img 
                    src={galleryImages[activeImageIndex]} 
                    alt={property.title} 
                    className="h-full w-full object-cover"
                />
                <Badge variant="featured" className="absolute top-4 left-4">FEATURED</Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
                {galleryImages.map((imageSrc, index) => (
                    <button
                        key={`${imageSrc}-${index}`}
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className={THUMBNAIL_STYLES}
                    >
                        <img src={imageSrc} alt="" className="h-full w-full object-cover" />
                        <div className={THUMBNAIL_LABEL_STYLES}>VIEW</div>
                    </button>
                ))}
            </div>
        </div>
    )
}

/**
 * Hook de Navegação por Gestos (Back Navigation).
 * 
 * Permite que o utilizador volte para a listagem usando gestos naturais:
 * 1. Scroll horizontal para a esquerda (trackpad).
 * 2. Swipe para a direita (touchscreen).
 * 
 * @param onBack - Função a ser executada quando o gesto de voltar é detetado.
 */
function useSwipeBack(onBack: () => void) {
    useEffect(() => {
        let touchStartX = 0
        let touchStartY = 0

        const handleWheel = (e: WheelEvent) => {
            const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
            // Deteta scroll para a esquerda (voltar)
            if (isHorizontal && e.deltaX < -20) {
                onBack()
            }
        }

        const handleTouchStart = (e: TouchEvent) => {
            touchStartX = e.touches[0].clientX
            touchStartY = e.touches[0].clientY
        }

        const handleTouchEnd = (e: TouchEvent) => {
            const touchEndX = e.changedTouches[0].clientX
            const touchEndY = e.changedTouches[0].clientY
            const deltaX = touchEndX - touchStartX
            const deltaY = touchEndY - touchStartY

            // Deteta swipe para a direita (voltar)
            if (deltaX > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
                onBack()
            }
        }

        window.addEventListener("wheel", handleWheel)
        window.addEventListener("touchstart", handleTouchStart)
        window.addEventListener("touchend", handleTouchEnd)
        
        return () => {
            window.removeEventListener("wheel", handleWheel)
            window.removeEventListener("touchstart", handleTouchStart)
            window.removeEventListener("touchend", handleTouchEnd)
        }
    }, [onBack])
}

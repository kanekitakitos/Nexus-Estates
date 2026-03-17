/**
 * @file
 * Orquestrador Principal do Fluxo de informações sobre os boockings.
 * 
 * @description
 * * Este ficheiro contém a vista principal dos boockings, funcionando como um contentor 
 * inteligente que alterna entre a listagem de possiveis boockings e a vista detalhada.
 * 
 * @version 1.0
*/

"use client"

import { useMemo, useState, useEffect } from "react"
import { BookingList } from "./components/booking-list"
import { BookingProperty } from "./components/booking-card"
import { BookingSearchBar } from "./components/booking-search-bar"
import { BookingDetails } from "./components/booking-details"
import { cn } from "@/lib/utils"

const PAGE_CONTAINER_STYLES = "flex flex-col space-y-6 p-2 md:p-6 lg:p-10 xl:px-[150px] min-h-screen overflow-x-hidden"
const HERO_CONTAINER_STYLES = "flex flex-col space-y-2 mb-8 transition-all duration-500"
const HERO_TITLE_STYLES = "text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase mb-2"
const HERO_PILL_PRIMARY_STYLES = "bg-primary text-primary-foreground px-2 inline-block -rotate-1 mr-2 shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)]"
const HERO_UNDERLINE_TEXT_STYLES = "text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 underline decoration-4 decoration-primary underline-offset-4"
const HERO_SUBTITLE_STYLES = "text-lg md:text-xl text-muted-foreground font-mono max-w-2xl border-l-4 border-primary pl-4"
const SEARCH_WRAPPER_ANIMATION_LEAVE = "animate-fly-out-chaos-2 delay-100"
const SEARCH_WRAPPER_ANIMATION_RETURN = "animate-fly-in-chaos-2 delay-100"
const LIST_CONTAINER_STYLES = "relative"
const LIST_DECORATOR_STYLES = "absolute -left-4 top-0 bottom-0 w-1 bg-foreground/10"

// Mock Data
const MOCK_PROPERTIES: BookingProperty[] = [
    {
        id: "1",
        title: "Modern Loft in Downtown",
        description: "Experience city living at its finest in this spacious loft with floor-to-ceiling windows and modern amenities.",
        location: "New York, NY",
        price: 250,
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.8,
        featured: true,
        tags: ["City View", "Loft", "High Floor", "Workspace"]
    },
    {
        id: "2",
        title: "Cozy Mountain Cabin",
        description: "Escape to the mountains in this rustic yet luxurious cabin. Perfect for winter getaways and summer hikes.",
        location: "Aspen, CO",
        price: 450,
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop",
        status: "BOOKED", // Should be filtered out
        rating: 4.9,
        featured: true,
        tags: ["Fireplace", "Snow Nearby", "Hot Tub"]
    },
    {
        id: "3",
        title: "Seaside Villa with Pool",
        description: "Relax by the ocean in this stunning villa featuring a private infinity pool and direct beach access.",
        location: "Malibu, CA",
        price: 1200,
        imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 5.0,
        tags: ["Oceanfront", "Infinity Pool", "Private Beach", "Luxury"]
    },
    {
        id: "4",
        title: "Urban Studio Apartment",
        description: "Compact and efficient studio in the heart of the business district. Ideal for business travelers.",
        location: "Chicago, IL",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.5,
        tags: ["Business District", "Compact", "Fast Wi-Fi"]
    },
    {
        id: "5",
        title: "Historic Townhouse",
        description: "Step back in time in this beautifully restored townhouse with original architectural details.",
        location: "Boston, MA",
        price: 350,
        imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop",
        status: "MAINTENANCE", // Should be filtered out
        rating: 4.7,
        tags: ["Historic Center", "Original Details"]
    },
    {
        id: "6",
        title: "Lakefront Cottage",
        description: "Peaceful cottage right on the water's edge. Enjoy fishing, kayaking, or just watching the sunset.",
        location: "Lake Tahoe, NV",
        price: 280,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.6,
        tags: ["Lakefront", "Sunset View", "Kayak Included"]
    },
    {
        id: "7",
        title: "Modern Loft in Downtown",
        description: "Experience city living at its finest in this spacious loft with floor-to-ceiling windows and modern amenities.",
        location: "New York, NY",
        price: 250,
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.8,
        featured: true,
        tags: ["City View", "Loft", "High Floor", "Workspace"]
    },
    {
        id: "8",
        title: "Cozy Mountain Cabin",
        description: "Escape to the mountains in this rustic yet luxurious cabin. Perfect for winter getaways and summer hikes.",
        location: "Aspen, CO",
        price: 450,
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop",
        status: "BOOKED", // Should be filtered out
        rating: 4.9,
        featured: true,
        tags: ["Fireplace", "Snow Nearby", "Hot Tub"]
    },
    {
        id: "9",
        title: "Seaside Villa with Pool",
        description: "Relax by the ocean in this stunning villa featuring a private infinity pool and direct beach access.",
        location: "Malibu, CA",
        price: 1200,
        imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 5.0,
        tags: ["Oceanfront", "Infinity Pool", "Private Beach", "Luxury"]
    },
    {
        id: "10",
        title: "Urban Studio Apartment",
        description: "Compact and efficient studio in the heart of the business district. Ideal for business travelers.",
        location: "Chicago, IL",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.5,
        tags: ["Business District", "Compact", "Fast Wi-Fi"]
    },
    {
        id: "11",
        title: "Historic Townhouse",
        description: "Step back in time in this beautifully restored townhouse with original architectural details.",
        location: "Boston, MA",
        price: 350,
        imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop",
        status: "MAINTENANCE", // Should be filtered out
        rating: 4.7,
        tags: ["Historic Center", "Original Details"]
    },
    {
        id: "12",
        title: "Lakefront Cottage",
        description: "Peaceful cottage right on the water's edge. Enjoy fishing, kayaking, or just watching the sunset.",
        location: "Lake Tahoe, NV",
        price: 280,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.6,
        tags: ["Lakefront", "Sunset View", "Kayak Included"]
    },
    {
        id: "13",
        title: "Modern Loft in Downtown",
        description: "Experience city living at its finest in this spacious loft with floor-to-ceiling windows and modern amenities.",
        location: "New York, NY",
        price: 250,
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.8,
        featured: true,
        tags: ["City View", "Loft", "High Floor", "Workspace"]
    },
    {
        id: "14",
        title: "Cozy Mountain Cabin",
        description: "Escape to the mountains in this rustic yet luxurious cabin. Perfect for winter getaways and summer hikes.",
        location: "Aspen, CO",
        price: 450,
        imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop",
        status: "BOOKED", // Should be filtered out
        rating: 4.9,
        featured: true,
        tags: ["Fireplace", "Snow Nearby", "Hot Tub"]
    },
    {
        id: "15",
        title: "Seaside Villa with Pool",
        description: "Relax by the ocean in this stunning villa featuring a private infinity pool and direct beach access.",
        location: "Malibu, CA",
        price: 1200,
        imageUrl: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 5.0,
        tags: ["Oceanfront", "Infinity Pool", "Private Beach", "Luxury"]
    },
    {
        id: "16",
        title: "Urban Studio Apartment",
        description: "Compact and efficient studio in the heart of the business district. Ideal for business travelers.",
        location: "Chicago, IL",
        price: 120,
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.5,
        tags: ["Business District", "Compact", "Fast Wi-Fi"]
    },
    {
        id: "17",
        title: "Historic Townhouse",
        description: "Step back in time in this beautifully restored townhouse with original architectural details.",
        location: "Boston, MA",
        price: 350,
        imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1000&auto=format&fit=crop",
        status: "MAINTENANCE", // Should be filtered out
        rating: 4.7,
        tags: ["Historic Center", "Original Details"]
    },
    {
        id: "18",
        title: "Lakefront Cottage",
        description: "Peaceful cottage right on the water's edge. Enjoy fishing, kayaking, or just watching the sunset.",
        location: "Lake Tahoe, NV",
        price: 280,
        imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop",
        status: "AVAILABLE",
        rating: 4.6,
        tags: ["Lakefront", "Sunset View", "Kayak Included"]
    }
]

/**
 * Controlador principal da vista de reservas (Booking View).
 * 
 * Este componente atua como um "Smart Container", orquestrando o estado global da página de reservas.
 * Responsabilidades principais:
 * 1. Gestão de Estado: Mantém os filtros de pesquisa (termo, datas, hóspedes, preço) e a propriedade selecionada.
 * 2. Filtragem de Dados: Aplica lógica de filtragem em tempo real sobre a lista de propriedades (MOCK_PROPERTIES).
 * 3. Navegação e Transições: Controla a alternância entre a vista de lista e a vista de detalhes, gerindo as animações de entrada/saída.
 * 4. Integração de Gestos: Coordena com o hook de gestos para permitir navegação fluida.
 * 
 * @returns {JSX.Element} A estrutura completa da página de reservas, alternando condicionalmente entre Lista e Detalhes.
 */
export function BookingView() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedProperty, setSelectedProperty] = useState<BookingProperty | null>(null)
    const [lastViewedPropertyId, setLastViewedPropertyId] = useState<string | null>(null)
    const [isLeaving, setIsLeaving] = useState(false)
    const [isReturning, setIsReturning] = useState(false)
    
    const [adults, setAdults] = useState(1)
    const [children, setChildren] = useState(0)
    const [maxPrice, setMaxPrice] = useState<number | "">("")
    const [checkInDate, setCheckInDate] = useState<Date | null>(null)
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(null)

    // Memoriza a lista filtrada para evitar recálculos desnecessários em cada renderização
    const filteredProperties = useMemo(() => 
        {
        let filtered = MOCK_PROPERTIES.filter(p => p.status === "AVAILABLE")

        // filtra as propriedades dependedo do destino indicado no BookingSearchBar
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(p => 
                p.title.toLowerCase().includes(term) || 
                p.location.toLowerCase().includes(term)
            )
        }

        if (maxPrice !== "") {
            filtered = filtered.filter(p => p.price <= Number(maxPrice))
        }

        return filtered
    }, [searchTerm, adults, children, maxPrice])

    // Manipula a seleção de uma propriedade, iniciando a animação de saída da lista
    const handleBook = (id: string) => {
        const property = MOCK_PROPERTIES.find(p => p.id === id)
        if (property) {
            setLastViewedPropertyId(id) // Salva para permitir navegação "forward" via gestos
            setIsLeaving(true)
            // Aguarda a animação terminar antes de trocar o estado
            setTimeout(() => {
                setSelectedProperty(property)
                setIsLeaving(false)
                setIsReturning(false)
                window.scrollTo(0, 0)
            }, 800) // Sincronizado com a duração da animação CSS
        }
    }

    // Manipula o retorno da vista de detalhes para a lista
    const handleBack = () => {
        setIsReturning(true)
        
        setTimeout(() => {
            setSelectedProperty(null)
            setTimeout(() => {
                setIsReturning(false)
            }, 1000)
        }, 800)
    }

    // Hook para gestos de navegação (swipe/wheel)
    useNavigationGestures({
        selectedProperty,
        lastViewedPropertyId,
        isLeaving,
        isReturning,
        onNavigateForward: handleBook
    })

    // Renderização condicional: Vista de Detalhes
    if (selectedProperty) {
        return <BookingDetails
            property={selectedProperty}
            onBack={handleBack}
            isExiting={isReturning}
            checkInDate={checkInDate}
            checkOutDate={checkOutDate}
        />
    }

    // Renderização padrão: Vista de Lista com Pesquisa e Hero
    return (
        <div className={PAGE_CONTAINER_STYLES}>
            <HeroSection isLeaving={isLeaving} isReturning={isReturning} />

            <div className={cn(
                isLeaving && SEARCH_WRAPPER_ANIMATION_LEAVE,
                isReturning && SEARCH_WRAPPER_ANIMATION_RETURN
            )}>
                <BookingSearchBar
                    destination={searchTerm}
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                    adults={adults}
                    childrenCount={children}
                    maxPrice={maxPrice}
                    onDestinationChange={setSearchTerm}
                    onCheckInChange={setCheckInDate}
                    onCheckOutChange={setCheckOutDate}
                    onAdultsChange={setAdults}
                    onChildrenChange={setChildren}
                    onMaxPriceChange={setMaxPrice}
                />
            </div>

            <div className={cn(LIST_CONTAINER_STYLES)}>
                <div className={LIST_DECORATOR_STYLES} />
                <BookingList
                    properties={filteredProperties}
                    onBook={handleBook}
                    isLeaving={isLeaving}
                    isReturning={isReturning}
                />
            </div>
        </div>
    )
}

// --- Sub-components & Hooks ---

/**
 * Componente visual de destaque (Hero Section).
 * 
 * Apresenta o título principal e subtítulo da página.
 * Reage às propriedades de estado `isLeaving` e `isReturning` para aplicar
 * classes de animação CSS (fly-out/fly-in), criando uma transição fluida
 * quando o utilizador navega para os detalhes de uma propriedade.
 * 
 * @param isLeaving - Indica se a vista atual está a sair (transição para detalhes).
 * @param isReturning - Indica se a vista está a retornar (vindo dos detalhes).
 */
function HeroSection({ isLeaving, isReturning }: { isLeaving: boolean, isReturning: boolean }) {
    return (
        <div className={cn(
            HERO_CONTAINER_STYLES,
            isLeaving && "animate-fly-out-chaos-1",
            isReturning && "animate-fly-in-chaos-1"
        )}>
            <h1 className={HERO_TITLE_STYLES}>
                <span className={HERO_PILL_PRIMARY_STYLES}>Find</span>
                <span className="inline-block rotate-1">Your</span>
                <br />
                <span className={HERO_UNDERLINE_TEXT_STYLES}>Next Stay</span>
            </h1>
            <p className={HERO_SUBTITLE_STYLES}>
                Explore our curated selection of premium properties available for your dates.
            </p>
        </div>
    )
}

/**
 * Hook de efeito colateral para navegação baseada em gestos.
 * 
 * Adiciona ouvintes de eventos (event listeners) globais à janela para detetar:
 * 1. Scroll horizontal do trackpad (WheelEvent).
 * 2. Gestos de swipe em dispositivos táteis (TouchStart/TouchEnd).
 * 
 * Permite que o utilizador "avance" para a última propriedade visualizada
 * deslizando para a esquerda ou fazendo scroll horizontal, simulando uma navegação nativa.
 * 
 * @param params.selectedProperty - Propriedade atualmente selecionada (se houver).
 * @param params.lastViewedPropertyId - ID da última propriedade visualizada para navegação forward.
 * @param params.isLeaving - Estado de animação de saída (bloqueia novos gestos).
 * @param params.isReturning - Estado de animação de retorno (bloqueia novos gestos).
 * @param params.onNavigateForward - Função a ser executada quando um gesto válido é detetado.
 */
function useNavigationGestures({
    selectedProperty,
    lastViewedPropertyId,
    isLeaving,
    isReturning,
    onNavigateForward
}: {
    selectedProperty: BookingProperty | null,
    lastViewedPropertyId: string | null,
    isLeaving: boolean,
    isReturning: boolean,
    onNavigateForward: (id: string) => void
}) {
    useEffect(() => {
        // Se já estivermos nos detalhes, não precisamos destes gestos (a BookingDetails tem o seu próprio hook de voltar)
        if (selectedProperty) return

        let touchStartX = 0
        let touchStartY = 0

        const handleWheel = (e: WheelEvent) => {
            const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
            
            // Deteta scroll horizontal significativo para a direita (avançar)
            if (isHorizontal && lastViewedPropertyId && !isLeaving && !isReturning) {
                if (e.deltaX > 20) {
                     onNavigateForward(lastViewedPropertyId)
                }
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

            // Deteta swipe para a esquerda (avançar)
            if (deltaX < -30 && Math.abs(deltaX) > Math.abs(deltaY) && lastViewedPropertyId && !isLeaving && !isReturning) {
                onNavigateForward(lastViewedPropertyId)
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
    }, [selectedProperty, lastViewedPropertyId, isLeaving, isReturning, onNavigateForward])
}

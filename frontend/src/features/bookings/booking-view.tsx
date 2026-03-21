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

import { useMemo, useState, useEffect, useCallback } from "react"
import { BookingList } from "./components/booking-list"
import { BookingProperty } from "./components/booking-card"
import { BookingSearchBar } from "./components/booking-search-bar"
import { BookingDetails } from "./components/booking-details"
import { BookingCheckoutForm } from "./components/booking-checkout-form"
import { cn } from "@/lib/utils"
import { PropertyService } from "@/services/property.service"
import { toast } from "sonner"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { comicPopVariants, gummyHover, gummyTap, pageVariants } from "@/features/bookings/motion"

const PAGE_CONTAINER_STYLES = "flex flex-col space-y-6 p-2 md:p-6 lg:p-10 xl:px-[150px] min-h-screen overflow-x-hidden"
const HERO_CONTAINER_STYLES = "flex flex-col space-y-2 mb-8 transition-all duration-500"
const HERO_TITLE_STYLES = "text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase mb-2"
const HERO_PILL_PRIMARY_STYLES = "bg-primary text-primary-foreground px-2 inline-block -rotate-1 mr-2 shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)]"
const HERO_UNDERLINE_TEXT_STYLES = "text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 underline decoration-4 decoration-primary underline-offset-4"
const HERO_SUBTITLE_STYLES = "text-lg md:text-xl text-muted-foreground font-mono max-w-2xl border-l-4 border-primary pl-4"
const LIST_CONTAINER_STYLES = "relative"
const LIST_DECORATOR_STYLES = "absolute -left-4 top-0 bottom-0 w-1 bg-foreground/10"

type BookingViewScreen = "list" | "details" | "checkout"
type ExitCleanup = "clearSelected" | "clearCheckout" | "clearAll" | null

/**
 * Controlador principal da vista de reservas (Booking View).
 */
export function BookingView() {
    const [properties, setProperties] = useState<BookingProperty[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedProperty, setSelectedProperty] = useState<BookingProperty | null>(null)
    const [checkout, setCheckout] = useState<{ checkIn: string; checkOut: string } | null>(null)
    const [lastViewedPropertyId, setLastViewedPropertyId] = useState<string | null>(null)
    const [screen, setScreen] = useState<BookingViewScreen>("list")
    const [exitCleanup, setExitCleanup] = useState<ExitCleanup>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    
    const [adults, setAdults] = useState(1)
    const [children, setChildren] = useState(0)
    const [maxPrice, setMaxPrice] = useState<number | "">("")
    const [checkInDate, setCheckInDate] = useState<Date | null>(null)
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(null)

    // Carrega as propriedades do backend ao montar o componente
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setIsLoading(true)
                const mappedData = await PropertyService.getAllProperties()
                setProperties(mappedData)
            } catch (error) {
                console.error("Erro ao carregar propriedades:", error)
                toast.error("Não foi possível carregar as propriedades.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchProperties()
    }, [])

    // Memoriza a lista filtrada para evitar recálculos desnecessários em cada renderização
    const filteredProperties = useMemo(() => 
        {
        let filtered = properties.filter(p => p.status === "AVAILABLE")

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
    }, [properties, searchTerm, maxPrice])

    const navigateToDetails = useCallback((id: string) => {
        if (isTransitioning) return
        const property = properties.find(p => p.id === id)
        if (!property) return
        setLastViewedPropertyId(id)
        setSelectedProperty(property)
        setCheckout(null)
        setExitCleanup(null)
        setIsTransitioning(true)
        setScreen("details")
        if (typeof window !== "undefined") window.scrollTo(0, 0)
    }, [isTransitioning, properties])

    const navigateBackToList = useCallback(() => {
        if (isTransitioning) return
        setExitCleanup("clearAll")
        setIsTransitioning(true)
        setScreen("list")
        if (typeof window !== "undefined") window.scrollTo(0, 0)
    }, [isTransitioning])

    const navigateToCheckout = useCallback((payload: { checkIn: string; checkOut: string }) => {
        if (isTransitioning) return
        setCheckout(payload)
        setExitCleanup(null)
        setIsTransitioning(true)
        setScreen("checkout")
        if (typeof window !== "undefined") window.scrollTo(0, 0)
    }, [isTransitioning])

    const navigateBackToDetails = useCallback(() => {
        if (isTransitioning) return
        setExitCleanup("clearCheckout")
        setIsTransitioning(true)
        setScreen("details")
        if (typeof window !== "undefined") window.scrollTo(0, 0)
    }, [isTransitioning])

    // Hook para gestos de navegação (swipe/wheel)
    useNavigationGestures({
        screen,
        lastViewedPropertyId,
        isTransitioning,
        onNavigateForward: navigateToDetails
    })

    return (
        <AnimatePresence
            mode="wait"
            onExitComplete={() => {
                if (exitCleanup === "clearCheckout") setCheckout(null)
                if (exitCleanup === "clearSelected") setSelectedProperty(null)
                if (exitCleanup === "clearAll") {
                    setCheckout(null)
                    setSelectedProperty(null)
                }
                setExitCleanup(null)
                setIsTransitioning(false)
            }}
        >
            {screen === "list" ? (
                <motion.div
                    key="booking-list"
                    className={PAGE_CONTAINER_STYLES}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    <HeroSection />

                    <div className="rounded-2xl border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)] p-3 md:p-4">
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
                            className="bg-transparent shadow-none border-0 p-0"
                        />
                    </div>

                    <div className={cn(LIST_CONTAINER_STYLES)}>
                        <div className={LIST_DECORATOR_STYLES} />
                        {isLoading ? (
                            <div className="p-4 text-sm text-muted-foreground">A carregar propriedades…</div>
                        ) : (
                            <BookingList properties={filteredProperties} onBook={navigateToDetails} />
                        )}
                    </div>
                </motion.div>
            ) : null}

            {screen === "details" && selectedProperty ? (
                <motion.div
                    key="booking-details"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    <BookingDetails
                        property={selectedProperty}
                        onBack={navigateBackToList}
                        onCheckout={navigateToCheckout}
                        checkInDate={checkInDate}
                        checkOutDate={checkOutDate}
                    />
                </motion.div>
            ) : null}

            {screen === "checkout" && selectedProperty && checkout ? (
                <motion.div
                    key="booking-checkout"
                    className="p-2 md:p-6 lg:p-10 xl:px-[150px] min-h-screen overflow-x-hidden"
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
                    <BookingCheckoutForm
                        property={selectedProperty}
                        checkIn={checkout.checkIn}
                        checkOut={checkout.checkOut}
                        onBack={navigateBackToDetails}
                        onSuccess={navigateBackToList}
                    />
                </motion.div>
            ) : null}
        </AnimatePresence>
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
function HeroSection() {
    const shouldReduceMotion = useReducedMotion()

    return (
        <motion.div
            className={cn(HERO_CONTAINER_STYLES)}
            variants={comicPopVariants}
            initial={shouldReduceMotion ? undefined : "initial"}
            animate="animate"
        >
            <h1 className={HERO_TITLE_STYLES}>
                <motion.span
                    className={HERO_PILL_PRIMARY_STYLES}
                    whileHover={shouldReduceMotion ? undefined : gummyHover}
                    whileTap={shouldReduceMotion ? undefined : gummyTap}
                >
                    Find
                </motion.span>
                <span className="inline-block rotate-1">Your</span>
                <br />
                <span className={HERO_UNDERLINE_TEXT_STYLES}>Next Stay</span>
            </h1>
            <motion.p
                className={HERO_SUBTITLE_STYLES}
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
                Explore our curated selection of premium properties available for your dates.
            </motion.p>
        </motion.div>
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
    screen,
    lastViewedPropertyId,
    isTransitioning,
    onNavigateForward
}: {
    screen: BookingViewScreen,
    lastViewedPropertyId: string | null,
    isTransitioning: boolean,
    onNavigateForward: (id: string) => void
}) {
    useEffect(() => {
        if (screen !== "list") return

        let touchStartX = 0
        let touchStartY = 0

        const handleWheel = (e: WheelEvent) => {
            const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
            
            // Deteta scroll horizontal significativo para a direita (avançar)
            if (isHorizontal && lastViewedPropertyId && !isTransitioning) {
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
            if (deltaX < -30 && Math.abs(deltaX) > Math.abs(deltaY) && lastViewedPropertyId && !isTransitioning) {
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
    }, [screen, lastViewedPropertyId, isTransitioning, onNavigateForward])
}

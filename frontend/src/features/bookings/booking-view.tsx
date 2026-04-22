"use client"

/**
 * BookingView — v2
 *
 * Contexto
 * - Ecrã principal do módulo de reservas (bookings) no frontend.
 * - Mantém o fluxo dentro do mesmo “screen” para transições rápidas (sem trocar de rota).
 *
 * Responsabilidades
 * - Carregar propriedades do backend (`PropertyService.getAllProperties()`).
 * - Filtrar propriedades localmente (destino/preço).
 * - Orquestrar navegação interna: list → details → checkout.
 * - Garantir transições suaves com Framer Motion (`AnimatePresence`).
 *
 * UX/Animação
 * - Transições de ecrã usam `pageVariants` (motion.ts) para consistência.
 * - Skeleton loader usa shimmer para comunicar loading sem “saltos” de layout.
 * - Hero e contadores usam stagger/AnimatePresence para dar “vida” sem ruído.
 *
 * Acessibilidade
 * - Mantém navegação por botões/inputs standard nas sub-components.
 * - Gestos (scroll horizontal/swipe) são uma conveniência, não substituem UI.
 *
 * Notas de arquitectura
 * - Este ficheiro mantém só coordenação e estado. A UI detalhada está em components/.
 */

import { useMemo, useState, useEffect, useCallback, useRef } from "react"
import { BookingList } from "./components/booking-list"
import { BookingProperty } from "./components/booking-card"
import { BookingSearchBar } from "./components/booking-search-bar"
import { BookingDetails } from "./components/booking-details"
import { BookingCheckoutForm } from "./components/booking-checkout-form"
import { cn } from "@/lib/utils"
import { PropertyService } from "@/services/property.service"
import { toast } from "sonner"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  comicPopVariants, gummyHover, gummyTap,
  fadeUpEnter,
  pageVariants, staggerContainer, staggerItem,
  shimmerX,
  springSnap, springBounce,
} from "@/features/bookings/motion"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

/** Estados de ecrã internos (sem mudar de rota) para manter transições fluídas. */
type BookingViewScreen = "list" | "details" | "checkout"
/** Acções de limpeza a executar após `AnimatePresence` completar a saída. */
type ExitCleanup = "clearSelected" | "clearCheckout" | "clearAll" | null

/** Filtros de pesquisa usados no ecrã de listagem. */
interface SearchFilters {
  destination: string
  adults: number
  children: number
  maxPrice: number | ""
  checkInDate: Date | null
  checkOutDate: Date | null
}

/** Valores iniciais “safe defaults” para filtros. */
const DEFAULT_FILTERS: SearchFilters = {
  destination: "",
  adults: 1,
  children: 0,
  maxPrice: "",
  checkInDate: null,
  checkOutDate: null,
}

function useBookingCatalog() {
  const [properties, setProperties] = useState<BookingProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await PropertyService.getAllProperties()
      setProperties(data)
    } catch {
      toast.error("Não foi possível carregar as propriedades.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { properties, isLoading, reload: load }
}

// ─────────────────────────────────────────────
// BookingView — root
// ─────────────────────────────────────────────

/**
 * Root da feature de bookings.
 *
 * Fluxo
 * - `screen === "list"`: pesquisa + grid de propriedades.
 * - `screen === "details"`: detalhe de uma propriedade seleccionada.
 * - `screen === "checkout"`: formulário de reserva/pagamento para a propriedade seleccionada.
 *
 * Side-effects
 * - Carrega dados ao montar.
 * - Controla scrollTo(0,0) em cada transição para evitar estados confusos.
 */
export function BookingView() {
  const { properties, isLoading } = useBookingCatalog()
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [selectedProperty, setSelectedProperty] = useState<BookingProperty | null>(null)
  const [checkout, setCheckout] = useState<{ checkIn: string; checkOut: string } | null>(null)
  const [lastViewedPropertyId, setLastViewedPropertyId] = useState<string | null>(null)
  const [screen, setScreen] = useState<BookingViewScreen>("list")
  const [exitCleanup, setExitCleanup] = useState<ExitCleanup>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  /**
   * Setter utilitário: aplica update parcial ao objecto de filtros.
   *
   * Motivo
   * - Evita múltiplos `useState` e reduz prop drilling.
   */
  const setFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const filteredProperties = useMemo(() => {
    let list = properties.filter((p) => p.status === "AVAILABLE")

    if (filters.destination) {
      const term = filters.destination.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.location.toLowerCase().includes(term)
      )
    }

    if (filters.maxPrice !== "") {
      list = list.filter((p) => p.price <= Number(filters.maxPrice))
    }

    return list
  }, [properties, filters.destination, filters.maxPrice])

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage)
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProperties.slice(start, start + itemsPerPage)
  }, [filteredProperties, currentPage, itemsPerPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // ── Navegação entre ecrãs (máquina de estados simples)

  /**
   * Abre o detalhe de uma propriedade (a partir do id).
   *
   * Guardas
   * - Respeita `isTransitioning` para evitar double-clicks durante animação.
   */
  const navigateToDetails = useCallback(
    (id: string) => {
      if (isTransitioning) return
      const property = properties.find((p) => p.id === id)
      if (!property) return
      setLastViewedPropertyId(id)
      setSelectedProperty(property)
      setCheckout(null)
      setExitCleanup(null)
      setIsTransitioning(true)
      setScreen("details")
      window.scrollTo(0, 0)
    },
    [isTransitioning, properties]
  )

  /**
   * Volta à lista e limpa selecção/checkout após terminar animação de saída.
   *
   * Nota
   * - A limpeza real acontece em `onExitComplete` para não haver “flash” durante a animação.
   */
  const navigateBackToList = useCallback(() => {
    if (isTransitioning) return
    setExitCleanup("clearAll")
    setIsTransitioning(true)
    setScreen("list")
    window.scrollTo(0, 0)
  }, [isTransitioning])

  /**
   * Avança para checkout mantendo a propriedade seleccionada.
   *
   * Entrada
   * - `payload` vem do BookingDetails (datas confirmadas).
   */
  const navigateToCheckout = useCallback(
    (payload: { checkIn: string; checkOut: string }) => {
      if (isTransitioning) return
      setCheckout(payload)
      setExitCleanup(null)
      setIsTransitioning(true)
      setScreen("checkout")
      window.scrollTo(0, 0)
    },
    [isTransitioning]
  )

  /**
   * Volta do checkout para os detalhes, preservando propriedade.
   *
   * Motivo
   * - Permite editar datas/ver detalhes sem recomeçar o fluxo.
   */
  const navigateBackToDetails = useCallback(() => {
    if (isTransitioning) return
    setExitCleanup("clearCheckout")
    setIsTransitioning(true)
    setScreen("details")
    window.scrollTo(0, 0)
  }, [isTransitioning])

  useNavigationGestures({
    screen,
    lastViewedPropertyId,
    isTransitioning,
    onNavigateForward: navigateToDetails,
  })

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        /**
         * Cleanup pós-animação.
         * Mantém o estado consistente com o screen final e evita “stale UI”.
         */
        if (exitCleanup === "clearCheckout") setCheckout(null)
        if (exitCleanup === "clearSelected") setSelectedProperty(null)
        if (exitCleanup === "clearAll") { setCheckout(null); setSelectedProperty(null) }
        setExitCleanup(null)
        setIsTransitioning(false)
      }}
    >
      {/* ── List screen */}
      {screen === "list" && (
        <motion.div
          key="booking-list"
          className="flex flex-col space-y-6 p-2 md:p-6 lg:p-10 xl:px-[150px] min-h-screen overflow-x-hidden"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <HeroSection />

          {/* Search bar wrapper */}
          <motion.div
            {...fadeUpEnter(0.35, 10, 0.32)}
            className="rounded-2xl border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)] p-3 md:p-4"
          >
            <BookingSearchBar
              destination={filters.destination}
              checkInDate={filters.checkInDate}
              checkOutDate={filters.checkOutDate}
              adults={filters.adults}
              childrenCount={filters.children}
              maxPrice={filters.maxPrice}
              onDestinationChange={(v) => setFilter("destination", v)}
              onCheckInChange={(v) => setFilter("checkInDate", v)}
              onCheckOutChange={(v) => setFilter("checkOutDate", v)}
              onAdultsChange={(v) => setFilter("adults", v)}
              onChildrenChange={(v) => setFilter("children", v)}
              onMaxPriceChange={(v) => setFilter("maxPrice", v)}
              className="bg-transparent shadow-none border-0 p-0"
            />
          </motion.div>

          {/* Results */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-foreground/10 hidden md:block" />
            {isLoading ? (
              <PropertySkeletons />
            ) : (
              <>
                <ResultsHeader
                  count={filteredProperties.length}
                  hasFilter={Boolean(filters.destination || filters.maxPrice !== "")}
                />
                <BookingList properties={paginatedProperties} onBook={navigateToDetails} />

                {/* Pagination Control */}
                <BookingPagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Details screen */}
      {screen === "details" && selectedProperty && (
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
            checkInDate={filters.checkInDate}
            checkOutDate={filters.checkOutDate}
          />
        </motion.div>
      )}

      {/* ── Checkout screen */}
      {screen === "checkout" && selectedProperty && checkout && (
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
      )}
    </AnimatePresence>
  )
}

// ─────────────────────────────────────────────
// HeroSection — word-stagger title + animated underline
// ─────────────────────────────────────────────

const HERO_WORDS = [
  { text: "Find",      pill: true,  rotate: "-rotate-1", underline: false },
  { text: "Your",      pill: false, rotate: "rotate-1",  underline: false },
  { text: "Next Stay", pill: false, rotate: "",         underline: true },
] as const

/**
 * Hero da listagem (título “word-stagger” + sublinhado animado).
 * Mantém-se isolado para não poluir o componente root.
 */
/**
 * Hero da listagem.
 *
 * Detalhes
 * - Usa stagger por palavra para um título “editorial”.
 * - Mantém reduced-motion através de `useReducedMotion`.
 */
function HeroSection() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className="flex flex-col space-y-2 mb-6"
      variants={comicPopVariants}
      initial={shouldReduceMotion ? undefined : "initial"}
      animate="animate"
    >
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter uppercase mb-2 leading-[0.92]">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="flex flex-wrap items-baseline gap-x-3 gap-y-1"
        >
          {HERO_WORDS.map(({ text, pill, rotate, underline }) => (
            <motion.span
              key={text}
              variants={staggerItem}
              whileHover={shouldReduceMotion ? undefined : { ...gummyHover, transition: springSnap }}
              whileTap={shouldReduceMotion ? undefined : gummyTap}
              className={cn(
                "inline-block cursor-default",
                rotate,
                pill && "bg-primary text-primary-foreground px-2 shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.9)]",
                underline && "relative"
              )}
            >
              {text}
              {/* Animated underline on "Next Stay" */}
              {underline && (
                <motion.span
                  className="absolute bottom-1 left-0 h-[4px] bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </motion.span>
          ))}
        </motion.div>
      </h1>

      <motion.p
        className="text-lg md:text-xl text-muted-foreground font-mono max-w-2xl border-l-4 border-primary pl-4"
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        Explora a nossa seleção de propriedades premium disponíveis para as tuas datas.
      </motion.p>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// ResultsHeader — animated count
// ─────────────────────────────────────────────

/** Cabeçalho de resultados com contador animado (valor troca com `AnimatePresence`). */
/**
 * Cabeçalho de resultados.
 *
 * - Mostra count animado.
 * - Ajusta label consoante existirem filtros activos.
 */
function ResultsHeader({ count, hasFilter }: { count: number; hasFilter: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <AnimatePresence mode="wait">
        <motion.span
          key={count}
          initial={{ opacity: 0, y: -8, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.85 }}
          transition={springBounce}
          className="inline-flex items-center justify-center h-7 min-w-[28px] px-2 rounded-full border-2 border-foreground bg-primary text-primary-foreground font-black font-mono text-xs shadow-[2px_2px_0_0_rgb(0,0,0)]"
        >
          {count}
        </motion.span>
      </AnimatePresence>
      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {hasFilter ? "resultados filtrados" : "propriedades disponíveis"}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────
// BookingPagination — isolated pagination logic
// ─────────────────────────────────────────────

interface BookingPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Sub-componente de paginação.
 *
 * Responsabilidade:
 * - Renderizar UI de paginação compatível com Neo-Brutalism.
 * - Gerir lógica de visibilidade de páginas (elipses).
 */
function BookingPagination({ currentPage, totalPages, onPageChange }: BookingPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <motion.div
      {...fadeUpEnter(0.4, 10, 0.3)}
      className="mt-12 py-6 border-t-2 border-foreground/10"
    >
      <Pagination>
        <PaginationContent>
          {/* Previous Button */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage > 1) onPageChange(currentPage - 1)
              }}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1
            const isNearAction = Math.abs(currentPage - pageNum) <= 1
            const isEnd = pageNum === 1 || pageNum === totalPages

            if (!isNearAction && !isEnd) {
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }
              return null
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  isActive={currentPage === pageNum}
                  onClick={(e) => {
                    e.preventDefault()
                    onPageChange(pageNum)
                  }}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          {/* Next Button */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (currentPage < totalPages) onPageChange(currentPage + 1)
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// PropertySkeletons — animated loading state
// ─────────────────────────────────────────────

/** Estado de loading: skeleton grid com shimmer animado. */
/**
 * Estado de loading para a listagem.
 *
 * Motivo
 * - Mostra estrutura aproximada do grid e reduz layout shift.
 * - Usa shimmer para sugerir carregamento sem bloquear a UI.
 */
function PropertySkeletons() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          variants={staggerItem}
          className="rounded-2xl border-2 border-foreground/20 bg-muted/30 overflow-hidden shadow-[3px_3px_0_0_rgb(0,0,0,0.06)]"
        >
          {/* Image placeholder */}
          <div className="h-44 bg-muted/50 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent"
              {...shimmerX(i * 0.08)}
            />
          </div>
          {/* Text lines */}
          <div className="p-4 space-y-2.5">
            <div className="h-4 rounded-full bg-muted/70 w-3/4 overflow-hidden relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent"
                {...shimmerX(i * 0.08 + 0.1)}
              />
            </div>
            <div className="h-3 rounded-full bg-muted/50 w-1/2 overflow-hidden relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent"
                {...shimmerX(i * 0.08 + 0.18)}
              />
            </div>
            <div className="flex justify-between items-center pt-1">
              <div className="h-3 rounded-full bg-muted/40 w-16" />
              <div className="h-8 rounded-lg bg-muted/50 w-20" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// useNavigationGestures
// ─────────────────────────────────────────────

/**
 * Hook de navegação por gestos no ecrã de listagem.
 *
 * Suporte
 * - Trackpad horizontal (WheelEvent deltaX)
 * - Swipe (touchstart/touchend)
 *
 * Guardas
 * - Só corre quando `screen === "list"`
 * - Só navega quando existe `lastViewedPropertyId`
 * - Respeita `isTransitioning`
 */
function useNavigationGestures({
  screen,
  lastViewedPropertyId,
  isTransitioning,
  onNavigateForward,
}: {
  screen: BookingViewScreen
  lastViewedPropertyId: string | null
  isTransitioning: boolean
  onNavigateForward: (id: string) => void
}) {
  /** Ref estável para evitar re-attach de listeners quando o callback muda de identidade. */
  const onForwardRef = useRef(onNavigateForward)
  useEffect(() => { onForwardRef.current = onNavigateForward }, [onNavigateForward])

  useEffect(() => {
    if (screen !== "list") return

    let startX = 0
    let startY = 0

    const handleWheel = (e: WheelEvent) => {
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY)
      if (isHorizontal && e.deltaX > 20 && lastViewedPropertyId && !isTransitioning) {
        onForwardRef.current(lastViewedPropertyId)
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX
      const dy = e.changedTouches[0].clientY - startY
      if (dx < -30 && Math.abs(dx) > Math.abs(dy) && lastViewedPropertyId && !isTransitioning) {
        onForwardRef.current(lastViewedPropertyId)
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: true })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchend", handleTouchEnd, { passive: true })

    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchend", handleTouchEnd)
    }
  }, [screen, lastViewedPropertyId, isTransitioning])
}

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
import { BookingList } from "../components/booking-list"
import type { BookingProperty } from "@/types/booking"
import { BookingSearchBar } from "../components/booking-search-bar"
import { BookingDetails } from "../components/booking-details"
import { BookingCheckoutForm } from "../components/booking-checkout-form"
import { cn } from "@/lib/utils"
import { PropertyService } from "@/services/property.service"
import { notify } from "@/lib/notify"
import { bookingsTokens } from "@/features/bookings/tokens"
import { FinanceService } from "@/services/finance.service"
import { PaymentDetails } from "@/features/finance/components/payment-details"
import { StripePaymentPanel } from "@/features/finance/components/stripe-payment-panel"
import type { PaymentMethod, PaymentResponse, ProviderInfo } from "@/types/finance"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  comicPopVariants, gummyHover, gummyTap,
  fadeUpEnter,
  pageVariants, staggerContainer, staggerItem,
  shimmerX,
  springSnap, springBounce,
} from "@/features/bookings/lib/motion"
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

type BookingQuickAccessPayload = {
  propertyId: string
  checkIn: string
  checkOut: string
}

const BOOKING_QUICK_ACCESS_STORAGE_KEY = "booking:quick-access"

type BookingResumePaymentPayload = {
  bookingId: number
  propertyId?: string
}

const BOOKING_RESUME_PAYMENT_STORAGE_KEY = "booking:resume-payment"

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
      notify.error(bookingsTokens.copy.errors.loadProperties)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { properties, isLoading, reload: load }
}

function useBookingFlow(properties: BookingProperty[]) {
  const [selectedProperty, setSelectedProperty] = useState<BookingProperty | null>(null)
  const [checkout, setCheckout] = useState<{ checkIn: string; checkOut: string } | null>(null)
  const [lastViewedPropertyId, setLastViewedPropertyId] = useState<string | null>(null)
  const [resumePayment, setResumePayment] = useState<BookingResumePaymentPayload | null>(null)
  const [screen, setScreen] = useState<BookingViewScreen | "resume-payment">("list")
  const [exitCleanup, setExitCleanup] = useState<ExitCleanup>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

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

  const navigateBackToList = useCallback(() => {
    if (screen === "list") return
    setExitCleanup("clearAll")
    setIsTransitioning(true)
    setScreen("list")
    window.scrollTo(0, 0)
  }, [screen])

  const navigateToCheckout = useCallback(
    (payload: { checkIn: string; checkOut: string }) => {
      if (isTransitioning) return
      setCheckout(payload)
      setResumePayment(null)
      setExitCleanup(null)
      setIsTransitioning(true)
      setScreen("checkout")
      window.scrollTo(0, 0)
    },
    [isTransitioning]
  )

  const openCheckoutForQuickAccess = useCallback((payload: BookingQuickAccessPayload) => {
    if (isTransitioning) return
    const property = properties.find((p) => p.id === payload.propertyId)
    if (!property) return
    if (property.status !== "AVAILABLE") {
      notify.warning("Esta propriedade não está disponível para novas reservas.")
      return
    }
    setLastViewedPropertyId(payload.propertyId)
    setSelectedProperty(property)
    setCheckout({ checkIn: payload.checkIn, checkOut: payload.checkOut })
    setResumePayment(null)
    setExitCleanup(null)
    setIsTransitioning(true)
    setScreen("checkout")
    window.scrollTo(0, 0)
  }, [isTransitioning, properties])

  const openResumePayment = useCallback((payload: BookingResumePaymentPayload) => {
    if (isTransitioning) return
    const propertyId = payload.propertyId ?? null
    const property = propertyId ? properties.find((p) => p.id === propertyId) ?? null : null
    if (propertyId) setLastViewedPropertyId(propertyId)
    if (property) setSelectedProperty(property)
    setCheckout(null)
    setResumePayment(payload)
    setExitCleanup(null)
    setIsTransitioning(true)
    setScreen("resume-payment")
    window.scrollTo(0, 0)
  }, [isTransitioning, properties])

  const navigateBackToDetails = useCallback(() => {
    if (screen === "details") return
    setExitCleanup("clearCheckout")
    setIsTransitioning(true)
    setScreen("details")
    window.scrollTo(0, 0)
  }, [screen])

  const onExitComplete = useCallback(() => {
    /**
     * Cleanup pós-animação.
     * Mantém o estado consistente com o screen final e evita “stale UI”.
     */
    if (exitCleanup === "clearCheckout") setCheckout(null)
    if (exitCleanup === "clearSelected") setSelectedProperty(null)
    if (exitCleanup === "clearAll") {
      setCheckout(null)
      setSelectedProperty(null)
      setResumePayment(null)
    }
    setExitCleanup(null)
    setIsTransitioning(false)
  }, [exitCleanup])

  return {
    screen,
    selectedProperty,
    checkout,
    resumePayment,
    lastViewedPropertyId,
    isTransitioning,
    navigateToDetails,
    navigateBackToList,
    navigateToCheckout,
    openCheckoutForQuickAccess,
    openResumePayment,
    navigateBackToDetails,
    onExitComplete,
  }
}

function useBookingListModel(properties: BookingProperty[], firstPageSize: number, pageSize: number) {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [currentPage, setCurrentPage] = useState(1)

  const setFilter = useCallback(
    <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
      setCurrentPage((prev) => (prev === 1 ? prev : 1))
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

  const totalPages = useMemo(() => {
    const total = filteredProperties.length
    if (total <= firstPageSize) return Math.max(1, total === 0 ? 1 : 1)
    return 1 + Math.ceil((total - firstPageSize) / pageSize)
  }, [filteredProperties.length, firstPageSize, pageSize])

  const safePage = useMemo(() => {
    if (totalPages <= 1) return 1
    return Math.min(Math.max(currentPage, 1), totalPages)
  }, [currentPage, totalPages])

  const paginatedProperties = useMemo(() => {
    if (safePage <= 1) return filteredProperties.slice(0, firstPageSize)
    const start = firstPageSize + (safePage - 2) * pageSize
    return filteredProperties.slice(start, start + pageSize)
  }, [filteredProperties, safePage, firstPageSize, pageSize])

  return {
    filters,
    setFilter,
    filteredProperties,
    paginatedProperties,
    currentPage: safePage,
    setCurrentPage,
    totalPages,
  }
}

function BookingListScreen({
  filters,
  setFilter,
  isLoading,
  filteredCount,
  paginatedProperties,
  currentPage,
  totalPages,
  onPageChange,
  onOpenDetails,
}: {
  filters: SearchFilters
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void
  isLoading: boolean
  filteredCount: number
  paginatedProperties: BookingProperty[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onOpenDetails: (id: string) => void
}) {
  return (
    <motion.div
      key="booking-list"
      className="flex flex-col space-y-6 p-2 md:p-6 lg:p-10 xl:px-[150px] min-h-screen overflow-x-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <HeroSection />

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

      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-foreground/10 hidden md:block" />
        {isLoading ? (
          <PropertySkeletons />
        ) : (
          <>
            <ResultsHeader
              count={filteredCount}
              hasFilter={Boolean(filters.destination || filters.maxPrice !== "")}
            />
            <BookingList
              properties={paginatedProperties}
              onBook={onOpenDetails}
              showHowItWorks={currentPage === 1}
            />

            <BookingPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>
    </motion.div>
  )
}

function BookingDetailsScreen({
  property,
  onBack,
  onCheckout,
  checkInDate,
  checkOutDate,
}: {
  property: BookingProperty
  onBack: () => void
  onCheckout: (payload: { checkIn: string; checkOut: string }) => void
  checkInDate: Date | null
  checkOutDate: Date | null
}) {
  return (
    <motion.div
      key="booking-details"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <BookingDetails
        property={property}
        onBack={onBack}
        onCheckout={onCheckout}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
      />
    </motion.div>
  )
}

function BookingCheckoutScreen({
  property,
  checkout,
  onBack,
  onSuccess,
}: {
  property: BookingProperty
  checkout: { checkIn: string; checkOut: string }
  onBack: () => void
  onSuccess: () => void
}) {
  return (
    <motion.div
      key="booking-checkout"
      className="p-2 md:p-6 lg:p-10 xl:px-[150px] min-h-screen overflow-x-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <BookingCheckoutForm
        property={property}
        checkIn={checkout.checkIn}
        checkOut={checkout.checkOut}
        onBack={onBack}
        onSuccess={onSuccess}
      />
    </motion.div>
  )
}

function BookingResumePaymentScreen({
  bookingId,
  property,
  onBack,
}: {
  bookingId: number
  property: BookingProperty | null
  onBack: () => void
}) {
  const [payment, setPayment] = useState<PaymentResponse | null>(null)
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD")
  const [reloadNonce, setReloadNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setError(null)
        const [info, intent] = await Promise.all([
          FinanceService.getPaymentProviderInfo(),
          FinanceService.createPaymentIntent({ bookingId, paymentMethod }),
        ])
        if (cancelled) return
        setProviderInfo(info)
        setPayment(intent)
      } catch {
        if (cancelled) return
        setProviderInfo(null)
        setPayment(null)
        setError("Não foi possível iniciar o pagamento.")
      }
    }
    void load()
    return () => { cancelled = true }
  }, [bookingId, paymentMethod, reloadNonce])

  const stripeClientSecret = useMemo(() => {
    if (!payment || typeof payment !== "object") return null
    const s = (payment as Record<string, unknown>)["clientSecret"]
    return typeof s === "string" && s.length > 0 ? s : null
  }, [payment])

  const stripePublishableKey = useMemo(() => {
    const caps = providerInfo?.capabilities as Record<string, unknown> | undefined
    const fromCaps = caps && typeof caps["publishableKey"] === "string" ? (caps["publishableKey"] as string) : ""
    const fromEnv = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
    return (fromCaps || fromEnv).trim()
  }, [providerInfo])

  const confirm = useCallback(async (paymentIntentId: string) => {
    try {
      await FinanceService.confirmPayment({ bookingId, paymentIntentId, metadata: { bookingId } })
    } catch {
      notify.error("Falhou confirmar pagamento.")
    }
  }, [bookingId])

  const paymentAmount = useMemo(() => {
    const v = (payment as Record<string, unknown> | null)?.["amount"]
    return typeof v === "number" && Number.isFinite(v) ? v : 0
  }, [payment])

  const paymentCurrency = useMemo(() => {
    const v = (payment as Record<string, unknown> | null)?.["currency"]
    return typeof v === "string" && v.length > 0 ? v : "EUR"
  }, [payment])

  return (
    <motion.div
      key="booking-resume-payment"
      className="p-2 md:p-6 lg:p-10 xl:px-[150px] min-h-screen overflow-x-hidden"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={onBack}
          className={cn("mb-6 flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors")}
        >
          ← Voltar
        </button>

        <div className="rounded-2xl border-2 border-foreground bg-background shadow-[6px_6px_0_0_rgb(0,0,0)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.9)] p-5 md:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-black uppercase tracking-tight">Retomar pagamento</div>
              <div className="mt-1 text-xs font-mono text-muted-foreground">
                Reserva #{bookingId}{property ? ` · ${property.title}` : ""}
              </div>
            </div>
          </div>

          {providerInfo?.supportedPaymentMethods?.length ? (
            <div className="space-y-2">
              <div className="text-[11px] font-black uppercase tracking-widest">Método de pagamento</div>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="h-11 w-full rounded-md border-2 border-foreground bg-background px-3 text-sm font-mono shadow-[3px_3px_0_0_rgb(0,0,0)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                {providerInfo.supportedPaymentMethods
                  .filter((m) => m === "CREDIT_CARD" || m === "MB_WAY")
                  .map((m) => (
                    <option key={m} value={m}>
                      {m === "CREDIT_CARD" ? "Cartão" : m === "MB_WAY" ? "MB WAY" : m}
                    </option>
                  ))}
              </select>
            </div>
          ) : null}

          <PaymentDetails
            bookingId={bookingId}
            payment={payment}
            providerInfo={providerInfo}
            labelClassName="text-[11px] font-black uppercase tracking-widest"
            error={error}
            onRetry={() => setReloadNonce((n) => n + 1)}
          />

          {providerInfo?.name === "Stripe" && stripeClientSecret && stripePublishableKey ? (
            <StripePaymentPanel
              publishableKey={stripePublishableKey}
              clientSecret={stripeClientSecret}
              bookingId={bookingId}
              total={paymentAmount}
              currency={paymentCurrency}
              onConfirmed={confirm}
            />
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

function useBookingSidebarActions({
  properties,
  openCheckoutForQuickAccess,
  openResumePayment,
}: {
  properties: BookingProperty[]
  openCheckoutForQuickAccess: (payload: BookingQuickAccessPayload) => void
  openResumePayment: (payload: BookingResumePaymentPayload) => void
}) {
  const [pendingQuickAccess, setPendingQuickAccess] = useState<BookingQuickAccessPayload | null>(null)
  const [pendingResume, setPendingResume] = useState<BookingResumePaymentPayload | null>(null)

  const applyQuickAccess = useCallback((payload: BookingQuickAccessPayload) => {
    if (!payload?.propertyId || !payload?.checkIn || !payload?.checkOut) return
    if (properties.length === 0) {
      setPendingQuickAccess(payload)
      return
    }
    openCheckoutForQuickAccess(payload)
  }, [openCheckoutForQuickAccess, properties.length])

  const applyResumePayment = useCallback((payload: BookingResumePaymentPayload) => {
    if (!payload?.bookingId) return
    if (properties.length === 0) {
      setPendingResume(payload)
      return
    }
    openResumePayment(payload)
  }, [openResumePayment, properties.length])

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(BOOKING_QUICK_ACCESS_STORAGE_KEY)
      if (raw) {
        sessionStorage.removeItem(BOOKING_QUICK_ACCESS_STORAGE_KEY)
        const parsed = JSON.parse(raw) as Partial<BookingQuickAccessPayload> | null
        if (parsed?.propertyId && parsed?.checkIn && parsed?.checkOut) {
          applyQuickAccess({
            propertyId: String(parsed.propertyId),
            checkIn: String(parsed.checkIn),
            checkOut: String(parsed.checkOut),
          })
        }
      }
    } catch {}

    try {
      const raw = sessionStorage.getItem(BOOKING_RESUME_PAYMENT_STORAGE_KEY)
      if (raw) {
        sessionStorage.removeItem(BOOKING_RESUME_PAYMENT_STORAGE_KEY)
        const parsed = JSON.parse(raw) as Partial<BookingResumePaymentPayload> | null
        const bookingId = typeof parsed?.bookingId === "number" ? parsed.bookingId : Number(parsed?.bookingId)
        if (Number.isFinite(bookingId) && bookingId > 0) {
          applyResumePayment({ bookingId, propertyId: parsed?.propertyId ? String(parsed.propertyId) : undefined })
        }
      }
    } catch {}

    const onQuickAccess = (ev: Event) => {
      const custom = ev as CustomEvent<Partial<BookingQuickAccessPayload>>
      const detail = custom.detail
      if (!detail?.propertyId || !detail?.checkIn || !detail?.checkOut) return
      applyQuickAccess({
        propertyId: String(detail.propertyId),
        checkIn: String(detail.checkIn),
        checkOut: String(detail.checkOut),
      })
    }

    const onResume = (ev: Event) => {
      const custom = ev as CustomEvent<Partial<BookingResumePaymentPayload>>
      const detail = custom.detail
      const bookingId = typeof detail?.bookingId === "number" ? detail.bookingId : Number(detail?.bookingId)
      if (!Number.isFinite(bookingId) || bookingId <= 0) return
      applyResumePayment({ bookingId, propertyId: detail?.propertyId ? String(detail.propertyId) : undefined })
    }

    window.addEventListener("booking-quick-access", onQuickAccess as EventListener)
    window.addEventListener("booking-resume-payment", onResume as EventListener)
    return () => {
      window.removeEventListener("booking-quick-access", onQuickAccess as EventListener)
      window.removeEventListener("booking-resume-payment", onResume as EventListener)
    }
  }, [applyQuickAccess, applyResumePayment])

  useEffect(() => {
    if (!pendingQuickAccess || properties.length === 0) return
    openCheckoutForQuickAccess(pendingQuickAccess)
    setPendingQuickAccess(null)
  }, [openCheckoutForQuickAccess, pendingQuickAccess, properties.length])

  useEffect(() => {
    if (!pendingResume || properties.length === 0) return
    openResumePayment(pendingResume)
    setPendingResume(null)
  }, [openResumePayment, pendingResume, properties.length])
}

export function BookingView() {
  const { properties, isLoading } = useBookingCatalog()
  const firstPageSize = 31
  const pageSize = 32

  const {
    screen,
    selectedProperty,
    checkout,
    resumePayment,
    lastViewedPropertyId,
    isTransitioning,
    navigateToDetails,
    navigateBackToList,
    navigateToCheckout,
    openCheckoutForQuickAccess,
    openResumePayment,
    navigateBackToDetails,
    onExitComplete,
  } = useBookingFlow(properties)

  const {
    filters,
    setFilter,
    filteredProperties,
    paginatedProperties,
    currentPage,
    setCurrentPage,
    totalPages,
  } = useBookingListModel(properties, firstPageSize, pageSize)

  useNavigationGestures({
    screen,
    lastViewedPropertyId,
    isTransitioning,
    onNavigateForward: navigateToDetails,
  })

  useBookingSidebarActions({ properties, openCheckoutForQuickAccess, openResumePayment })

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={onExitComplete}
    >
      {screen === "list" && (
        <BookingListScreen
          key="booking-list"
          filters={filters}
          setFilter={setFilter}
          isLoading={isLoading}
          filteredCount={filteredProperties.length}
          paginatedProperties={paginatedProperties}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onOpenDetails={navigateToDetails}
        />
      )}

      {screen === "details" && selectedProperty && (
        <BookingDetailsScreen
          key="booking-details"
          property={selectedProperty}
          onBack={navigateBackToList}
          onCheckout={navigateToCheckout}
          checkInDate={filters.checkInDate}
          checkOutDate={filters.checkOutDate}
        />
      )}

      {screen === "checkout" && selectedProperty && checkout && (
        <BookingCheckoutScreen
          key="booking-checkout"
          property={selectedProperty}
          checkout={checkout}
          onBack={navigateBackToDetails}
          onSuccess={navigateBackToList}
        />
      )}

      {screen === "resume-payment" && resumePayment && (
        <BookingResumePaymentScreen
          bookingId={resumePayment.bookingId}
          property={selectedProperty}
          onBack={navigateBackToList}
        />
      )}
    </AnimatePresence>
  )
}

const HERO_WORDS = [
  { text: "Find",      pill: true,  rotate: "-rotate-1", underline: false },
  { text: "Your",      pill: false, rotate: "rotate-1",  underline: false },
  { text: "Next Stay", pill: false, rotate: "",         underline: true },
] as const

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

interface BookingPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function BookingPagination({ currentPage, totalPages, onPageChange }: BookingPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <motion.div
      {...fadeUpEnter(0.4, 10, 0.3)}
      className="mt-12 py-6 border-t-2 border-foreground/10"
    >
      <Pagination>
        <PaginationContent>
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
          <div className="h-44 bg-muted/50 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent"
              {...shimmerX(i * 0.08)}
            />
          </div>
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

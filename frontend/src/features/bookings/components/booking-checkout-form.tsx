"use client"

/**
 * BookingCheckoutForm — v2 (single-page scroll)
 *
 * Contexto
 * - Formulário de reserva (checkout) apresentado no fluxo BookingView → BookingDetails → Checkout.
 * - Mantém-se no mesmo screen (sem navegação de rota) para transições rápidas.
 *
 * Arquitectura (mobile-first)
 * - Página única com scroll: evita “wizard fatigue” e mantém contexto visível.
 * - Secções progressivas (locked/unlocked) com validação por RHF+Zod.
 * - Sidebar sticky em desktop: resumo, snapshot do hóspede e tracker de progresso.
 *
 * Segurança e validação
 * - Todas as entradas passam por normalização (sanitização) antes de seguirem para o payload.
 * - Zod garante regras formais antes do submit (inclui campos SEF dinâmicos).
 *
 * Integrações (não alterar lógica de negócio)
 * - `BookingService.createBooking` mantém-se como fonte de verdade para reservas.
 * - `FinanceService` gere intents/confirmations de pagamento via finance-service.
 * - Sessão: pré-preenche contacto se existir JWT válido (localStorage) e mantém modo Guest.
 *
 * Acessibilidade
 * - O progresso não depende de gestos; botões e links funcionam com teclado.
 * - Respeita `prefers-reduced-motion` através de presets na UI (onde aplicável).
 */

import React from "react"
import { differenceInCalendarDays, format, parseISO } from "date-fns"
import { motion } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
  type Resolver,
} from "react-hook-form"
import type { DateRange } from "react-day-picker"
import { z } from "zod"
import { notify } from "@/lib/notify"
import { Check, ChevronRight, Lock, Loader2, ArrowLeft, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/forms/button"
import { Input } from "@/components/ui/forms/input"
import { BrutalCalendar } from "@/components/ui/calendars/calendar"
import { NexusAlert } from "@/components/ui/feedback/nexus-alert"
import type { BookingProperty } from "@/types/booking"
import { BookingService } from "@/services/booking.service"
import { AuthService } from "@/services/auth.service"
import { FinanceService } from "@/services/finance.service"
import type { PaymentMethod, PaymentResponse, ProviderInfo } from "@/types/finance"
import { cn } from "@/lib/utils"
import { propertiesAxios, usersAxios, type ApiResponse } from "@/lib/axiosAPI"
import type { PropertyQuoteResponse } from "@/types/property"
import { useMediaQuery } from "@/hooks/use-media-query"
import { PaymentDetails } from "@/features/finance/components/payment-details"
import { StripePaymentPanel } from "@/features/finance/components/stripe-payment-panel"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type BookingCheckoutParams = {
  property: BookingProperty
  checkIn: string
  checkOut: string
  onBack: () => void
  onSuccess: () => void
}

type DocumentType = "CC" | "PASSPORT"

type CheckoutFormValues = {
  fullName: string
  email: string
  phone: string
  guestCount: number
  nationality: string
  issuingCountry: string
  documentNumber: string
  passportNumber: string
  passportIssueDate: string
}

type MeResponse = {
  id: number
  email: string
  phone: string | null
  role: string | null
  clerkUserId: string | null
}

// ─────────────────────────────────────────────
// Design tokens — single source of truth
// ─────────────────────────────────────────────

const tk = {
  card: "rounded-xl border-2 border-foreground bg-background shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.8)]",
  cardLg: "rounded-2xl border-2 border-foreground bg-background shadow-[6px_6px_0_0_rgb(0,0,0)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.8)]",
  label: "text-[11px] font-black uppercase tracking-widest",
  mono: "text-xs font-mono text-muted-foreground",
  divider: "border-t border-foreground/10",
} as const

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const EMAIL_REGEX =
  /^(?!.*\.\.)(?!\.)([A-Z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Z0-9!#$%&'*+/=?^_`{|}~-]+)*)@([A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i

const CLEANING_FEE_EUR = 25
const TOURIST_TAX_PER_PERSON_PER_NIGHT_EUR = 2
const TOURIST_TAX_MAX_NIGHTS = 7

const NATIONALITY_OPTIONS = [
  { value: "PT", label: "Portugal" },
  { value: "ES", label: "Espanha" },
  { value: "FR", label: "França" },
  { value: "DE", label: "Alemanha" },
  { value: "GB", label: "Reino Unido" },
  { value: "US", label: "Estados Unidos" },
  { value: "BR", label: "Brasil" },
  { value: "AO", label: "Angola" },
  { value: "MZ", label: "Moçambique" },
] as const

// ─────────────────────────────────────────────
// Normalize helpers
// ─────────────────────────────────────────────

const normalize = {
  fullName(v: string) {
    return v.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().replace(/[^\p{L}\p{M}' -]/gu, "")
  },
  phone(v: string) {
    const t = v.trim()
    const isIntl = t.startsWith("+")
    const digits = t.replace(/\D/g, "")
    if (isIntl) {
      const d = digits.slice(0, 15)
      return d ? `+${(d.match(/.{1,3}/g) ?? []).join(" ")}` : "+"
    }
    return (digits.slice(0, 9).match(/.{1,3}/g) ?? []).join(" ")
  },
  phoneError(v: string): string | undefined {
    const t = v.trim()
    if (!t) return "Obrigatório."
    const digits = t.replace(/\D/g, "")
    if (t.startsWith("+")) return digits.length < 7 ? "Número inválido." : undefined
    return digits.length !== 9 ? "Formato: 999 999 999" : undefined
  },
  countryCode(v: string) {
    return v.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 2)
  },
  documentNumber(v: string) {
    return v.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 20)
  },
  nicRaw(v: string) {
    return v.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 12)
  },
  nicIsValid(v: string) {
    return /^\d{9}[A-Z]{2}\d$/.test(this.nicRaw(v))
  },
  nic(v: string) {
    const raw = this.nicRaw(v)
    const p1 = raw.slice(0, 8)
    const p2 = raw.slice(8, 9)
    const p3 = raw.slice(9, 11)
    const p4 = raw.slice(11, 12)
    return [p1, p2, p3, p4].filter(Boolean).join(" ")
  },
  clampInt(v: string, min: number, max: number) {
    const n = Number(v.replace(/\D/g, "") || String(min))
    return Number.isNaN(n) ? min : Math.min(max, Math.max(min, n))
  },
} as const

// ─────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────

function parseDate(v: string): Date | null {
  try {
    const d = parseISO(v)
    return Number.isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

const TODAY = new Date(new Date().setHours(0, 0, 0, 0))

function formatMoney(amount: number, currency: string) {
  const safeAmount = Number.isFinite(amount) ? amount : 0
  try {
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency }).format(safeAmount)
  } catch {
    return `${currency} ${safeAmount.toFixed(2)}`
  }
}

function calcTouristTax(nights: number, guestCount: number) {
  const billableNights = Math.min(Math.max(0, nights), TOURIST_TAX_MAX_NIGHTS)
  const guests = Math.max(1, guestCount)
  return billableNights * guests * TOURIST_TAX_PER_PERSON_PER_NIGHT_EUR
}

function nationalityLabel(code: string) {
  return (
    NATIONALITY_OPTIONS.find((o) => o.value === normalize.countryCode(code || "PT"))?.label ?? code
  )
}

function readAuthSession() {
  const session = AuthService.getSession()
  const ok = Boolean(session.token && session.email && isJwtValid(session.token))
  const id = ok ? Number(session.userId) : NaN
  return { isAuthenticated: ok, userId: Number.isFinite(id) ? id : null, email: ok ? session.email : "" }
}

function isJwtValid(token: string) {
  const parts = token.split(".")
  if (parts.length < 2) return false
  try {
    const p = JSON.parse(
      atob(padBase64(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
    ) as { exp?: number }
    return Boolean(p.exp && p.exp > Math.floor(Date.now() / 1000) + 15)
  } catch {
    return false
  }
}

function padBase64(s: string) {
  return s + "=".repeat((4 - (s.length % 4)) % 4)
}

// ─────────────────────────────────────────────
// Validation schema
// ─────────────────────────────────────────────

const checkoutBaseSchema = z.object({
  fullName: z.string().trim().min(3, "Mínimo 3 caracteres."),
  email: z.string().trim().regex(EMAIL_REGEX, "Email inválido."),
  phone: z
    .string()
    .trim()
    .refine((v) => normalize.phoneError(v) == null, "Telefone inválido."),
  guestCount: z.number().int().min(1).max(20),
  nationality: z.string().trim().min(2).max(10),
  issuingCountry: z.string().trim(),
  documentNumber: z.string().trim(),
  passportNumber: z.string().trim(),
  passportIssueDate: z.string().trim(),
})

// ─────────────────────────────────────────────
// useBookingSubmit
// ─────────────────────────────────────────────

function useBookingSubmit(
  checkIn: string,
  checkOut: string,
  property: BookingProperty,
  getAuth: () => { isAuthenticated: boolean; userId: number | null },
  isGuest: () => boolean,
  getPaymentMethod: () => PaymentMethod
) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [bookingId, setBookingId] = React.useState<number | null>(null)
  const [payment, setPayment] = React.useState<PaymentResponse | null>(null)
  const [providerInfo, setProviderInfo] = React.useState<ProviderInfo | null>(null)
  const [paymentError, setPaymentError] = React.useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = React.useState<number | null>(null)
  const [paymentCurrency, setPaymentCurrency] = React.useState<string | null>(null)

  const confirmPayment = React.useCallback(async (paymentIntentId: string) => {
    if (!bookingId) return
    try {
      setPaymentError(null)
      const confirmed = await FinanceService.confirmPayment({
        bookingId,
        paymentIntentId,
        metadata: { bookingId },
      })
      setPayment(confirmed)
    } catch {
      setPaymentError("Falhou confirmar pagamento.")
    }
  }, [bookingId])

  const retryPayment = React.useCallback(async (paymentMethod: PaymentMethod) => {
    if (!bookingId || paymentAmount == null || !paymentCurrency) return
    try {
      setPaymentError(null)
      const [info, intent] = await Promise.all([
        FinanceService.getPaymentProviderInfo(),
        FinanceService.createPaymentIntent({ bookingId, paymentMethod }),
      ])
      setProviderInfo(info)
      setPayment(intent)
    } catch {
      setPaymentError("Não foi possível iniciar o pagamento.")
    }
  }, [bookingId, paymentAmount, paymentCurrency])

  const submit = React.useCallback(
    async (values: CheckoutFormValues): Promise<boolean> => {
      const from = parseDate(checkIn)
      const to = parseDate(checkOut)
      if (!from || !to) {
        notify.error("Datas inválidas.")
        return false
      }

      const nat = normalize.countryCode(values.nationality)
      const isPt = nat === "PT"
      const foreign = !isPt
      const identityRequired = isGuest() || foreign
      const documentType: DocumentType = foreign ? "PASSPORT" : "CC"

      setIsSubmitting(true)
      try {
        const auth = getAuth()
        const userId = !isGuest() && auth.isAuthenticated ? auth.userId : null
        const paymentMethod = getPaymentMethod()

        const created = await BookingService.createBooking({
          propertyId: Number(property.id),
          userId: userId ?? null,
          checkInDate: format(from, "yyyy-MM-dd"),
          checkOutDate: format(to, "yyyy-MM-dd"),
          guestCount: values.guestCount,
          guestDetails: identityRequired
            ? {
                fullName: values.fullName.trim(),
                email: values.email.trim(),
                phone: values.phone.trim(),
                nationality: nat,
                issuingCountry: foreign ? normalize.countryCode(values.issuingCountry) : "PT",
                documentType,
                documentNumber: foreign
                  ? normalize.documentNumber(values.passportNumber)
                  : normalize.nicRaw(values.documentNumber),
                documentIssueDate: foreign ? values.passportIssueDate.trim() : undefined,
              }
            : undefined,
        })

        setBookingId(created.id)
        setPaymentAmount(created.totalPrice)
        setPaymentCurrency(created.currency)

        try {
          const [info, intent] = await Promise.all([
            FinanceService.getPaymentProviderInfo(),
            FinanceService.createPaymentIntent({ bookingId: created.id, paymentMethod }),
          ])
          setProviderInfo(info)
          setPayment(intent)
          setPaymentError(null)
        } catch {
          setProviderInfo(null)
          setPayment(null)
          setPaymentError("Reserva criada, mas falhou iniciar pagamento.")
        }
        return true
      } catch {
        notify.error("Erro ao criar reserva. Tenta novamente.")
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [checkIn, checkOut, getAuth, getPaymentMethod, isGuest, property.id]
  )

  return {
    isSubmitting,
    bookingId,
    payment,
    providerInfo,
    paymentError,
    paymentAmount,
    paymentCurrency,
    confirmPayment,
    retryPayment,
    submit,
  }
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export function BookingCheckoutForm({
  property,
  checkIn,
  checkOut,
  onBack,
  onSuccess,
}: BookingCheckoutParams) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [authSession, setAuthSession] = React.useState(() => readAuthSession())
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("CREDIT_CARD")
  const [stayRange, setStayRange] = React.useState<DateRange | undefined>(() => {
    const from = parseDate(checkIn)
    const to = parseDate(checkOut)
    return from && to ? { from, to } : undefined
  })
  const [quote, setQuote] = React.useState<{ total: number; currency: string } | null>(null)
  const [quoteStatus, setQuoteStatus] = React.useState<{
    loading: boolean
    error: string | null
    validationErrors: string[]
  }>({ loading: false, error: null, validationErrors: [] })
  const quoteSeq = React.useRef(0)

  const checkoutAsGuest = !authSession.isAuthenticated

  const baseResolver = React.useMemo(() => zodResolver(checkoutBaseSchema), [])
  const checkoutAsGuestRef = React.useRef(checkoutAsGuest)
  React.useEffect(() => {
    checkoutAsGuestRef.current = checkoutAsGuest
  }, [checkoutAsGuest])

  const resolver: Resolver<CheckoutFormValues> = React.useCallback(async (values, context, options) => {
    const res = await baseResolver(values, context, options)
    const nat = normalize.countryCode(String(values?.nationality || "PT"))
    const isPt = nat === "PT"
    const foreign = !isPt
    const identityRequired = checkoutAsGuestRef.current || foreign

    if (identityRequired) {
      if (foreign) {
        if (normalize.countryCode(String(values?.issuingCountry || "")).length !== 2) {
          ;(res.errors as Record<string, unknown>)["issuingCountry"] = { type: "manual", message: "Código ISO (2 letras)." }
        }
        if (!normalize.documentNumber(String(values?.passportNumber || ""))) {
          ;(res.errors as Record<string, unknown>)["passportNumber"] = { type: "manual", message: "Obrigatório." }
        }
        if (!parseDate(String(values?.passportIssueDate || ""))) {
          ;(res.errors as Record<string, unknown>)["passportIssueDate"] = { type: "manual", message: "Data inválida." }
        }
      } else if (!normalize.nicIsValid(String(values?.documentNumber || ""))) {
        ;(res.errors as Record<string, unknown>)["documentNumber"] = { type: "manual", message: "Formato: 12345678 0 XX 1" }
      }
    }

    return res
  }, [baseResolver])

  // Progressive unlock + collapse state
  const [identityUnlocked, setIdentityUnlocked] = React.useState(false)
  const [reviewUnlocked, setReviewUnlocked] = React.useState(false)
  const [paymentUnlocked, setPaymentUnlocked] = React.useState(false)

  const [tripCollapsed, setTripCollapsed] = React.useState(false)
  const [identityCollapsed, setIdentityCollapsed] = React.useState(false)
  const [reviewCollapsed, setReviewCollapsed] = React.useState(false)

  const identityRef = React.useRef<HTMLDivElement>(null)
  const reviewRef = React.useRef<HTMLDivElement>(null)
  const paymentRef = React.useRef<HTMLDivElement>(null)

  const form = useForm<CheckoutFormValues>({
    resolver,
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      guestCount: 1,
      nationality: "PT",
      issuingCountry: "PT",
      documentNumber: "",
      passportNumber: "",
      passportIssueDate: "",
    },
  })

  const preview = useWatch({ control: form.control })
  const nationality = useWatch({ control: form.control, name: "nationality" })
  const guestCount = useWatch({ control: form.control, name: "guestCount" })
  const isForeign = normalize.countryCode(nationality || "PT") !== "PT"
  const identityRequired = checkoutAsGuest || isForeign

  const hasSelectedRange = Boolean(stayRange?.from && stayRange?.to)

  const effectiveCheckIn = React.useMemo(() => {
    if (hasSelectedRange && stayRange?.from) return format(stayRange.from, "yyyy-MM-dd")
    return checkIn
  }, [hasSelectedRange, stayRange, checkIn])

  const effectiveCheckOut = React.useMemo(() => {
    if (hasSelectedRange && stayRange?.to) return format(stayRange.to, "yyyy-MM-dd")
    return checkOut
  }, [hasSelectedRange, stayRange, checkOut])

  const { nights, estimateTotal } = React.useMemo(() => {
    const from = parseDate(effectiveCheckIn)
    const to = parseDate(effectiveCheckOut)
    const n = from && to ? Math.max(1, differenceInCalendarDays(to, from)) : 0
    return { nights: n, estimateTotal: n * property.price }
  }, [effectiveCheckIn, effectiveCheckOut, property.price])

  React.useEffect(() => {
    const from = parseDate(effectiveCheckIn)
    const to = parseDate(effectiveCheckOut)
    if (!from || !to || nights <= 0) {
      setQuote(null)
      setQuoteStatus({ loading: false, error: null, validationErrors: [] })
      return
    }

    const seq = (quoteSeq.current += 1)
    setQuoteStatus((s) => ({ ...s, loading: true, error: null }))

    const timer = window.setTimeout(async () => {
      try {
        const res = await propertiesAxios.post<ApiResponse<PropertyQuoteResponse>>(
          `/${Number(property.id)}/quote`,
          { checkInDate: effectiveCheckIn, checkOutDate: effectiveCheckOut, guestCount: Math.max(1, guestCount ?? 1) }
        )

        if (seq !== quoteSeq.current) return

        const data = res.data?.data
        if (data?.valid && data.totalPrice != null) {
          setQuote({ total: Number(data.totalPrice), currency: String(data.currency || "EUR") })
          setQuoteStatus({ loading: false, error: null, validationErrors: [] })
          return
        }

        setQuote(null)
        setQuoteStatus({
          loading: false,
          error: null,
          validationErrors: Array.isArray(data?.validationErrors) ? data.validationErrors : [],
        })
      } catch {
        if (seq !== quoteSeq.current) return
        setQuote(null)
        setQuoteStatus({ loading: false, error: "Não foi possível simular o preço agora.", validationErrors: [] })
      }
    }, 250)

    return () => {
      window.clearTimeout(timer)
    }
  }, [effectiveCheckIn, effectiveCheckOut, guestCount, nights, property.id])

  const pricingCurrency = quote?.currency ?? "EUR"
  const pricingTotal = quote?.total ?? estimateTotal
  const cleaningFee = nights > 0 ? CLEANING_FEE_EUR : 0
  const touristTax = nights > 0 ? calcTouristTax(nights, guestCount ?? 1) : 0
  const accommodation = Math.max(0, pricingTotal - cleaningFee - touristTax)

  const getAuth = React.useCallback(() => authSession, [authSession])
  const isGuest = React.useCallback(() => checkoutAsGuest, [checkoutAsGuest])
  const getPaymentMethod = React.useCallback(() => paymentMethod, [paymentMethod])

  const {
    isSubmitting,
    bookingId,
    payment,
    providerInfo,
    paymentError,
    paymentAmount,
    paymentCurrency,
    confirmPayment,
    retryPayment,
    submit,
  } =
    useBookingSubmit(effectiveCheckIn, effectiveCheckOut, property, getAuth, isGuest, getPaymentMethod)

  const stripeClientSecret = React.useMemo(() => {
    if (!payment || typeof payment !== "object") return null
    const s = (payment as Record<string, unknown>)["clientSecret"]
    return typeof s === "string" && s.length > 0 ? s : null
  }, [payment])

  const stripePublishableKey = React.useMemo(() => {
    const caps = providerInfo?.capabilities as Record<string, unknown> | undefined
    const fromCaps = caps && typeof caps["publishableKey"] === "string" ? (caps["publishableKey"] as string) : ""
    const fromEnv = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
    return (fromCaps || fromEnv).trim()
  }, [providerInfo])

  // Seed session on mount
  React.useEffect(() => {
    const s = readAuthSession()
    setAuthSession(s)
    if (s.isAuthenticated) {
      form.setValue("email", s.email, { shouldValidate: true })
      form.setValue("fullName", s.email.split("@")[0] ?? "", { shouldValidate: true })
    }
  }, [form])

  React.useEffect(() => {
    if (!authSession.isAuthenticated) return

    let cancelled = false

    void usersAxios
      .get<ApiResponse<MeResponse>>("/me")
      .then((res) => {
        if (cancelled) return
        const me = res.data?.data
        if (!me) return

        const current = form.getValues()

        if (!current.email && me.email) form.setValue("email", me.email, { shouldValidate: true })
        if (!current.phone && me.phone) form.setValue("phone", normalize.phone(me.phone), { shouldValidate: true })
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [authSession.isAuthenticated, form])

  // Reset doc fields on nationality change
  React.useEffect(() => {
    if (normalize.countryCode(nationality || "PT") === "PT") {
      form.setValue("issuingCountry", "PT", { shouldValidate: true })
      form.setValue("passportNumber", "")
      form.setValue("passportIssueDate", "")
    } else {
      form.setValue("documentNumber", "")
    }
  }, [nationality, form])

  React.useEffect(() => {
    if (!identityRequired) {
      setIdentityUnlocked(false)
      setIdentityCollapsed(false)
      return
    }

    if (tripCollapsed) {
      setIdentityUnlocked(true)
    }

    if (reviewUnlocked) {
      setReviewUnlocked(false)
      setPaymentUnlocked(false)
      setReviewCollapsed(false)
    }
  }, [identityRequired, reviewUnlocked, tripCollapsed])

  const scrollTo = (el: HTMLElement | null) => {
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    })
  }

  // Section confirmations
  const confirmTrip = async () => {
    const ok = await form.trigger(
      ["fullName", "email", "phone", "guestCount", "nationality"],
      { shouldFocus: true }
    )
    if (!ok) { notify.warning("Revê os campos assinalados."); return }
    setTripCollapsed(true)
    if (identityRequired) {
      setIdentityUnlocked(true)
      return
    }
    setReviewUnlocked(true)
  }

  const confirmIdentity = async () => {
    const fields = isForeign
      ? (["issuingCountry", "passportNumber", "passportIssueDate"] as const)
      : (["documentNumber"] as const)
    const ok = await form.trigger(fields, { shouldFocus: true })
    if (!ok) { notify.warning("Revê os campos assinalados."); return }
    setIdentityCollapsed(true)
    setReviewUnlocked(true)
  }

  const handleFinalSubmit = form.handleSubmit(async (values) => {
    const ok = await submit(values)
    if (ok) {
      setReviewCollapsed(true)
      setPaymentUnlocked(true)
    }
  })

  React.useEffect(() => {
    if (identityUnlocked) scrollTo(identityRef.current)
  }, [identityUnlocked])

  React.useEffect(() => {
    if (reviewUnlocked) scrollTo(reviewRef.current)
  }, [reviewUnlocked])

  React.useEffect(() => {
    if (paymentUnlocked) scrollTo(paymentRef.current)
  }, [paymentUnlocked])

  // Sidebar progress
  const tripCompleted = identityRequired ? identityUnlocked : reviewUnlocked
  const identityCompleted = identityRequired ? reviewUnlocked : false
  const progress = {
    trip: tripCompleted,
    identity: identityCompleted,
    review: paymentUnlocked,
    payment: Boolean(bookingId && payment),
  }

  const stepIndexTrip = "01"
  const stepIndexIdentity = identityRequired ? "02" : null
  const stepIndexReview = identityRequired ? "03" : "02"
  const stepIndexPayment = identityRequired ? "04" : "03"

  return (
    <FormProvider {...form}>
      <div className="mx-auto w-full max-w-5xl">

        {/* Back link */}
        <button
          type="button"
          onClick={onBack}
          className={cn(tk.mono, "mb-6 flex items-center gap-1.5 hover:text-foreground transition-colors")}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar
        </button>

        <div className="grid gap-8 md:grid-cols-[1fr_300px] items-start">

          {/* ── Scroll form column */}
          <div className="space-y-4">

            {/* Section 01 — Dados */}
            <Section
              index={stepIndexTrip}
              title="Os teus dados"
              description="Contacto e informação sobre a estadia"
              locked={false}
              completed={progress.trip}
              collapsible
              collapsed={tripCollapsed}
              onCollapsedChange={(collapsed) => {
                setTripCollapsed(collapsed)
                if (!collapsed) scrollTo(identityRequired ? identityRef.current : reviewRef.current)
              }}
            >
              <div className="pb-4 border-b border-foreground/10">
                <div className={tk.label}>
                  {authSession.isAuthenticated ? "Reservar com conta" : "Reservar como convidado"}
                </div>
                <div className={cn(tk.mono, "mt-0.5")}>
                  {authSession.isAuthenticated
                    ? `Associado à conta: ${authSession.email}`
                    : "Sem login — apenas dados do hóspede."}
                </div>
              </div>

              <div className={cn(tk.card, "p-4 space-y-4")}>
                <div>
                  <div className={tk.label}>Datas da estadia</div>
                  <div className={cn(tk.mono, "mt-0.5")}>
                    Ao ajustar o calendário, recalculamos o preço total e o breakdown em tempo real.
                  </div>
                </div>

                <BrutalCalendar
                  title="Selecionar datas"
                  initialFocus
                  mode="range"
                  defaultMonth={stayRange?.from}
                  selected={stayRange}
                  onSelect={setStayRange}
                  numberOfMonths={isDesktop ? 2 : 1}
                  className="w-full max-w-[320px] md:max-w-none"
                  disabled={(d) => d < TODAY}
                />

                <div className={cn(tk.divider, "pt-4 space-y-2")}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={cn(tk.mono, "uppercase tracking-widest")}>Breakdown</span>
                    <span className={cn(tk.mono, "tabular-nums")}>
                      {quoteStatus.loading ? "A calcular…" : quote ? "Simulado" : "Estimativa"}
                    </span>
                  </div>

                  {quoteStatus.validationErrors.length > 0 ? (
                    <NexusAlert
                      variant="warning"
                      title="Validação"
                      description={quoteStatus.validationErrors.join(" · ")}
                      className="shadow-none"
                    />
                  ) : null}

                  {quoteStatus.error ? (
                    <NexusAlert variant="error" title="Preço" description={quoteStatus.error} className="shadow-none" />
                  ) : null}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className={cn(tk.mono, "underline decoration-dotted underline-offset-2")}>
                        Estadia ({nights} noite{nights !== 1 ? "s" : ""})
                      </span>
                      <span className="font-black tabular-nums">{formatMoney(accommodation, pricingCurrency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={cn(tk.mono, "underline decoration-dotted underline-offset-2")}>
                        Taxa de limpeza
                      </span>
                      <span className="font-black tabular-nums">{formatMoney(cleaningFee, pricingCurrency)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={cn(tk.mono, "underline decoration-dotted underline-offset-2")}>
                        Taxa turística
                      </span>
                      <span className="font-black tabular-nums">{formatMoney(touristTax, pricingCurrency)}</span>
                    </div>
                    <div className={cn("flex items-center justify-between pt-3", tk.divider)}>
                      <span className={cn(tk.mono, "uppercase tracking-widest")}>Total</span>
                      <span className="text-xl font-black tabular-nums">{formatMoney(pricingTotal, pricingCurrency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <RHFField
                name="fullName"
                label="Nome completo"
                required
                transform={normalize.fullName}
                inputProps={{ maxLength: 120, autoComplete: "name", placeholder: "Maria Silva" }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RHFField
                  name="email"
                  label="Email"
                  required
                  transform={(v) => v.trim()}
                  inputProps={{
                    type: "email",
                    maxLength: 120,
                    autoComplete: "email",
                    placeholder: "email@exemplo.com",
                    readOnly: authSession.isAuthenticated && !checkoutAsGuest,
                  }}
                />
                <RHFField
                  name="phone"
                  label="Telefone"
                  required
                  transform={normalize.phone}
                  inputProps={{ type: "tel", inputMode: "tel", autoComplete: "tel", maxLength: 20, placeholder: "912 345 678" }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RHFField
                  name="nationality"
                  label="Nacionalidade"
                  required
                  type="select"
                  options={NATIONALITY_OPTIONS}
                />
                <RHFField
                  name="guestCount"
                  label="Nº de hóspedes"
                  required
                  type="number"
                  min={1}
                  max={20}
                />
              </div>

              <SectionCTA onClick={confirmTrip}>
                Confirmar dados
              </SectionCTA>
            </Section>

            {/* Section 02 — Identificação */}
            {identityRequired ? (
              <div ref={identityRef}>
                <Section
                  index={stepIndexIdentity ?? "02"}
                  title="Identificação"
                  description="Documento obrigatório por lei (SEF/IRN)"
                  locked={!identityUnlocked}
                  completed={progress.identity}
                  collapsible
                  collapsed={identityCollapsed}
                  onCollapsedChange={(collapsed) => {
                    setIdentityCollapsed(collapsed)
                    if (!collapsed) scrollTo(identityRef.current)
                  }}
                >
                  {isForeign ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <RHFField
                          name="issuingCountry"
                          label="País emitente (ISO2)"
                          required
                          transform={normalize.countryCode}
                          inputProps={{ maxLength: 2, autoComplete: "off", placeholder: "ES" }}
                        />
                        <RHFField
                          name="passportNumber"
                          label="Nº Passaporte"
                          required
                          transform={normalize.documentNumber}
                          inputProps={{ maxLength: 20, autoComplete: "off", placeholder: "AB123456" }}
                        />
                      </div>
                      <RHFField
                        name="passportIssueDate"
                        label="Data de emissão"
                        required
                        transform={(v) => v}
                        inputProps={{ type: "date", autoComplete: "off" }}
                      />
                    </>
                  ) : (
                    <RHFField
                      name="documentNumber"
                      label="NIC (Cartão de Cidadão)"
                      required
                      transform={normalize.nic}
                      inputProps={{ maxLength: 15, autoComplete: "off", placeholder: "12345678 0 XX 1" }}
                    />
                  )}

                  <SectionCTA onClick={confirmIdentity}>
                    Confirmar identificação
                  </SectionCTA>
                </Section>
              </div>
            ) : null}

            {/* Section 03 — Revisão */}
            <div ref={reviewRef}>
              <Section
                index={stepIndexReview}
                title="Revisão"
                description="Confirma os dados antes de pagar"
                locked={!reviewUnlocked}
                completed={progress.review}
                collapsible
                collapsed={reviewCollapsed}
                onCollapsedChange={(collapsed) => {
                  setReviewCollapsed(collapsed)
                  if (!collapsed) scrollTo(reviewRef.current)
                }}
              >
                <div className="divide-y divide-foreground/10">
                  <ReviewRow label="Nome" value={preview.fullName || "—"} />
                  <ReviewRow label="Email" value={preview.email || "—"} />
                  <ReviewRow label="Telefone" value={preview.phone || "—"} />
                  <ReviewRow label="Nacionalidade" value={nationalityLabel(preview.nationality ?? "PT")} />
                  <ReviewRow label="Hóspedes" value={String(preview.guestCount || 1)} />
                  <ReviewRow
                    label="Documento"
                    value={
                      !identityRequired
                        ? "Dispensado (Conta PT)"
                        : isForeign
                          ? `Passaporte · ${preview.passportNumber || "—"} · ${preview.issuingCountry || "—"}`
                          : `NIC · ${preview.documentNumber ? normalize.nic(preview.documentNumber) : "—"}`
                    }
                  />
                </div>

                <div className={cn("pt-4", tk.divider, "flex items-end justify-between gap-4")}>
                  <div>
                    <div className={tk.label}>Total a pagar</div>
                    <div className={cn(tk.mono, "mt-0.5")}>
                      {formatMoney(accommodation, pricingCurrency)} + {formatMoney(cleaningFee, pricingCurrency)} + {formatMoney(touristTax, pricingCurrency)}
                    </div>
                  </div>
                  <div className="text-2xl font-black tabular-nums">{formatMoney(pricingTotal, pricingCurrency)}</div>
                </div>

                <SectionCTA
                  onClick={() => void handleFinalSubmit()}
                  disabled={isSubmitting}
                  icon={
                    isSubmitting
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Lock className="h-4 w-4" />
                  }
                >
                  {isSubmitting ? "A processar…" : "Iniciar pagamento"}
                </SectionCTA>
              </Section>
            </div>

            {/* Section 04 — Pagamento */}
            <div ref={paymentRef}>
              <Section
                index={stepIndexPayment}
                title="Pagamento"
                description="Reserva criada e intent iniciado"
                locked={!paymentUnlocked}
                completed={progress.payment}
              >
                {bookingId && providerInfo?.supportedPaymentMethods?.length ? (
                  <div className="space-y-2">
                    <div className={tk.label}>Método de pagamento</div>
                    <select
                      value={paymentMethod}
                      onChange={(e) => {
                        const next = e.target.value as PaymentMethod
                        setPaymentMethod(next)
                        void retryPayment(next)
                      }}
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
                  labelClassName={tk.label}
                  error={paymentError}
                  onRetry={() => retryPayment(paymentMethod)}
                />

                {bookingId && providerInfo?.name === "Stripe" && stripeClientSecret && stripePublishableKey ? (
                  <StripePaymentPanel
                    publishableKey={stripePublishableKey}
                    clientSecret={stripeClientSecret}
                    bookingId={bookingId}
                    total={paymentAmount ?? pricingTotal}
                    currency={paymentCurrency ?? pricingCurrency}
                    onConfirmed={confirmPayment}
                  />
                ) : null}

                <SectionCTA onClick={onSuccess} disabled={!bookingId}>
                  Concluir reserva
                </SectionCTA>
              </Section>
            </div>
          </div>

          {/* ── Sticky sidebar */}
          <aside className="md:sticky md:top-6 space-y-4">

            {/* Property + price */}
            <div className={cn(tk.cardLg, "p-5")}>
              <div className={cn(tk.mono, "uppercase tracking-widest mb-3")}>Resumo</div>
              <div className="font-black uppercase leading-snug text-sm">{property.title}</div>

              <div className={cn("mt-3 pt-3 space-y-2", tk.divider)}>
                <SidebarRow label="Check-in" value={effectiveCheckIn} />
                <SidebarRow label="Check-out" value={effectiveCheckOut} />
                <SidebarRow label="Noites" value={String(nights)} />
                <SidebarRow label="Por noite" value={`€${property.price}`} />
              </div>

              <div className={cn("mt-3 pt-3 flex items-baseline justify-between", tk.divider)}>
                <span className={tk.mono}>Total</span>
                <span className="text-2xl font-black tabular-nums">{formatMoney(pricingTotal, pricingCurrency)}</span>
              </div>
            </div>

            {/* Guest snapshot */}
            <div className={cn(tk.card, "p-4 space-y-3")}>
              <div className={cn(tk.mono, "uppercase tracking-widest")}>Hóspede</div>

              {preview.fullName ? (
                <div className="space-y-1">
                  <div className="text-sm font-black">{preview.fullName}</div>
                  {preview.email && <div className={tk.mono}>{preview.email}</div>}
                  {preview.phone && <div className={tk.mono}>{preview.phone}</div>}
                </div>
              ) : (
                <div className={cn(tk.mono, "italic")}>Ainda sem dados</div>
              )}

              {(preview.nationality || preview.guestCount) ? (
                <div className={cn("pt-3 space-y-1.5", tk.divider)}>
                  {preview.nationality && (
                    <SidebarRow label="Nac." value={nationalityLabel(preview.nationality)} />
                  )}
                  {preview.guestCount ? (
                    <SidebarRow label="Hóspedes" value={String(preview.guestCount)} />
                  ) : null}
                  <SidebarRow label="Tipo" value={checkoutAsGuest ? "Convidado" : "Conta"} />
                </div>
              ) : null}
            </div>

            {/* Progress tracker */}
            <div className={cn(tk.card, "p-4")}>
              <div className={cn(tk.mono, "uppercase tracking-widest mb-3")}>Progresso</div>
              <div className="space-y-1.5">
                {(
                  [
                    { key: "trip", label: "Dados", done: progress.trip, active: identityRequired ? !identityUnlocked : !reviewUnlocked, locked: false },
                    ...(identityRequired
                      ? [{ key: "identity" as const, label: "Identificação", done: progress.identity, active: identityUnlocked && !reviewUnlocked, locked: !identityUnlocked }]
                      : []),
                    { key: "review", label: "Revisão", done: progress.review, active: reviewUnlocked && !paymentUnlocked, locked: !reviewUnlocked },
                    { key: "payment", label: "Pagamento", done: progress.payment, active: paymentUnlocked, locked: !paymentUnlocked },
                  ] as const
                ).map(({ key, label, done, active, locked }, i) => (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                      active && "bg-primary/10 border border-primary/30",
                      !active && "border border-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-colors",
                        done && "border-foreground bg-foreground text-background",
                        active && !done && "border-primary text-primary",
                        locked && !done && "border-foreground/20 text-foreground/20"
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : String(i + 1).padStart(2, "0")}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-black uppercase flex-1",
                        locked && !done && "text-muted-foreground/30"
                      )}
                    >
                      {label}
                    </span>
                    {active && <ChevronRight className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </FormProvider>
  )
}

// ─────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────

function Section({
  index,
  title,
  description,
  locked,
  completed,
  collapsible = false,
  collapsed = false,
  onCollapsedChange,
  children,
}: {
  index: string
  title: string
  description: string
  locked: boolean
  completed: boolean
  collapsible?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  children: React.ReactNode
}) {
  const canCollapse = Boolean(collapsible && completed && !locked)
  const showBody = !locked && !collapsed
  return (
    <motion.div
      animate={{ opacity: locked ? 0.38 : 1 }}
      transition={{ duration: 0.18 }}
      className={cn(
        tk.card,
        "p-5 md:p-6",
        locked && "select-none"
      )}
    >
      {/* Header row */}
      <button
        type="button"
        disabled={!canCollapse}
        onClick={() => onCollapsedChange?.(!collapsed)}
        className={cn("flex w-full items-start gap-4 mb-5 text-left", canCollapse && "cursor-pointer")}
        aria-expanded={showBody}
      >
        <div
          className={cn(
            "h-8 w-8 shrink-0 rounded-full border-2 flex items-center justify-center text-[11px] font-black transition-colors",
            completed && "border-foreground bg-foreground text-background",
            !completed && !locked && "border-foreground text-foreground",
            locked && "border-foreground/25 text-foreground/25"
          )}
        >
          {completed ? <Check className="h-3.5 w-3.5" /> : index}
        </div>
        <div className="flex-1 pt-0.5">
          <div className={cn("font-black uppercase leading-none", locked && "text-foreground/30")}>
            {title}
          </div>
          <div className={cn(tk.mono, "mt-1")}>{description}</div>
        </div>
        {locked ? (
          <Lock className="h-4 w-4 mt-0.5 text-muted-foreground/30 shrink-0" />
        ) : canCollapse ? (
          <ChevronDown className={cn("h-4 w-4 mt-0.5 shrink-0 transition-transform", collapsed && "rotate-[-90deg]")} />
        ) : null}
      </button>

      {showBody ? <div className="space-y-4">{children}</div> : null}
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// SectionCTA
// ─────────────────────────────────────────────

function SectionCTA({
  onClick,
  disabled = false,
  icon,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className={cn("pt-4 border-t border-foreground/10")}>
      <Button
        variant="brutal"
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="w-full sm:w-auto"
      >
        {icon && <span className="mr-2 flex items-center">{icon}</span>}
        {children}
        {!icon && <ChevronRight className="ml-1.5 h-4 w-4" />}
      </Button>
    </div>
  )
}

// ─────────────────────────────────────────────
// Generic RHFField (text | number | select)
// ─────────────────────────────────────────────

type RHFBase = { name: keyof CheckoutFormValues; label: string; required?: boolean }
type RHFText = RHFBase & {
  type?: "text"
  transform: (v: string) => string
  inputProps?: Omit<React.ComponentProps<typeof Input>, "id" | "value" | "onChange">
  options?: never; min?: never; max?: never
}
type RHFNumber = RHFBase & {
  type: "number"; min: number; max: number
  transform?: never; inputProps?: never; options?: never
}
type RHFSelect = RHFBase & {
  type: "select"
  options: ReadonlyArray<{ value: string; label: string }>
  transform?: never; min?: never; max?: never; inputProps?: never
}
type RHFFieldProps = RHFText | RHFNumber | RHFSelect

function RHFField({ name, label, required, type = "text", ...rest }: RHFFieldProps) {
  const { control, formState } = useFormContext<CheckoutFormValues>()
  const error = formState.errors[name]?.message as string | undefined
  const id = `field-${name}`

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className={tk.label}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          if (type === "select") {
            const { options } = rest as RHFSelect
            return (
              <select
                id={id}
                value={String(field.value ?? "")}
                onChange={(e) => field.onChange(e.target.value)}
                aria-invalid={Boolean(error)}
                className="h-11 w-full rounded-md border-2 border-foreground bg-background px-3 text-sm font-mono shadow-[3px_3px_0_0_rgb(0,0,0)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              >
                {options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )
          }

          if (type === "number") {
            const { min, max } = rest as RHFNumber
            return (
              <Input
                id={id}
                variant="brutal"
                inputMode="numeric"
                pattern="[0-9]*"
                value={String(field.value ?? min)}
                aria-invalid={Boolean(error)}
                onChange={(e) => field.onChange(normalize.clampInt(e.target.value, min, max))}
              />
            )
          }

          const { transform, inputProps } = rest as RHFText
          return (
            <Input
              id={id}
              variant="brutal"
              value={String(field.value ?? "")}
              aria-invalid={Boolean(error)}
              {...inputProps}
              onChange={(e) => field.onChange(transform(e.target.value))}
            />
          )
        }}
      />

      {error && (
        <div className="text-[11px] font-mono text-destructive">{error}</div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Presentational helpers
// ─────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2.5 first:pt-0 last:pb-0">
      <span className={cn(tk.mono, "shrink-0 uppercase")}>{label}</span>
      <span className="text-sm font-black text-right break-all">{value}</span>
    </div>
  )
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className={tk.mono}>{label}</span>
      <span className="text-xs font-black tabular-nums">{value}</span>
    </div>
  )
}

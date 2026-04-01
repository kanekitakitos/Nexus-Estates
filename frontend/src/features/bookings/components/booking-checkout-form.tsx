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
} from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Check, ChevronRight, Lock, Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/forms/button"
import { Input } from "@/components/ui/forms/input"
import { Switch } from "@/components/ui/forms/switch"
import type { BookingProperty } from "@/features/bookings/components/booking-card"
import { BookingService } from "@/services/booking.service"
import { FinanceService } from "@/services/finance.service"
import type { PaymentResponse, ProviderInfo } from "@/types/finance"
import { cn } from "@/lib/utils"
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

function nationalityLabel(code: string) {
  return (
    NATIONALITY_OPTIONS.find((o) => o.value === normalize.countryCode(code || "PT"))?.label ?? code
  )
}

function readAuthSession() {
  if (typeof window === "undefined")
    return { isAuthenticated: false, userId: null as number | null, email: "" }
  const token = localStorage.getItem("token") ?? ""
  const email = localStorage.getItem("userEmail") ?? ""
  const rawId = localStorage.getItem("userId")
  const userId = rawId && /^\d+$/.test(rawId) ? Number(rawId) : null
  const ok = Boolean(token && email && isJwtValid(token))
  return { isAuthenticated: ok, userId: ok ? userId : null, email: ok ? email : "" }
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

const checkoutSchema = z
  .object({
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
  .superRefine((data, ctx) => {
    const nat = normalize.countryCode(data.nationality)
    if (nat !== "PT") {
      if (normalize.countryCode(data.issuingCountry).length !== 2)
        ctx.addIssue({ code: "custom", path: ["issuingCountry"], message: "Código ISO (2 letras)." })
      if (!normalize.documentNumber(data.passportNumber))
        ctx.addIssue({ code: "custom", path: ["passportNumber"], message: "Obrigatório." })
      if (!parseDate(data.passportIssueDate))
        ctx.addIssue({ code: "custom", path: ["passportIssueDate"], message: "Data inválida." })
    } else {
      if (!normalize.documentNumber(data.documentNumber))
        ctx.addIssue({ code: "custom", path: ["documentNumber"], message: "Obrigatório." })
    }
  })

// ─────────────────────────────────────────────
// useBookingSubmit
// ─────────────────────────────────────────────

function useBookingSubmit(
  checkIn: string,
  checkOut: string,
  property: BookingProperty,
  getAuth: () => { isAuthenticated: boolean; userId: number | null },
  isGuest: () => boolean
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

  const retryPayment = React.useCallback(async () => {
    if (!bookingId || paymentAmount == null || !paymentCurrency) return
    try {
      setPaymentError(null)
      const [info, intent] = await Promise.all([
        FinanceService.getPaymentProviderInfo(),
        FinanceService.createPaymentIntent({
          bookingId,
          amount: paymentAmount,
          currency: paymentCurrency,
          paymentMethod: "CREDIT_CARD",
          metadata: { bookingId },
        }),
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
        toast.error("Datas inválidas.")
        return false
      }

      const nat = normalize.countryCode(values.nationality)
      const foreign = nat !== "PT"
      const documentType: DocumentType = foreign ? "PASSPORT" : "CC"

      setIsSubmitting(true)
      try {
        const auth = getAuth()
        const userId = !isGuest() && auth.isAuthenticated ? auth.userId : null

        const created = await BookingService.createBooking({
          propertyId: Number(property.id),
          userId: userId ?? null,
          checkInDate: format(from, "yyyy-MM-dd"),
          checkOutDate: format(to, "yyyy-MM-dd"),
          guestCount: values.guestCount,
          guestDetails: {
            fullName: values.fullName.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
            nationality: nat,
            issuingCountry: foreign ? normalize.countryCode(values.issuingCountry) : "PT",
            documentType,
            documentNumber: foreign
              ? normalize.documentNumber(values.passportNumber)
              : normalize.documentNumber(values.documentNumber),
            documentIssueDate: foreign ? values.passportIssueDate.trim() : undefined,
          },
        })

        setBookingId(created.id)
        setPaymentAmount(created.totalPrice)
        setPaymentCurrency(created.currency)

        try {
          const [info, intent] = await Promise.all([
            FinanceService.getPaymentProviderInfo(),
            FinanceService.createPaymentIntent({ bookingId: created.id, paymentMethod: "CREDIT_CARD" }),
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
        toast.error("Erro ao criar reserva. Tenta novamente.")
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [checkIn, checkOut, getAuth, isGuest, property.id]
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
  const [authSession, setAuthSession] = React.useState({
    isAuthenticated: false,
    userId: null as number | null,
    email: "",
  })
  const [checkoutAsGuest, setCheckoutAsGuest] = React.useState(true)

  // Progressive unlock state
  const [identityOpen, setIdentityOpen] = React.useState(false)
  const [reviewOpen, setReviewOpen] = React.useState(false)
  const [paymentOpen, setPaymentOpen] = React.useState(false)

  const identityRef = React.useRef<HTMLDivElement>(null)
  const reviewRef = React.useRef<HTMLDivElement>(null)
  const paymentRef = React.useRef<HTMLDivElement>(null)

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
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
  const isForeign = normalize.countryCode(nationality || "PT") !== "PT"

  const { nights, total } = React.useMemo(() => {
    const from = parseDate(checkIn)
    const to = parseDate(checkOut)
    const n = from && to ? Math.max(1, differenceInCalendarDays(to, from)) : 0
    return { nights: n, total: n * property.price }
  }, [checkIn, checkOut, property.price])

  const getAuth = React.useCallback(() => authSession, [authSession])
  const isGuest = React.useCallback(() => checkoutAsGuest, [checkoutAsGuest])

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
    useBookingSubmit(checkIn, checkOut, property, getAuth, isGuest)

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
      setCheckoutAsGuest(false)
      form.setValue("email", s.email, { shouldValidate: true })
      form.setValue("fullName", s.email.split("@")[0] ?? "", { shouldValidate: true })
    }
  }, [form])

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
    if (!ok) { toast.warning("Revê os campos assinalados."); return }
    setIdentityOpen(true)
  }

  const confirmIdentity = async () => {
    const fields = isForeign
      ? (["issuingCountry", "passportNumber", "passportIssueDate"] as const)
      : (["documentNumber"] as const)
    const ok = await form.trigger(fields, { shouldFocus: true })
    if (!ok) { toast.warning("Revê os campos assinalados."); return }
    setReviewOpen(true)
  }

  const handleFinalSubmit = form.handleSubmit(async (values) => {
    const ok = await submit(values)
    if (ok) {
      setPaymentOpen(true)
    }
  })

  React.useEffect(() => {
    if (identityOpen) scrollTo(identityRef.current)
  }, [identityOpen])

  React.useEffect(() => {
    if (reviewOpen) scrollTo(reviewRef.current)
  }, [reviewOpen])

  React.useEffect(() => {
    if (paymentOpen) scrollTo(paymentRef.current)
  }, [paymentOpen])

  // Sidebar progress
  const progress = {
    trip: identityOpen,
    identity: reviewOpen,
    review: paymentOpen,
    payment: Boolean(bookingId && payment),
  }

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
              index="01"
              title="Os teus dados"
              description="Contacto e informação sobre a estadia"
              locked={false}
              completed={progress.trip}
            >
              {/* Guest toggle */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-foreground/10">
                <div>
                  <div className={tk.label}>Reservar sem conta</div>
                  <div className={cn(tk.mono, "mt-0.5")}>
                    Sem criação de utilizador — apenas dados do hóspede.
                  </div>
                </div>
                <Switch
                  checked={checkoutAsGuest}
                  disabled={!authSession.isAuthenticated}
                  onCheckedChange={(next) => {
                    if (!authSession.isAuthenticated && !next) {
                      toast.info("Inicia sessão para reservar com conta.")
                      return
                    }
                    setCheckoutAsGuest(next)
                  }}
                />
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
                  inputProps={{ type: "email", maxLength: 120, autoComplete: "email", placeholder: "email@exemplo.com" }}
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
            <div ref={identityRef}>
              <Section
                index="02"
                title="Identificação"
                description="Documento obrigatório por lei (SEF/IRN)"
                locked={!identityOpen}
                completed={progress.identity}
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
                    label="Nº Cartão de Cidadão"
                    required
                    transform={normalize.documentNumber}
                    inputProps={{ maxLength: 20, autoComplete: "off", placeholder: "12345678 0 ZZ4" }}
                  />
                )}

                <SectionCTA onClick={confirmIdentity}>
                  Confirmar identificação
                </SectionCTA>
              </Section>
            </div>

            {/* Section 03 — Revisão */}
            <div ref={reviewRef}>
              <Section
                index="03"
                title="Revisão"
                description="Confirma os dados antes de pagar"
                locked={!reviewOpen}
                completed={progress.review}
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
                      isForeign
                        ? `Passaporte · ${preview.passportNumber || "—"} · ${preview.issuingCountry || "—"}`
                        : `CC · ${preview.documentNumber || "—"}`
                    }
                  />
                </div>

                <div className={cn("pt-4", tk.divider, "flex items-end justify-between gap-4")}>
                  <div>
                    <div className={tk.label}>Total a pagar</div>
                    <div className={cn(tk.mono, "mt-0.5")}>
                      {nights} noite{nights !== 1 ? "s" : ""} × €{property.price}
                    </div>
                  </div>
                  <div className="text-2xl font-black tabular-nums">€{total}</div>
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
                index="04"
                title="Pagamento"
                description="Reserva criada e intent iniciado"
                locked={!paymentOpen}
                completed={progress.payment}
              >
                <PaymentDetails
                  bookingId={bookingId}
                  payment={payment}
                  providerInfo={providerInfo}
                  labelClassName={tk.label}
                  error={paymentError}
                  onRetry={retryPayment}
                />

                {bookingId && providerInfo?.name === "Stripe" && stripeClientSecret && stripePublishableKey ? (
                  <StripePaymentPanel
                    publishableKey={stripePublishableKey}
                    clientSecret={stripeClientSecret}
                    bookingId={bookingId}
                    total={paymentAmount ?? total}
                    currency={paymentCurrency ?? "EUR"}
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
                <SidebarRow label="Check-in" value={checkIn} />
                <SidebarRow label="Check-out" value={checkOut} />
                <SidebarRow label="Noites" value={String(nights)} />
                <SidebarRow label="Por noite" value={`€${property.price}`} />
              </div>

              <div className={cn("mt-3 pt-3 flex items-baseline justify-between", tk.divider)}>
                <span className={tk.mono}>Total</span>
                <span className="text-2xl font-black tabular-nums">€{total}</span>
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
                    { key: "trip", label: "Dados", done: progress.trip, active: !identityOpen, locked: false },
                    { key: "identity", label: "Identificação", done: progress.identity, active: identityOpen && !reviewOpen, locked: !identityOpen },
                    { key: "review", label: "Revisão", done: progress.review, active: reviewOpen && !paymentOpen, locked: !reviewOpen },
                    { key: "payment", label: "Pagamento", done: progress.payment, active: paymentOpen, locked: !paymentOpen },
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
  children,
}: {
  index: string
  title: string
  description: string
  locked: boolean
  completed: boolean
  children: React.ReactNode
}) {
  return (
    <motion.div
      animate={{ opacity: locked ? 0.38 : 1 }}
      transition={{ duration: 0.18 }}
      className={cn(
        tk.card,
        "p-5 md:p-6",
        locked && "pointer-events-none select-none"
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-4 mb-5">
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
        {locked && <Lock className="h-4 w-4 mt-0.5 text-muted-foreground/30 shrink-0" />}
      </div>

      {!locked && <div className="space-y-4">{children}</div>}
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

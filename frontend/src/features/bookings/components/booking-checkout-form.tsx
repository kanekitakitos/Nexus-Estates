"use client"

import React from "react"
import { differenceInCalendarDays, format, parseISO } from "date-fns"
import { toast } from "sonner"

import { Button } from "@/components/ui/forms/button"
import { Input } from "@/components/ui/forms/input"
import { BrutalShard } from "@/components/ui/data-display/card"
import type { BookingProperty } from "@/features/bookings/components/booking-card"
import { BookingService, type PaymentResponse as BookingPaymentResponse } from "@/services/booking.service"

export type BookingCheckoutParams = {
  property: BookingProperty
  checkIn: string
  checkOut: string
  onBack: () => void
  onSuccess: () => void
}

type DocumentType = "CC" | "PASSPORT"

type GuestDetails = {
  fullName: string
  email: string
  phone: string
  nationality: "PT" | "OTHER"
  issuingCountry: string
  documentType: DocumentType
  documentNumber: string
  guestCount: number
}

type CheckoutStep = "trip" | "identity" | "review" | "payment"

/**
 * Formulário de checkout (estilo Google Forms) para confirmar dados antes de criar a reserva.
 * - Auto-preenche email quando o utilizador está autenticado.
 * - Exige passaporte apenas quando nacionalidade != PT.
 * - Permite checkout anónimo (cria conta automaticamente para obter userId).
 */
export function BookingCheckoutForm({ property, checkIn, checkOut, onBack, onSuccess }: BookingCheckoutParams) {
  const [step, setStep] = React.useState<CheckoutStep>("trip")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [createdBookingId, setCreatedBookingId] = React.useState<number | null>(null)
  const [payment, setPayment] = React.useState<BookingPaymentResponse | null>(null)
  const [providerInfo, setProviderInfo] = React.useState<Record<string, unknown> | null>(null)
  const [checkoutAsGuest, setCheckoutAsGuest] = React.useState(false)

  const [details, setDetails] = React.useState<GuestDetails>({
    fullName: "",
    email: "",
    phone: "",
    nationality: "PT",
    issuingCountry: "PT",
    documentType: "CC",
    documentNumber: "",
    guestCount: 1,
  })

  const isForeign = details.nationality !== "PT"

  const { nights, total } = React.useMemo(() => {
    const from = safeParseDate(checkIn)
    const to = safeParseDate(checkOut)
    const computedNights =
      from && to ? Math.max(1, differenceInCalendarDays(to, from)) : 0
    return { nights: computedNights, total: computedNights * property.price }
  }, [checkIn, checkOut, property.price])

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const token = localStorage.getItem("token")
    const storedEmail = localStorage.getItem("userEmail") || ""

    if (token && storedEmail) {
      setDetails((prev) => {
        if (prev.email) return prev
        return {
          ...prev,
          email: storedEmail,
          fullName: prev.fullName || storedEmail.split("@")[0] || "",
        }
      })
      setCheckoutAsGuest(false)
    } else {
      setCheckoutAsGuest(true)
    }
  }, [])

  React.useEffect(() => {
    setDetails((prev) => {
      if (prev.nationality !== "PT") {
        return {
          ...prev,
          documentType: "PASSPORT",
          issuingCountry: prev.issuingCountry || "PT",
        }
      }
      return {
        ...prev,
        documentType: "CC",
        issuingCountry: "PT",
      }
    })
  }, [details.nationality])

  const goNext = () => {
    if (step === "trip") setStep("identity")
    if (step === "identity") setStep("review")
  }

  const goBack = () => {
    if (step === "payment") setStep("review")
    if (step === "review") setStep("identity")
    if (step === "identity") setStep("trip")
    if (step === "trip") onBack()
  }

  const canProceed = React.useMemo(() => {
    const errors = validateStep(step, details)
    return errors.length === 0
  }, [details, step])

  const submit = async () => {
    if (typeof window === "undefined") return
    if (isSubmitting) return

    const allErrors = validateAll(details)
    if (allErrors.length > 0) {
      toast.warning("Preenche os dados obrigatórios para concluir a reserva.")
      setStep("trip")
      return
    }

    const from = safeParseDate(checkIn)
    const to = safeParseDate(checkOut)
    if (!from || !to) {
      toast.error("Datas inválidas. Volta atrás e seleciona novamente.")
      return
    }

    setIsSubmitting(true)
    try {
      const userId = !checkoutAsGuest ? localStorage.getItem("userId") : null

      const created = await BookingService.createBooking({
        propertyId: Number(property.id),
        userId: userId ? Number(userId) : null,
        checkInDate: format(from, "yyyy-MM-dd"),
        checkOutDate: format(to, "yyyy-MM-dd"),
        guestCount: details.guestCount,
        guestDetails: {
          fullName: details.fullName.trim(),
          email: details.email.trim(),
          phone: details.phone.trim(),
          nationality: details.nationality,
          issuingCountry: isForeign ? details.issuingCountry.trim() : "PT",
          documentType: details.documentType,
          documentNumber: details.documentNumber.trim(),
        },
      })

      setCreatedBookingId(created.id)

      const info = await BookingService.getPaymentProviderInfo()
      setProviderInfo(info)

      const paymentIntent = await BookingService.createPaymentIntent(created.id, "CREDIT_CARD")
      setPayment(paymentIntent)
      setStep("payment")
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BrutalShard rotate="primary">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            Checkout
          </div>
          <div className="text-2xl font-black uppercase">{property.title}</div>
          <div className="text-sm text-muted-foreground">
            {checkIn} → {checkOut} · {nights} noites · Total estimado €{total}
          </div>
        </div>
      </BrutalShard>

      <div className="flex gap-2 text-xs">
        <StepPill active={step === "trip"}>Dados</StepPill>
        <StepPill active={step === "identity"}>Identificação</StepPill>
        <StepPill active={step === "review"}>Revisão</StepPill>
        <StepPill active={step === "payment"}>Pagamento</StepPill>
      </div>

      {step === "trip" ? (
        <SectionCard
          title="Confirma os teus dados"
          description="Preenche o mínimo necessário para concluir rapidamente."
        >
          <div className="rounded-lg border p-3 text-sm flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">Reservar sem conta</div>
              <div className="text-xs text-muted-foreground">
                Se estiver ligado, não criamos utilizador. Só usamos dados do hóspede.
              </div>
            </div>
            <input
              type="checkbox"
              checked={checkoutAsGuest}
              onChange={(e) => setCheckoutAsGuest(e.target.checked)}
              className="h-4 w-4"
            />
          </div>

          <Field id="checkout-full-name" label="Nome completo" required>
            <Input
              id="checkout-full-name"
              variant="brutal"
              value={details.fullName}
              maxLength={120}
              autoComplete="name"
              onChange={(e) =>
                setDetails((p) => ({ ...p, fullName: e.target.value }))
              }
            />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field id="checkout-email" label="Email" required>
              <Input
                id="checkout-email"
                variant="brutal"
                type="email"
                value={details.email}
                maxLength={120}
                autoComplete="email"
                onChange={(e) =>
                  setDetails((p) => ({ ...p, email: e.target.value }))
                }
              />
            </Field>

            <Field id="checkout-phone" label="Telefone" required>
              <Input
                id="checkout-phone"
                variant="brutal"
                type="tel"
                value={details.phone}
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                onChange={(e) =>
                  setDetails((p) => ({
                    ...p,
                    phone: e.target.value.replace(/[^\d+]/g, "").slice(0, 20),
                  }))
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field id="checkout-nationality" label="Nacionalidade" required>
              <select
                id="checkout-nationality"
                value={details.nationality}
                onChange={(e) =>
                  setDetails((p) => ({
                    ...p,
                    nationality: e.target.value as GuestDetails["nationality"],
                  }))
                }
                className="h-10 rounded-md border bg-background px-3 text-sm"
              >
                <option value="PT">Portugal</option>
                <option value="OTHER">Estrangeiro</option>
              </select>
            </Field>

            <Field id="checkout-guest-count" label="Número de hóspedes" required>
              <Input
                id="checkout-guest-count"
                variant="brutal"
                type="number"
                min={1}
                max={20}
                inputMode="numeric"
                value={details.guestCount}
                onChange={(e) =>
                  setDetails((p) => ({
                    ...p,
                    guestCount: Math.min(20, Math.max(1, Number(e.target.value))),
                  }))
                }
              />
            </Field>
          </div>
        </SectionCard>
      ) : null}

      {step === "identity" ? (
        <SectionCard
          title="Identificação (SEF)"
          description="Passaporte é obrigatório apenas para estrangeiros."
        >
          {isForeign ? (
            <Field id="checkout-issuing-country" label="País emissor do passaporte" required>
              <Input
                id="checkout-issuing-country"
                variant="brutal"
                value={details.issuingCountry}
                maxLength={56}
                onChange={(e) =>
                  setDetails((p) => ({ ...p, issuingCountry: e.target.value }))
                }
              />
            </Field>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field id="checkout-document-type" label="Tipo de documento" required>
              <select
                id="checkout-document-type"
                value={details.documentType}
                onChange={(e) =>
                  setDetails((p) => ({
                    ...p,
                    documentType: e.target.value as DocumentType,
                  }))
                }
                disabled={isForeign}
                className="h-10 rounded-md border bg-background px-3 text-sm disabled:opacity-60"
              >
                <option value="CC">Cartão de Cidadão</option>
                <option value="PASSPORT">Passaporte</option>
              </select>
            </Field>

            <Field
              id="checkout-document-number"
              label={details.documentType === "PASSPORT" ? "Nº Passaporte" : "Nº Documento"}
              required
            >
              <Input
                id="checkout-document-number"
                variant="brutal"
                value={details.documentNumber}
                onChange={(e) =>
                  setDetails((p) => ({
                    ...p,
                    documentNumber: e.target.value.replace(/\D/g, "").slice(0, 20),
                  }))
                }
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={20}
              />
            </Field>
          </div>
        </SectionCard>
      ) : null}

      {step === "review" ? (
        <SectionCard
          title="Rever e concluir"
          description="Confere os dados antes de finalizar."
        >
          <div className="rounded-lg border p-3 text-sm space-y-1">
            <div className="font-medium">{details.fullName || "—"}</div>
            <div className="text-muted-foreground text-xs">{details.email || "—"}</div>
            <div className="text-muted-foreground text-xs">{details.phone || "—"}</div>
            <div className="text-muted-foreground text-xs">
              {details.nationality === "PT" ? "Portugal" : "Estrangeiro"} · {details.guestCount} hóspedes
            </div>
            <div className="text-muted-foreground text-xs">
              {details.documentType} · {details.documentNumber || "—"}
            </div>
          </div>

          <div className="rounded-lg border p-3 text-sm">
            <div className="font-medium">Total estimado</div>
            <div className="text-muted-foreground text-xs">
              {nights} noites · €{property.price}/noite
            </div>
            <div className="mt-2 text-lg font-black">€{total}</div>
          </div>
        </SectionCard>
      ) : null}

      {step === "payment" ? (
        <SectionCard
          title="Pagamento"
          description="O pagamento é iniciado no provedor configurado no booking-service."
        >
          <div className="rounded-lg border p-3 text-sm space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">Reserva</div>
              <div className="text-xs text-muted-foreground">#{createdBookingId ?? "—"}</div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">Status</div>
              <div className="text-xs text-muted-foreground">
                {readPaymentStatus(payment)}
              </div>
            </div>

            {providerInfo ? (
              <div className="text-xs text-muted-foreground">
                Provider: {String(providerInfo["name"] || "—")}
              </div>
            ) : null}
          </div>

          {readClientSecret(payment) ? (
            <div className="rounded-lg border p-3 text-sm space-y-2">
              <div className="font-medium">Client Secret</div>
              <Input
                id="payment-client-secret"
                variant="brutal"
                readOnly
                value={readClientSecret(payment) || ""}
              />
              <Button
                variant="brutal-outline"
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(readClientSecret(payment) || "")
                    toast.success("Copiado.")
                  } catch {
                    toast.error("Não foi possível copiar.")
                  }
                }}
              >
                Copiar
              </Button>
            </div>
          ) : null}

          <div className="rounded-lg border p-3 text-sm text-muted-foreground">
            Este projeto já devolve o client secret do Stripe. O próximo passo é integrar o Stripe Elements
            no frontend para recolher os dados do cartão e concluir o pagamento.
          </div>
        </SectionCard>
      ) : null}

      <div className="flex justify-between gap-3">
        <Button variant="brutal-outline" disabled={isSubmitting} onClick={goBack}>
          Voltar
        </Button>

        {step === "payment" ? (
          <Button variant="brutal" disabled={isSubmitting} onClick={onSuccess}>
            Terminar
          </Button>
        ) : step !== "review" ? (
          <Button variant="brutal" disabled={!canProceed || isSubmitting} onClick={goNext}>
            Continuar
          </Button>
        ) : (
          <Button variant="brutal" disabled={isSubmitting} onClick={submit}>
            {isSubmitting ? "A iniciar pagamento..." : "Ir para Pagamento"}
          </Button>
        )}
      </div>
    </div>
  )
}

function safeParseDate(value: string): Date | null {
  try {
    const parsed = parseISO(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readPaymentStatus(payment: BookingPaymentResponse | null): string {
  if (!payment) return "—"
  if (!isRecord(payment)) return "—"
  const status = payment["status"]
  return typeof status === "string" ? status : "—"
}

function readClientSecret(payment: BookingPaymentResponse | null): string | null {
  if (!payment) return null
  if (!isRecord(payment)) return null
  const clientSecret = payment["clientSecret"]
  return typeof clientSecret === "string" && clientSecret.length > 0 ? clientSecret : null
}

function validateStep(step: CheckoutStep, data: GuestDetails): string[] {
  if (step === "trip") {
    const errors: string[] = []
    if (!data.fullName.trim()) errors.push("fullName")
    if (!data.email.trim()) errors.push("email")
    if (!data.phone.trim()) errors.push("phone")
    if (!data.nationality.trim()) errors.push("nationality")
    if (data.guestCount < 1) errors.push("guestCount")
    return errors
  }

  if (step === "identity") {
    const errors: string[] = []
    if (!data.documentNumber.trim()) errors.push("documentNumber")
    if (data.nationality !== "PT" && !data.issuingCountry.trim()) errors.push("issuingCountry")
    return errors
  }

  return validateAll(data)
}

function validateAll(data: GuestDetails): string[] {
  const errors: string[] = []
  if (!data.fullName.trim()) errors.push("fullName")
  if (!data.email.trim()) errors.push("email")
  if (!data.phone.trim()) errors.push("phone")
  if (!data.nationality.trim()) errors.push("nationality")
  if (data.guestCount < 1) errors.push("guestCount")
  if (!data.documentNumber.trim()) errors.push("documentNumber")
  if (data.nationality !== "PT" && !data.issuingCountry.trim()) errors.push("issuingCountry")
  return errors
}

function StepPill({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-full border px-3 py-1 ${
        active ? "bg-primary text-primary-foreground border-primary" : "text-muted-foreground"
      }`}
    >
      {children}
    </div>
  )
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <BrutalShard rotate="secondary">
      <div className="space-y-1">
        <div className="text-lg font-black uppercase">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="mt-4 grid gap-4">{children}</div>
    </BrutalShard>
  )
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-xs font-medium">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      {children}
    </div>
  )
}

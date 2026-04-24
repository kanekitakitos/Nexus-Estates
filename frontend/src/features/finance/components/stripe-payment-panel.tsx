"use client"

import React from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js"
import { Loader2 } from "lucide-react"
import { notify } from "@/lib/notify"

import { Button } from "@/components/ui/forms/button"

function StripePaymentInner({
  bookingId,
  total,
  currency,
  onConfirmed,
}: {
  bookingId: number
  total: number
  currency: string
  onConfirmed: (paymentIntentId: string) => void | Promise<void>
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isPaying, setIsPaying] = React.useState(false)

  const handlePay = async () => {
    if (!stripe || !elements) return
    setIsPaying(true)
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      })

      if (result.error) {
        notify.error(result.error.message ?? "Pagamento falhou.")
        return
      }

      const intent = result.paymentIntent
      if (!intent) {
        notify.error("Pagamento incompleto.")
        return
      }

      if (intent.status === "succeeded") {
        await onConfirmed(intent.id)
        notify.success("Pagamento confirmado.")
        return
      }

      if (intent.status === "processing") {
        notify.message("Pagamento em processamento.")
        return
      }

      notify.message(`Estado do pagamento: ${intent.status}`)
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="space-y-4 border-t border-foreground/10 pt-4">
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-xs font-mono uppercase tracking-widest opacity-70">Stripe</div>
        <div className="text-sm font-black tabular-nums">
          €{total} {currency}
        </div>
      </div>

      <div className="rounded-xl border-2 border-foreground bg-background p-3 shadow-[4px_4px_0_0_rgb(0,0,0)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,0.8)]">
        <PaymentElement />
      </div>

      <Button
        variant="brutal"
        type="button"
        className="w-full h-12 text-base font-black uppercase tracking-wider"
        disabled={!stripe || !elements || isPaying}
        onClick={() => void handlePay()}
      >
        {isPaying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            A pagar…
          </>
        ) : (
          `Pagar • €${total}`
        )}
      </Button>

      <div className="text-[10px] font-mono opacity-70">
        Reserva #{bookingId}. Usa um cartão de teste Stripe (ex: 4242 4242 4242 4242).
      </div>
    </div>
  )
}

export function StripePaymentPanel({
  publishableKey,
  clientSecret,
  bookingId,
  total,
  currency,
  onConfirmed,
}: {
  publishableKey: string
  clientSecret: string
  bookingId: number
  total: number
  currency: string
  onConfirmed: (paymentIntentId: string) => void | Promise<void>
}) {
  const stripePromise = React.useMemo(() => loadStripe(publishableKey), [publishableKey])

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: "stripe" },
      }}
    >
      <StripePaymentInner bookingId={bookingId} total={total} currency={currency} onConfirmed={onConfirmed} />
    </Elements>
  )
}

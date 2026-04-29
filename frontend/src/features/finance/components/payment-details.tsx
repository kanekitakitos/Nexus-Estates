"use client"

import React from "react"
import { Copy } from "lucide-react"
import { notify } from "@/lib/notify"
import { financeTokens } from "@/features/finance/tokens"

import { Button } from "@/components/ui/forms/button"
import { Input } from "@/components/ui/forms/input"
import type { PaymentResponse, ProviderInfo } from "@/types/finance"

function readPaymentStatus(p: PaymentResponse | null): string {
  if (!p || typeof p !== "object") return financeTokens.copy.common.empty
  const s = (p as Record<string, unknown>)["status"]
  return typeof s === "string" ? s : financeTokens.copy.common.empty
}

function readClientSecret(p: PaymentResponse | null): string | null {
  if (!p || typeof p !== "object") return null
  const s = (p as Record<string, unknown>)["clientSecret"]
  return typeof s === "string" && s.length > 0 ? s : null
}

export function PaymentDetails({
  bookingId,
  payment,
  providerInfo,
  labelClassName,
  error,
  onRetry,
}: {
  bookingId: number | null
  payment: PaymentResponse | null
  providerInfo: ProviderInfo | null
  labelClassName: string
  error: string | null
  onRetry?: () => void | Promise<void>
}) {
  return (
    <div className="space-y-4">
      <div className="divide-y divide-foreground/10">
        <div className="py-2 flex items-center justify-between gap-3">
          <span className="text-xs font-mono uppercase tracking-widest opacity-70">{financeTokens.copy.paymentDetails.bookingLabel}</span>
          <span className="text-sm font-black">#{bookingId ?? financeTokens.copy.common.empty}</span>
        </div>
        <div className="py-2 flex items-center justify-between gap-3">
          <span className="text-xs font-mono uppercase tracking-widest opacity-70">{financeTokens.copy.paymentDetails.statusLabel}</span>
          <span className="text-sm font-black">{readPaymentStatus(payment)}</span>
        </div>
        <div className="py-2 flex items-center justify-between gap-3">
          <span className="text-xs font-mono uppercase tracking-widest opacity-70">{financeTokens.copy.paymentDetails.providerLabel}</span>
          <span className="text-sm font-black">{providerInfo?.name ?? financeTokens.copy.common.empty}</span>
        </div>
      </div>

      {error ? (
        <div className="border-t border-foreground/10 pt-4 space-y-2">
          <div className={labelClassName}>{financeTokens.copy.paymentDetails.paymentLabel}</div>
          <div className="text-sm font-mono text-destructive">{error}</div>
          {onRetry ? (
            <Button variant="brutal-outline" type="button" size="sm" onClick={() => void onRetry()}>
              {financeTokens.copy.paymentDetails.retry}
            </Button>
          ) : null}
        </div>
      ) : null}

      {readClientSecret(payment) ? (
        <div className="space-y-2 pt-4 border-t border-foreground/10">
          <div className={labelClassName}>{financeTokens.copy.paymentDetails.clientSecretLabel}</div>
          <Input id="payment-client-secret" variant="brutal" readOnly value={readClientSecret(payment) ?? ""} />
          <Button
            variant="brutal-outline"
            type="button"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(readClientSecret(payment) ?? "")
                notify.success(financeTokens.copy.paymentDetails.copySuccess)
              } catch {
                notify.error(financeTokens.copy.paymentDetails.copyError)
              }
            }}
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            {financeTokens.copy.paymentDetails.copyButton}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

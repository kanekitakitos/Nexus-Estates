"use client"

import React from "react"
import { financeTokens } from "@/features/finance/tokens"

import { Button } from "@/components/ui/forms/button"
import type { PaymentResponse, ProviderInfo } from "@/types/finance"

function readPaymentStatus(p: PaymentResponse | null): string {
  if (!p || typeof p !== "object") return financeTokens.copy.common.empty
  const s = (p as Record<string, unknown>)["status"]
  return typeof s === "string" ? s : financeTokens.copy.common.empty
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
    </div>
  )
}

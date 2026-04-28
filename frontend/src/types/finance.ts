export type PaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "MULTIBANCO"
  | "MB_WAY"
  | "PAYPAL"

export type PaymentStatus =
  | "PENDING"
  | "REQUIRES_ACTION"
  | "PROCESSING"
  | "REQUIRES_CAPTURE"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "UNKNOWN"

export type PaymentMethodDetails = {
  type: string
  lastFourDigits: string
  brand: string
}

export type PaymentResponse =
  | {
      transactionId: string
      status: PaymentStatus
      clientSecret: string
      amount: number
      currency: string
      metadata?: Record<string, unknown>
    }
  | {
      transactionId: string
      status: "SUCCEEDED"
      providerTransactionId: string
      amount: number
      currency: string
      confirmedAt: string
      receiptUrl?: string | null
      authorizationCode?: string | null
      fees?: number | null
      paymentMethod?: PaymentMethodDetails | null
      metadata?: Record<string, unknown>
    }
  | {
      transactionId: string
      status: "REQUIRES_ACTION"
      clientSecret: string
      actionType: string
      redirectUrl?: string | null
      metadata?: Record<string, unknown>
    }
  | {
      transactionId: string
      status: "FAILED" | "CANCELLED" | "UNKNOWN"
      errorCode: string
      errorMessage: string
      failedAt: string
      metadata?: Record<string, unknown>
    }

export type ProviderInfo = {
  name: string
  version: string
  description: string
  supportedPaymentMethods: PaymentMethod[]
  supportedCurrencies: string[]
  capabilities: Record<string, unknown>
  supportsRefunds: boolean
  supportsPartialRefunds: boolean
  supportsWebhooks: boolean
  webhookUrl?: string | null
  apiVersion?: string | null
  environment?: string | null
}

export type TransactionInfo = {
  transactionId: string
  providerTransactionId?: string | null
  amount: number
  currency: string
  status: PaymentStatus
  createdAt?: string | null
  updatedAt?: string | null
  metadata?: Record<string, unknown>
}

export type RefundResult = {
  refundId: string
  providerRefundId: string
  transactionId: string
  refundedAmount: number
  currency: string
  status: string
  createdAt?: string | null
  metadata?: Record<string, unknown>
}

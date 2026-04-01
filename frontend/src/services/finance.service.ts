import { bookingsAxios } from "@/lib/axiosAPI"
import type { AxiosError } from "axios"
import { toast } from "sonner"
import type { PaymentMethod, PaymentResponse, PaymentStatus, ProviderInfo, RefundResult, TransactionInfo } from "@/types/finance"

export type { PaymentMethod, PaymentResponse, PaymentStatus, ProviderInfo, RefundResult, TransactionInfo } from "@/types/finance"

export class FinanceService {
  static async getPaymentProviderInfo(): Promise<ProviderInfo> {
    try {
      const response = await bookingsAxios.get<ProviderInfo>(`/payments/provider`)
      return response.data
    } catch (error) {
      this.handleError(error, "obter info do provedor de pagamento")
      throw error
    }
  }

  static async createPaymentIntent(params: { bookingId: number; paymentMethod: PaymentMethod }): Promise<PaymentResponse> {
    try {
      const response = await bookingsAxios.post<PaymentResponse>(`/${params.bookingId}/payments/intent`, {
        paymentMethod: params.paymentMethod,
      })
      return response.data
    } catch (error) {
      this.handleError(error, "iniciar pagamento")
      throw error
    }
  }

  static async confirmPayment(params: {
    bookingId: number
    paymentIntentId: string
    metadata?: Record<string, unknown>
  }): Promise<PaymentResponse> {
    try {
      const response = await bookingsAxios.post<PaymentResponse>(`/${params.bookingId}/payments/confirm`, {
        paymentIntentId: params.paymentIntentId,
      })
      return response.data
    } catch (error) {
      this.handleError(error, "confirmar pagamento")
      throw error
    }
  }

  static async processDirectPayment(params: { bookingId: number; paymentMethod: PaymentMethod }): Promise<PaymentResponse> {
    try {
      const response = await bookingsAxios.post<PaymentResponse>(`/${params.bookingId}/payments/direct`, {
        paymentMethod: params.paymentMethod,
      })
      return response.data
    } catch (error) {
      this.handleError(error, "processar pagamento direto")
      throw error
    }
  }

  static async refundPayment(params: { bookingId: number; amount?: number; reason?: string }): Promise<RefundResult> {
    try {
      const response = await bookingsAxios.post<RefundResult>(`/${params.bookingId}/payments/refund`, {
        amount: params.amount,
        reason: params.reason,
      })
      return response.data
    } catch (error) {
      this.handleError(error, "processar reembolso")
      throw error
    }
  }

  static async getTransactionDetails(transactionId: string): Promise<TransactionInfo> {
    try {
      const response = await bookingsAxios.get<TransactionInfo>(`/payments/transactions/${transactionId}`)
      return response.data
    } catch (error) {
      this.handleError(error, "obter detalhes da transação")
      throw error
    }
  }

  static async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const response = await bookingsAxios.get<PaymentStatus>(`/payments/transactions/${transactionId}/status`)
      return response.data
    } catch (error) {
      this.handleError(error, "obter estado do pagamento")
      throw error
    }
  }

  static async supportsPaymentMethod(paymentMethod: PaymentMethod): Promise<{ paymentMethod: string; supported: boolean }> {
    try {
      const response = await bookingsAxios.get<{ paymentMethod: string; supported: boolean }>(`/payments/methods/${paymentMethod}/supported`)
      return response.data
    } catch (error) {
      this.handleError(error, "verificar suporte ao método de pagamento")
      throw error
    }
  }

  private static isAxiosError(error: unknown): error is AxiosError {
    return typeof error === "object" && error !== null && "isAxiosError" in error
  }

  private static handleError(error: unknown, action: string): void {
    console.error(`Erro ao ${action}:`, error)
    if (this.isAxiosError(error) && error.response) {
      const status = error.response.status
      if (status === 403) {
        toast.error("Não tem permissão para esta ação.")
      } else if (status === 401) {
        toast.error("Sessão expirada. Faça login novamente.")
      } else {
        toast.error(`Erro ao ${action}. Tente novamente.`)
      }
    } else {
      toast.error("Erro de conexão ao servidor financeiro.")
    }
  }
}

/**
 * Tipos do módulo de reservas (Bookings) e pagamentos.
 *
 * Origem backend (API Gateway):
 * - /api/bookings (booking-service)
 *
 * Nota:
 * - Datas vêm como strings "YYYY-MM-DD" (ex: "2026-07-15").
 */
export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "REFUNDED";

/**
 * Modelo devolvido pelo booking-service para uma reserva.
 */
export interface BookingResponse {
  id: number;
  propertyId: number;
  userId?: number | null;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
}

/**
 * Métodos de pagamento suportados (alinhados com o enum do backend).
 */
export type PaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "MULTIBANCO"
  | "MB_WAY"
  | "PAYPAL";

/**
 * Estados possíveis de uma transação no gateway de pagamentos.
 */
export type PaymentStatus =
  | "PENDING"
  | "REQUIRES_ACTION"
  | "PROCESSING"
  | "REQUIRES_CAPTURE"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "UNKNOWN";

/**
 * Resposta “unificada” de pagamento (criar intenção, confirmar, direto, etc.).
 *
 * Nota:
 * - Pode vir como objeto genérico dependendo do provider/flow.
 */
export type PaymentResponse =
  | {
      transactionId: string;
      status: PaymentStatus;
      clientSecret?: string;
      amount?: number;
      currency?: string;
      actionType?: string;
      redirectUrl?: string | null;
      errorCode?: string;
      errorMessage?: string;
    }
  | Record<string, unknown>;

/**
 * Payload de criação de reserva no frontend.
 *
 * Mapeamento:
 * - Se userId existir, o backend associa ao utilizador.
 * - Se userId não existir, o frontend deve fornecer guestDetails; o service converte
 *   para o formato “flatten” esperado pelo backend (guestFullName, guestEmail, ...).
 */
export interface CreateBookingRequest {
  propertyId: number;
  userId?: number | null;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  guestDetails?: {
    fullName: string;
    email: string;
    phone: string;
    nationality: string;
    issuingCountry: string;
    documentType: "CC" | "PASSPORT";
    documentNumber: string;
    documentIssueDate?: string;
  };
}

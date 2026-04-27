/**
 * Tipos do módulo de reservas (Bookings).
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

export interface BookingProperty {
  id: string
  title: string
  description: string
  location: string
  price: number
  imageUrl: string
  status: "AVAILABLE" | "BOOKED" | "MAINTENANCE"
  rating?: number
  featured?: boolean
  tags?: string[]
}

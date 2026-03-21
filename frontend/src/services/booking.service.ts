import { bookingsAxios } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { toast } from "sonner";

/**
 * Estados possíveis para uma reserva (alinhados com o backend).
 */
export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "REFUNDED";

/**
 * Representação de uma reserva devolvida pelo backend booking-service.
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

export type PaymentMethod =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "MULTIBANCO"
  | "MB_WAY"
  | "PAYPAL";

export type PaymentStatus =
  | "PENDING"
  | "REQUIRES_ACTION"
  | "PROCESSING"
  | "REQUIRES_CAPTURE"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "UNKNOWN";

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
 * Payload de criação de reserva (DTO de entrada do backend).
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

/**
 * Serviço responsável pelas operações de reserva.
 */
export class BookingService {
    
    /**
     * Obtém todas as reservas do utilizador autenticado (via localStorage).
     */
    static async getMyBookings(): Promise<BookingResponse[]> {
        try {
            if (typeof window === "undefined") return [];
            const userId = localStorage.getItem("userId");
            if (!userId) return [];
            return await this.getBookingsByUser(Number(userId));
        } catch (error) {
            this.handleError(error, "obter as suas reservas");
            throw error;
        }
    }

    /**
     * Cria uma nova reserva.
     */
    static async createBooking(bookingData: CreateBookingRequest): Promise<BookingResponse> {
        try {
            const payload: Record<string, unknown> = {
                propertyId: bookingData.propertyId,
                checkInDate: bookingData.checkInDate,
                checkOutDate: bookingData.checkOutDate,
                guestCount: bookingData.guestCount,
            };

            if (bookingData.userId != null) {
                payload.userId = bookingData.userId;
            } else if (bookingData.guestDetails) {
                payload.guestFullName = bookingData.guestDetails.fullName;
                payload.guestEmail = bookingData.guestDetails.email;
                payload.guestPhone = bookingData.guestDetails.phone;
                payload.guestNationality = bookingData.guestDetails.nationality;
                payload.guestIssuingCountry = bookingData.guestDetails.issuingCountry;
                payload.guestDocumentType = bookingData.guestDetails.documentType;
                payload.guestDocumentNumber = bookingData.guestDetails.documentNumber;
                if (bookingData.guestDetails.documentIssueDate) {
                    payload.guestDocumentIssueDate = bookingData.guestDetails.documentIssueDate;
                }
            }

            const response = await bookingsAxios.post<BookingResponse>("", payload);
            toast.success("Reserva criada com sucesso.");
            return response.data;
        } catch (error) {
            this.handleError(error, "criar a reserva");
            throw error;
        }
    }

    /**
     * Obtém o histórico de reservas de um utilizador específico.
     */
    static async getBookingsByUser(userId: number): Promise<BookingResponse[]> {
        try {
            const response = await bookingsAxios.get<BookingResponse[]>(`/user/${userId}`);
            return response.data;
        } catch (error) {
            this.handleError(error, "obter reservas por utilizador");
            throw error;
        }
    }

    static async createPaymentIntent(bookingId: number, paymentMethod: PaymentMethod): Promise<PaymentResponse> {
        try {
            const response = await bookingsAxios.post<PaymentResponse>(`/${bookingId}/payments/intent`, {
                paymentMethod,
            });
            return response.data;
        } catch (error) {
            this.handleError(error, "iniciar pagamento");
            throw error;
        }
    }

    static async getPaymentProviderInfo(): Promise<Record<string, unknown>> {
        try {
            const response = await bookingsAxios.get<Record<string, unknown>>(`/payments/provider`);
            return response.data;
        } catch (error) {
            this.handleError(error, "obter info do provedor de pagamento");
            throw error;
        }
    }

    /**
     * Tratamento centralizado de erros para o serviço de reservas.
     */
    private static handleError(error: unknown, action: string): void {
        console.error(`Erro ao ${action}:`, error);
        if (this.isAxiosError(error) && error.response) {
            const status = error.response.status;
            if (status === 409) {
                toast.error("Estas datas já não estão disponíveis.");
            } else if (status === 403) {
                toast.error("Não tem permissão para esta ação.");
            } else if (status === 401) {
                toast.error("Sessão expirada. Faça login novamente.");
            } else {
                toast.error(`Erro ao ${action}. Tente novamente.`);
            }
        } else {
            toast.error("Erro de conexão ao servidor de reservas.");
        }
    }

    private static isAxiosError(error: unknown): error is AxiosError {
        return typeof error === "object" && error !== null && "isAxiosError" in error;
    }
}

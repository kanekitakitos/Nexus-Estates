import { bookingsAxios } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import type {
    BookingResponse,
    CreateBookingRequest,
    PaymentMethod,
    PaymentResponse,
    PaymentStatus,
} from "@/types/booking";

export type {
    BookingResponse,
    CreateBookingRequest,
    PaymentMethod,
    PaymentResponse,
    PaymentStatus,
} from "@/types/booking";

/**
 * Serviço responsável pelas operações de reserva.
 *
 * Base path no API Gateway:
 * - /api/bookings
 *
 * Instância Axios utilizada:
 * - bookingsAxios (baseURL: {NEXT_PUBLIC_API_URL}/bookings)
 */
export class BookingService {
    
    /**
     * Obtém todas as reservas do utilizador autenticado (via localStorage).
     *
     * Endpoint backend:
     * - GET /api/bookings/user/{userId}
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
     *
     * Endpoint backend:
     * - POST /api/bookings
     *
     * Notas:
     * - bookingData.guestDetails é mapeado para o formato flatten do backend (guestFullName, guestEmail, ...)
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
     *
     * Endpoint backend:
     * - GET /api/bookings/user/{userId}
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

    /**
     * Inicia um pagamento (cria PaymentIntent) para a reserva.
     *
     * Endpoint backend:
     * - POST /api/bookings/{bookingId}/payments/intent
     */
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

    /**
     * Devolve informação sobre o provider de pagamentos configurado (ex: Stripe).
     *
     * Endpoint backend:
     * - GET /api/bookings/payments/provider
     */
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
     * Obtém uma reserva pelo ID.
     *
     * Endpoint backend:
     * - GET /api/bookings/{id}
     */
    static async getBookingById(id: number): Promise<BookingResponse> {
        try {
            const response = await bookingsAxios.get<BookingResponse>(`/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error, "obter reserva por ID");
            throw error;
        }
    }

    /**
     * Lista reservas de uma propriedade.
     *
     * Endpoint backend:
     * - GET /api/bookings/property/{propertyId}
     */
    static async getBookingsByProperty(propertyId: number): Promise<BookingResponse[]> {
        try {
            const response = await bookingsAxios.get<BookingResponse[]>(`/property/${propertyId}`);
            return response.data;
        } catch (error) {
            this.handleError(error, "obter reservas por propriedade");
            throw error;
        }
    }

    /**
     * Confirma um pagamento previamente iniciado (paymentIntentId).
     *
     * Endpoint backend:
     * - POST /api/bookings/{bookingId}/payments/confirm
     */
    static async confirmPayment(bookingId: number, paymentIntentId: string): Promise<PaymentResponse> {
        try {
            const response = await bookingsAxios.post<PaymentResponse>(`/${bookingId}/payments/confirm`, {
                paymentIntentId,
            });
            return response.data;
        } catch (error) {
            this.handleError(error, "confirmar pagamento");
            throw error;
        }
    }

    /**
     * Pagamento direto (sem intenção prévia).
     *
     * Endpoint backend:
     * - POST /api/bookings/{bookingId}/payments/direct
     */
    static async processDirectPayment(bookingId: number, paymentMethod: PaymentMethod): Promise<PaymentResponse> {
        try {
            const response = await bookingsAxios.post<PaymentResponse>(`/${bookingId}/payments/direct`, {
                paymentMethod,
            });
            return response.data;
        } catch (error) {
            this.handleError(error, "processar pagamento direto");
            throw error;
        }
    }

    /**
     * Solicita reembolso (total ou parcial).
     *
     * Endpoint backend:
     * - POST /api/bookings/{bookingId}/payments/refund
     *
     * Payload:
     * - amount (opcional): número
     * - reason (opcional): string
     */
    static async refundPayment(bookingId: number, payload?: { amount?: number; reason?: string }): Promise<Record<string, unknown>> {
        try {
            const response = await bookingsAxios.post<Record<string, unknown>>(`/${bookingId}/payments/refund`, payload ?? {});
            return response.data;
        } catch (error) {
            this.handleError(error, "processar reembolso");
            throw error;
        }
    }

    /**
     * Consulta detalhes de uma transação no gateway de pagamentos.
     *
     * Endpoint backend:
     * - GET /api/bookings/payments/transactions/{transactionId}
     */
    static async getTransactionDetails(transactionId: string): Promise<Record<string, unknown>> {
        try {
            const response = await bookingsAxios.get<Record<string, unknown>>(`/payments/transactions/${transactionId}`);
            return response.data;
        } catch (error) {
            this.handleError(error, "obter detalhes da transação");
            throw error;
        }
    }

    /**
     * Consulta o estado atual de uma transação.
     *
     * Endpoint backend:
     * - GET /api/bookings/payments/transactions/{transactionId}/status
     */
    static async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
        try {
            const response = await bookingsAxios.get<PaymentStatus>(`/payments/transactions/${transactionId}/status`);
            return response.data;
        } catch (error) {
            this.handleError(error, "obter estado do pagamento");
            throw error;
        }
    }

    /**
     * Verifica se o gateway suporta um método de pagamento.
     *
     * Endpoint backend:
     * - GET /api/bookings/payments/methods/{paymentMethod}/supported
     */
    static async supportsPaymentMethod(paymentMethod: PaymentMethod): Promise<{ paymentMethod: string; supported: boolean }> {
        try {
            const response = await bookingsAxios.get<{ paymentMethod: string; supported: boolean }>(`/payments/methods/${paymentMethod}/supported`);
            return response.data;
        } catch (error) {
            this.handleError(error, "verificar suporte ao método de pagamento");
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

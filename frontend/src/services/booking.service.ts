import { bookingsAxios } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { notify } from "@/lib/notify";
import { AuthService } from "@/services/auth.service";
import type {
    BookingResponse,
    CreateBookingRequest,
} from "@/types/booking";

export type {
    BookingResponse,
    CreateBookingRequest,
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
     * Obtém todas as reservas do utilizador autenticado.
     *
     * Endpoint backend:
     * - GET /api/bookings/me
     */
    static async getMyBookings(): Promise<BookingResponse[]> {
        try {
            if (typeof window === "undefined") return [];
            const response = await bookingsAxios.get<BookingResponse[]>(`/me`);
            return response.data;
        } catch (error) {
            if (this.isAxiosError(error) && error.response?.status === 401) {
                const session = AuthService.getSession();
                const rawUserId = session.userId || "";
                const userId =
                    rawUserId.trim() && !Number.isNaN(Number(rawUserId)) ? Number(rawUserId) : null;

                if (typeof userId === "number" && !Number.isNaN(userId)) {
                    try {
                        const fallback = await bookingsAxios.get<BookingResponse[]>(`/user/${userId}`);
                        return fallback.data;
                    } catch (fallbackError) {
                        this.handleError(fallbackError, "obter as suas reservas");
                        throw fallbackError;
                    }
                }
            }

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
            }

            if (bookingData.guestDetails) {
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
            notify.success("Reserva criada com sucesso.");
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
    static async getBookingsByProperty(
        propertyId: number,
        options?: { silent?: boolean },
    ): Promise<BookingResponse[]> {
        try {
            const response = await bookingsAxios.get<BookingResponse[]>(`/property/${propertyId}`);
            return response.data;
        } catch (error) {
            if (!options?.silent) {
                this.handleError(error, "obter reservas por propriedade");
            }
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
                notify.error("Estas datas já não estão disponíveis.");
            } else if (status === 403) {
                notify.error("Não tem permissão para esta ação.");
            } else if (status === 401) {
                notify.error("Sessão expirada. Faça login novamente.");
            } else {
                notify.error(`Erro ao ${action}. Tente novamente.`);
            }
        } else {
            notify.error("Erro de conexão ao servidor de reservas.");
        }
    }

    private static isAxiosError(error: unknown): error is AxiosError {
        return typeof error === "object" && error !== null && "isAxiosError" in error;
    }
}

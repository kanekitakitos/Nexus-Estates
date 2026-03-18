import { bookingsAxios } from "@/lib/axiosAPI";
import { toast } from "sonner";

/**
 * Interface que representa os dados de uma reserva no frontend.
 */
export interface Booking {
    id: number;
    propertyId: number;
    userId: number;
    checkInDate: string;
    checkOutDate: string;
    guestCount: number;
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    createdAt: string;
}

/**
 * Serviço responsável pelas operações de reserva.
 */
export class BookingService {
    
    /**
     * Obtém todas as reservas do utilizador atual.
     */
    static async getMyBookings(): Promise<Booking[]> {
        try {
            const response = await bookingsAxios.get("/my-bookings");
            return response.data;
        } catch (error) {
            this.handleError(error, "obter as suas reservas");
            throw error;
        }
    }

    /**
     * Cria uma nova reserva.
     */
    static async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
        try {
            const response = await bookingsAxios.post("", bookingData);
            toast.success("Reserva efetuada com sucesso!");
            return response.data;
        } catch (error) {
            this.handleError(error, "criar a reserva");
            throw error;
        }
    }

    /**
     * Cancela uma reserva existente.
     */
    static async cancelBooking(id: number): Promise<void> {
        try {
            await bookingsAxios.delete(`/${id}`);
            toast.success("Reserva cancelada.");
        } catch (error) {
            this.handleError(error, "cancelar a reserva");
            throw error;
        }
    }

    /**
     * Tratamento centralizado de erros para o serviço de reservas.
     */
    private static handleError(error: any, action: string): void {
        console.error(`Erro ao ${action}:`, error);
        if (error.response) {
            const status = error.response.status;
            if (status === 409) {
                toast.error("Estas datas já não estão disponíveis.");
            } else if (status === 403) {
                toast.error("Não tem permissão para esta ação.");
            } else {
                toast.error(`Erro ao ${action}. Tente novamente.`);
            }
        } else {
            toast.error("Erro de conexão ao servidor de reservas.");
        }
    }
}

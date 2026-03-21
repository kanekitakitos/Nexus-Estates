import { syncAxios } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { toast } from "sonner";

/**
 * Interface base para mensagens de chat.
 */
export interface SyncMessage {
    id: string | number;
    senderId: string;
    content: string;
    createdAt: string;
}

/**
 * Serviço responsável pela comunicação em tempo real e sincronização de dados externos.
 */
export class SyncService {
    
    /**
     * Obtém um token de autenticação temporário para o Ably, restrito ao canal do booking.
     */
    static async getRealtimeToken(bookingId: string | number): Promise<Record<string, unknown>> {
        try {
            const response = await syncAxios.get<Record<string, unknown>>("/auth/realtime", {
                params: { bookingId: String(bookingId) },
            });
            return response.data;
        } catch (error) {
            this.handleError(error, "obter token de tempo real");
            throw error;
        }
    }

    /**
     * Obtém o histórico de mensagens de uma reserva.
     */
    static async getBookingMessages(bookingId: string | number): Promise<SyncMessage[]> {
        try {
            const response = await syncAxios.get<SyncMessage[]>(`/messages/${bookingId}`);
            return response.data;
        } catch (error) {
            this.handleError(error, "obter histórico do chat");
            throw error;
        }
    }

    private static isAxiosError(error: unknown): error is AxiosError {
        return typeof error === "object" && error !== null && "isAxiosError" in error;
    }

    /**
     * Tratamento centralizado de erros para o serviço de sincronização.
     */
    private static handleError(error: unknown, action: string): void {
        console.error(`Erro ao ${action}:`, error);
        if (this.isAxiosError(error) && error.response) {
            toast.error(`Erro ao ${action}. Verifique a sua ligação.`);
        } else {
            toast.error("Erro de conexão com o serviço de tempo real.");
        }
    }
}

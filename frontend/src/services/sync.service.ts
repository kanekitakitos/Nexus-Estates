import { syncAxios } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import type { SyncMessage } from "@/types/sync";

export type { SyncMessage } from "@/types/sync";

/**
 * Serviço responsável pela comunicação em tempo real e sincronização de dados externos.
 *
 * Base path no API Gateway:
 * - /api/sync
 *
 * Instância Axios utilizada:
 * - syncAxios (baseURL: {NEXT_PUBLIC_API_URL}/sync)
 */
export class SyncService {
    
    /**
     * Obtém um token de autenticação temporário para o Ably, restrito ao canal do booking.
     *
     * Endpoint backend:
     * - GET /api/sync/auth/realtime?bookingId={bookingId}
     *
     * Auth:
     * - Requer JWT; o API Gateway injeta X-User-Id no backend
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
     *
     * Endpoint backend:
     * - GET /api/sync/messages/{bookingId}
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

    /**
     * Envia uma mensagem para o chat da reserva.
     *
     * Endpoint backend:
     * - POST /api/sync/messages/{bookingId}
     *
     * Payload:
     * - senderId: string (identificador lógico do remetente)
     * - content: string
     */
    static async sendMessage(bookingId: string | number, payload: { senderId: string; content: string }): Promise<SyncMessage> {
        try {
            const response = await syncAxios.post<SyncMessage>(`/messages/${bookingId}`, payload);
            return response.data;
        } catch (error) {
            this.handleError(error, "enviar mensagem");
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

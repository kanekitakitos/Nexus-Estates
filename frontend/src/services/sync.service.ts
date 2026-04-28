import { syncAxios } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { notify } from "@/lib/notify";
import type { ApiResponse } from "@/lib/axiosAPI"
import type { SyncMessage, WebhookSubscription, CreateWebhookSubscriptionRequest, CreatedWebhookSubscription } from "@/types/sync";

export type { SyncMessage, WebhookSubscription, CreateWebhookSubscriptionRequest, CreatedWebhookSubscription } from "@/types/sync";

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

    static async listWebhooks(): Promise<WebhookSubscription[]> {
        try {
            const response = await syncAxios.get<ApiResponse<WebhookSubscription[]>>(`/webhooks`)
            return response.data.data
        } catch (error) {
            this.handleError(error, "listar webhooks")
            throw error
        }
    }

    static async createWebhook(payload: CreateWebhookSubscriptionRequest): Promise<CreatedWebhookSubscription> {
        try {
            const response = await syncAxios.post<ApiResponse<CreatedWebhookSubscription>>(`/webhooks`, payload)
            notify.success("Webhook criado. Guarde o secret.")
            return response.data.data
        } catch (error) {
            this.handleError(error, "criar webhook")
            throw error
        }
    }

    static async toggleWebhook(id: number): Promise<void> {
        try {
            await syncAxios.patch<ApiResponse<void>>(`/webhooks/${id}/toggle`)
        } catch (error) {
            this.handleError(error, "atualizar webhook")
            throw error
        }
    }

    static async deleteWebhook(id: number): Promise<void> {
        try {
            await syncAxios.delete<ApiResponse<void>>(`/webhooks/${id}`)
            notify.success("Webhook removido.")
        } catch (error) {
            this.handleError(error, "remover webhook")
            throw error
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
            notify.error(`Erro ao ${action}. Verifique a sua ligação.`);
        } else {
            notify.error("Erro de conexão com o serviço de tempo real.");
        }
    }
}

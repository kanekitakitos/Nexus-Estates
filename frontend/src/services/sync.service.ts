import { syncAxios } from "@/lib/axiosAPI";
import type { AxiosError } from "axios";
import { notify } from "@/lib/notify";
import type { ApiResponse } from "@/lib/axiosAPI"
import type { SyncConversation, SyncMessage, WebhookSubscription, CreateWebhookSubscriptionRequest, CreatedWebhookSubscription } from "@/types/sync";

export type { SyncConversation, SyncMessage, WebhookSubscription, CreateWebhookSubscriptionRequest, CreatedWebhookSubscription } from "@/types/sync";

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
     * - GET /api/sync/auth/realtime?inquiryId={inquiryId}
     *
     * Auth:
     * - Requer JWT; o API Gateway injeta X-User-Id no backend
     */
    static async getRealtimeToken(params: { bookingId?: string | number; inquiryId?: string | number }): Promise<Record<string, unknown>> {
        try {
            const response = await syncAxios.get<Record<string, unknown>>("/auth/realtime", {
                params: {
                    ...(params.bookingId != null ? { bookingId: String(params.bookingId) } : {}),
                    ...(params.inquiryId != null ? { inquiryId: String(params.inquiryId) } : {}),
                },
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

    static async getInquiryMessages(inquiryId: string | number): Promise<SyncMessage[]> {
        try {
            const response = await syncAxios.get<SyncMessage[]>(`/messages/inquiry/${inquiryId}`);
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
     * - content: string
     */
    static async sendMessage(bookingId: string | number, payload: { content: string }): Promise<SyncMessage> {
        try {
            const response = await syncAxios.post<SyncMessage>(`/messages/${bookingId}`, payload);
            return response.data;
        } catch (error) {
            this.handleError(error, "enviar mensagem");
            throw error;
        }
    }

    static async sendInquiryMessage(inquiryId: string | number, payload: { content: string }): Promise<SyncMessage> {
        try {
            const response = await syncAxios.post<SyncMessage>(`/messages/inquiry/${inquiryId}`, payload);
            return response.data;
        } catch (error) {
            this.handleError(error, "enviar mensagem");
            throw error;
        }
    }

    static async createPropertyInquiry(propertyId: number): Promise<SyncConversation> {
        try {
            const response = await syncAxios.post<ApiResponse<SyncConversation>>(`/conversations/property/${propertyId}`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "iniciar conversa");
            throw error;
        }
    }

    static async getExistingPropertyInquiry(propertyId: number): Promise<SyncConversation | null> {
        try {
            const response = await syncAxios.post<ApiResponse<SyncConversation>>(`/conversations/property/${propertyId}`);
            return response.data.data;
        } catch (error) {
            return null;
        }
    }

    static async sendFirstPropertyMessage(propertyId: number, payload: { content: string }): Promise<{ inquiryId: number; chatId: string; message: SyncMessage }> {
        try {
            const response = await syncAxios.post<ApiResponse<{ inquiryId: number; chatId: string; message: SyncMessage }>>(
                `/messages/property/${propertyId}`,
                payload
            );
            return response.data.data;
        } catch (error) {
            this.handleError(error, "enviar mensagem");
            throw error;
        }
    }

    static async listMyConversations(): Promise<SyncConversation[]> {
        try {
            const response = await syncAxios.get<ApiResponse<SyncConversation[]>>(`/conversations/mine`);
            return response.data.data;
        } catch (error) {
            this.handleError(error, "listar conversas");
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

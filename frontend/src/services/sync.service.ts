import { syncAxios } from "@/lib/axiosAPI";
import { toast } from "sonner";

/**
 * Interface para mensagens de chat em tempo real via Sync Service.
 */
export interface SyncMessage {
    id?: number;
    senderId: number;
    receiverId: number;
    content: string;
    timestamp: string;
    type: 'TEXT' | 'IMAGE' | 'SYSTEM';
}

/**
 * Serviço responsável pela comunicação em tempo real e sincronização de dados externos.
 */
export class SyncService {
    
    /**
     * Envia uma mensagem via Sync Service (que será processada e enviada para o Ably).
     */
    static async sendMessage(message: Partial<SyncMessage>): Promise<SyncMessage> {
        try {
            const response = await syncAxios.post("/messages", message);
            return response.data;
        } catch (error) {
            this.handleError(error, "enviar mensagem");
            throw error;
        }
    }

    /**
     * Obtém o histórico de mensagens entre dois utilizadores.
     */
    static async getChatHistory(userId: number): Promise<SyncMessage[]> {
        try {
            const response = await syncAxios.get(`/messages/history/${userId}`);
            return response.data;
        } catch (error) {
            this.handleError(error, "obter histórico de chat");
            throw error;
        }
    }

    /**
     * Obtém um token de autenticação seguro para o cliente Ably.
     */
    static async getAblyToken(channelId: string): Promise<any> {
        try {
            const response = await syncAxios.get(`/auth/ably-token?channelId=${channelId}`);
            return response.data;
        } catch (error) {
            this.handleError(error, "obter token do Ably");
            throw error;
        }
    }

    /**
     * Tratamento centralizado de erros para o serviço de sincronização.
     */
    private static handleError(error: any, action: string): void {
        console.error(`Erro ao ${action}:`, error);
        if (error.response) {
            toast.error(`Erro ao ${action}. Verifique a sua ligação.`);
        } else {
            toast.error("Erro de conexão com o serviço de tempo real.");
        }
    }
}

package com.nexus.estates.service;

/**
 * Interface que define o contrato para integração com plataformas de chat e mensagens em tempo real.
 * <p>
 * Esta interface segue o padrão de projeto <b>Strategy</b>, permitindo que a aplicação alterne
 * entre diferentes fornecedores de serviço (como Ably, Pusher, Firebase, WebSocket nativo)
 * sem impactar a lógica de negócio que consome este serviço.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 * @see AblySyncService
 */
public interface ChatPlatform {

    /**
     * Envia uma mensagem para um canal específico na plataforma de chat configurada.
     *
     * @param channel O identificador do canal de destino (ex: "booking-updates", "chat-room-123").
     * @param event   O nome do evento associado à mensagem (ex: "new-message", "status-change").
     *                Pode ser opcional dependendo da implementação subjacente.
     * @param message O conteúdo da mensagem a ser enviada. Pode ser um objeto complexo que será serializado.
     * @return {@code true} se a mensagem foi aceita para envio com sucesso; {@code false} caso contrário.
     */
    boolean sendMessage(String channel, String event, Object message);

    /**
     * Gera um token de acesso temporário para um cliente específico.
     * <p>
     * Este token deve ter permissões restritas ao canal especificado e estar vinculado
     * à identidade do usuário (userId) para garantir rastreabilidade e segurança.
     * </p>
     *
     * @param userId    O identificador único do usuário no sistema.
     * @param channelId O identificador do canal ao qual o usuário terá acesso.
     * @return Um token ou objeto de autenticação que o cliente frontend usará para se conectar.
     */
    Object generateClientToken(String userId, String channelId);
}

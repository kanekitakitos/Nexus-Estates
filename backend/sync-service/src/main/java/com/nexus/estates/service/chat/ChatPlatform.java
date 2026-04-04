package com.nexus.estates.service.chat;

import com.nexus.estates.service.external.connectors.AblyConnector;

/**
 * Interface que define o contrato para integração com plataformas de chat e mensagens em tempo real.
 * <p>
 * Esta interface segue o padrão de projeto <b>Strategy</b>, permitindo que a aplicação alterne
 * entre diferentes fornecedores de serviço (como Ably, Pusher, Firebase, WebSocket nativo)
 * sem impactar a lógica de negócio que consome este serviço.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 * @since 2026-03-31
 * @see AblyConnector
 */
public interface ChatPlatform {

    /**
     * Publica uma mensagem num canal de chat em tempo real.
     *
     * @param channel identificador do canal (ex.: booking-chat:123)
     * @param event   tipo de evento (ex.: new-message)
     * @param message payload a publicar (serializável)
     * @return true se publicado com sucesso, false caso contrário
     */
    boolean sendMessage(String channel, String event, Object message);

    /**
     * Gera um token de cliente com permissões restritas para um canal.
     *
     * @param userId    identidade do utilizador
     * @param channelId canal de destino
     * @return objeto token da plataforma ou null em falha
     */
    Object generateClientToken(String userId, String channelId);
}

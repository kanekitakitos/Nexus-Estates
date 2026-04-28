package com.nexus.estates.service.external.connectors;

import com.nexus.estates.dto.ExternalApiConfig;

import java.util.Optional;

/**
 * Contrato base para conectores de integrações externas.
 * <p>
 * Centraliza a forma como o sync-service executa chamadas HTTP e capacidades específicas
 * (ex.: publicação de mensagens em plataformas de chat) sem acoplar o domínio ao provider.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 */
public interface ChannelConnector {
    /**
     * Executa uma chamada HTTP resiliente com resposta tipada.
     *
     * @param config   configuração externa
     * @param payload  corpo da requisição
     * @param respType tipo esperado de resposta
     * @param <T>      tipo genérico
     * @return Optional com resposta ou vazio
     */
    <T> Optional<T> call(ExternalApiConfig config, Object payload, Class<T> respType);
    /**
     * Executa uma chamada HTTP resiliente sem corpo de resposta.
     *
     * @param config  configuração externa
     * @param payload corpo da requisição
     * @return true em sucesso; false caso contrário
     */
    boolean callBodiless(ExternalApiConfig config, Object payload);

    default boolean publishMessage(String channel, String event, Object message) {
        throw new UnsupportedOperationException("publishMessage não suportado");
    }

    default Object generateClientToken(String userId, String channelId) {
        throw new UnsupportedOperationException("generateClientToken não suportado");
    }
}

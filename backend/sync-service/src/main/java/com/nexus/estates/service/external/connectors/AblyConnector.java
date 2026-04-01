package com.nexus.estates.service.external.connectors;

import com.nexus.estates.dto.ExternalApiConfig;
import com.nexus.estates.service.chat.ChatPlatform;
import com.nexus.estates.service.external.ExternalSyncService;
import io.ably.lib.rest.AblyRest;
import io.ably.lib.rest.Auth.TokenParams;
import io.ably.lib.types.AblyException;
import io.ably.lib.types.Capability;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Conector de integração com Ably para chat em tempo real.
 * <p>
 * Implementa:
 * </p>
 * <ul>
 *     <li>Publicação de mensagens no Ably via API REST (usando resiliência).</li>
 *     <li>Geração de token de cliente com capacidades restritas (publish/subscribe).</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 * @see com.nexus.estates.config.AblyConfig
 * @see com.nexus.estates.service.external.ExternalSyncService
 */
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "ably.api.key")
public class AblyConnector implements ChannelConnector, ChatPlatform {

    private final ExternalSyncService externalSyncService;
    private final AblyRest ablyClient;

    @Value("${ably.api.key}")
    private String ablyApiKey;

    private static final String ABLY_BASE_URL = "https://rest.ably.io";

    @Override
    /**
     * Executa chamada HTTP resiliente com corpo de resposta usando a configuração fornecida.
     *
     * @param config   configuração externa (baseUrl, endpoint, auth)
     * @param payload  corpo da requisição
     * @param respType tipo de resposta esperada
     * @return Optional com resposta ou vazio em falha
     */
    public <T> Optional<T> call(ExternalApiConfig config, Object payload, Class<T> respType) {
        return externalSyncService.post(config, payload, respType);
    }

    @Override
    /**
     * Executa chamada HTTP resiliente sem corpo de resposta.
     *
     * @param config  configuração externa
     * @param payload corpo da requisição
     * @return true em sucesso; false em falha/fallback
     */
    public boolean callBodiless(ExternalApiConfig config, Object payload) {
        return externalSyncService.postWithoutResponse(config, payload);
    }

    @Override
    /**
     * Publica uma mensagem no canal Ably via REST.
     *
     * @param channel canal objetivo
     * @param event   nome do evento
     * @param message payload serializável
     * @return true se publicado
     */
    public boolean sendMessage(String channel, String event, Object message) {
        return publishMessage(channel, event, message);
    }

    @Override
    /**
     * Publica mensagem usando o endpoint oficial de mensagens do Ably.
     */
    public boolean publishMessage(String channel, String event, Object message) {
        String endpoint = String.format("/channels/%s/messages", channel);
        var payload = new AblyMessage(event, message);
        ExternalApiConfig config = ExternalApiConfig.builder()
                .baseUrl(ABLY_BASE_URL)
                .endpoint(endpoint)
                .authType(ExternalApiConfig.AuthType.BASIC)
                .credentials(ablyApiKey)
                .build();
        return externalSyncService.postWithoutResponse(config, payload);
    }

    @Override
    /**
     * Gera token de cliente com capacidades restritas para o canal.
     */
    public Object generateClientToken(String userId, String channelId) {
        try {
            TokenParams params = new TokenParams();
            params.clientId = userId;
            Capability capability = new Capability();
            capability.addResource(channelId, "publish", "subscribe");
            params.capability = capability.toString();
            return ablyClient.auth.requestToken(params, null);
        } catch (AblyException e) {
            return null;
        }
    }

    private record AblyMessage(String name, Object data) {}
}

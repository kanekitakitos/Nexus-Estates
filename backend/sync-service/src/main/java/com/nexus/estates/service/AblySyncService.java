package com.nexus.estates.service;

import com.nexus.estates.service.interfaces.ChatPlatform;
import com.nexus.estates.dto.ExternalApiConfig;
import io.ably.lib.rest.AblyRest;
import io.ably.lib.rest.Auth.TokenParams;
import io.ably.lib.types.AblyException;
import io.ably.lib.types.Capability;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Implementação concreta da interface {@link ChatPlatform} utilizando a plataforma Ably.
 * <p>
 * Esta classe é responsável por:
 * <ul>
 *     <li>Enviar mensagens em tempo real através da API REST do Ably, usando o {@link ExternalSyncService} para resiliência.</li>
 *     <li>Gerar tokens de autenticação seguros e com escopo definido para clientes frontend.</li>
 * </ul>
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 * @see ChatPlatform
 * @see ExternalSyncService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AblySyncService implements ChatPlatform {

    private final ExternalSyncService externalSyncService;
    private final AblyRest ablyClient;

    @Value("${ably.api.key}")
    private String ablyApiKey;

    private static final String ABLY_BASE_URL = "https://rest.ably.io";

    /**
     * Envia uma mensagem para um canal específico no Ably de forma resiliente.
     * <p>
     * Utiliza o {@code ExternalSyncService} para realizar a chamada HTTP REST
     * manual, garantindo que o Circuit Breaker protege o sistema contra falhas no Ably.
     * </p>
     *
     * @param channel O nome do canal onde publicar.
     * @param event   O nome do evento (ex: "message.received").
     * @param message O conteúdo da mensagem a ser enviado (JSON).
     * @return {@code true} se a mensagem foi enviada com sucesso; {@code false} caso contrário.
     */
    @Override
    public boolean sendMessage(String channel, String event, Object message) {
        // A API REST do Ably para publicar mensagens é:
        // POST https://rest.ably.io/channels/{channel_id}/messages
        String endpoint = String.format("/channels/%s/messages", channel);
        var payload = new AblyMessage(event, message);

        // Configura o acesso ao Ably usando a nova arquitetura flexível
        ExternalApiConfig config = ExternalApiConfig.builder()
                .baseUrl(ABLY_BASE_URL)
                .endpoint(endpoint)
                .authType(ExternalApiConfig.AuthType.BASIC)
                .credentials(ablyApiKey)
                .build();

        // Usa o serviço centralizado para garantir resiliência (Circuit Breaker/Retry)
        return externalSyncService.postWithoutResponse(config, payload);
    }

    /**
     * Gera um token de acesso temporário para um cliente se conectar ao Ably.
     * <p>
     * O token é configurado com as seguintes restrições de segurança:
     * <ul>
     *     <li><b>clientId:</b> Vinculado ao {@code userId} do nosso sistema para rastreabilidade.</li>
     *     <li><b>capability:</b> Permissões restritas para publicar e subscrever apenas no {@code channelId} fornecido.</li>
     * </ul>
     * Isso impede que um cliente mal-intencionado acesse ou publique em canais não autorizados.
     * </p>
     *
     * @param userId    O identificador único do usuário no sistema.
     * @param channelId O identificador do canal ao qual o usuário terá acesso.
     * @return Um objeto {@code TokenRequest} do Ably, que o frontend usará para se autenticar. Retorna {@code null} em caso de erro.
     */
    @Override
    public Object generateClientToken(String userId, String channelId) {
        try {
            // Configura os parâmetros do token
            TokenParams params = new TokenParams();
            params.clientId = userId; // Vincula a identidade do usuário

            // Define as permissões (capabilities) restritas ao canal específico
            Capability capability = new Capability();
            capability.addResource(channelId, "publish", "subscribe");
            params.capability = capability.toString();

            // Solicita o token ao Ably. O SDK lida com a assinatura criptográfica.
            return ablyClient.auth.requestToken(params, null);

        } catch (AblyException e) {
            log.error("Erro ao gerar token do Ably para o usuário {}: {}", userId, e.getMessage());
            // Em um cenário real, poderia lançar uma exceção customizada para melhor tratamento de erro.
            return null;
        }
    }

    /**
     * DTO interno para formatar a mensagem conforme esperado pela API do Ably.
     *
     * @param name Nome do evento no Ably.
     * @param data Conteúdo da mensagem.
     */
    private record AblyMessage(String name, Object data) {}
}

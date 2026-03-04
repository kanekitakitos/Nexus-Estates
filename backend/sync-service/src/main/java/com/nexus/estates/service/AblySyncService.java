package com.nexus.estates.service;

import com.nexus.estates.service.interfaces.ChatPlatform;
import io.ably.lib.rest.AblyRest;
import io.ably.lib.rest.Auth.TokenParams;
import io.ably.lib.types.AblyException;
import io.ably.lib.types.Capability;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
 * @version 1.1
 * @see ChatPlatform
 * @see ExternalSyncService
 * @see <a href="https://ably.com/docs/rest/messages#publish">Ably REST API - Publish Message</a>
 * @see <a href="https://ably.com/docs/core-features/authentication#token-authentication">Ably Token Authentication</a>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AblySyncService implements ChatPlatform {

    private final ExternalSyncService externalSyncService;
    private final AblyRest ablyClient; // Injetado a partir de AblyConfig

    @Override
    public boolean sendMessage(String channel, String event, Object message) {
        // A API REST do Ably para publicar mensagens é:
        // POST /channels/{channel_id}/messages
        // O corpo da mensagem deve ter "name" (evento) e "data" (mensagem).
        String uri = String.format("/channels/%s/messages", channel);
        var payload = new AblyMessage(event, message);

        // Usa o serviço genérico para fazer a chamada HTTP de forma resiliente
        return externalSyncService.postToExternalApi(uri, payload);
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
     */
    private record AblyMessage(String name, Object data) {}
}

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


    /**
     * Publica uma mensagem num canal em tempo real
     * <p>
     *     Esta operação é opcial e apenas suportada por conectores especializados
     *     em evento assíncronos e mensageria
     * </p>
     * @param channel O nome do canal de destino da mensagem
     * @param event O tipo ou nome do evento a publicar
     * @param message O payload da mensagem (o conteúdo a enviar)
     * @return {@coden true} se a publicação for processada com sucesso
     * @throws UnsupportedOperationException Se o conector que implementar esta interface foi apenas HTTP e não suportar pub/sub
     */
    default boolean publishMessage(String channel, String event, Object message) {
        throw new UnsupportedOperationException("publishMessage não suportado");
    }

    /**
     * Gera um token de autenticação de cliente para ligações diretas a plataformas externas
     * <p>
     *     Útil para devolver credenciais temporárias ao Frontend
     * </p>
     * @param userId O identificador do utilizador que solicita a ligação
     * @param channelId O identificador do canal a que o utilizador precisa de ter acesso
     * @return O token de autenticação (o formato exato depende do provider utilizado)
     * @throws UnsupportedOperationException Se o conector não tiver a capacidade de gerar tokens de cliente
     */
    default Object generateClientToken(String userId, String channelId) {
        throw new UnsupportedOperationException("generateClientToken não suportado");
    }
}

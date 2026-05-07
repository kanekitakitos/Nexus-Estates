package com.nexus.estates.service.external.connectors;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

/**
 * Factory de conectores para integrações externas.
 * <p>
 * Resolve conectores específicos (ex.: Ably) e disponibiliza um conector HTTP genérico para
 * APIs externas. Conectores opcionais são carregados apenas quando a configuração necessária
 * está presente (ex.: {@code ably.api.key}).
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 * @see AblyConnector
 * @see GenericHttpConnector
 */
@Component
@RequiredArgsConstructor
public class ChannelConnectorFactory {

    private final ObjectProvider<AblyConnector> ablyConnector;
    private final GenericHttpConnector genericHttpConnector;


    /**
     * Recupera a instância do conector especialista em Ably (Comunicações em Tempo Real)
     * <p>
     *     Utiliza o {@link ObjectProvider} para carregar o bean dinamicamente
     *     Desta forma o sistema não quebra durante o arranque caso as chaves da API não estejam configuradas
     * </p>
     * @return A isntância instanciada do {@code AblyConnector}
     * @throws IllegalStateException Se tentar solicitar o conector Ably num ambiente
     * onde a propriedade de configuração não foi definida
     */
    public ChannelConnector ably() {
        AblyConnector connector = ablyConnector.getIfAvailable();
        if (connector == null) {
            throw new IllegalStateException("AblyConnector indisponível. Configure a propriedade 'ably.api.key' para ativar Ably.");
        }
        return connector;
    }

    /**
     * Recupera o conector HTTP genérico
     * <p>
     *     Deve ser utilizado para integrações REST simples e padronizadas com sistemas de terceiros
     *     que não necessitam dde bibliotecas ou SDKs proprietários
     * </p>
     * @return A instância partilhada do {@code GenericHttpConnector}
     */
    public ChannelConnector generic() {
        return genericHttpConnector;
    }
}

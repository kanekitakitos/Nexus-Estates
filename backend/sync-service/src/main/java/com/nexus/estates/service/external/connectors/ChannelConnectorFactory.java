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

    public ChannelConnector ably() {
        AblyConnector connector = ablyConnector.getIfAvailable();
        if (connector == null) {
            throw new IllegalStateException("AblyConnector indisponível. Configure a propriedade 'ably.api.key' para ativar Ably.");
        }
        return connector;
    }

    public ChannelConnector generic() {
        return genericHttpConnector;
    }
}

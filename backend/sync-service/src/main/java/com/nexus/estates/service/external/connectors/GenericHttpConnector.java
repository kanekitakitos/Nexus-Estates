package com.nexus.estates.service.external.connectors;

import com.nexus.estates.dto.ExternalApiConfig;
import com.nexus.estates.service.external.ExternalSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Conector HTTP genérico para chamadas a APIs externas.
 * <p>
 * Encapsula o acesso ao {@link com.nexus.estates.service.external.ExternalSyncService} e expõe
 * um contrato estável para os serviços de domínio (ex.: sincronização de reservas) consumirem
 * sem depender de detalhes de HTTP/resiliência.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 */
@Component
@RequiredArgsConstructor
public class GenericHttpConnector implements ChannelConnector {

    private final ExternalSyncService externalSyncService;

    @Override
    /**
     * Executa POST resiliente esperando resposta.
     *
     * @param config   configuração externa
     * @param payload  corpo da requisição
     * @param respType tipo esperado
     * @return Optional com resposta ou vazio em falha
     */
    public <T> Optional<T> call(ExternalApiConfig config, Object payload, Class<T> respType) {
        return externalSyncService.post(config, payload, respType);
    }

    @Override
    /**
     * Executa POST resiliente sem resposta (bodiless).
     *
     * @param config  configuração externa
     * @param payload corpo da requisição
     * @return true em sucesso
     */
    public boolean callBodiless(ExternalApiConfig config, Object payload) {
        return externalSyncService.postWithoutResponse(config, payload);
    }
}

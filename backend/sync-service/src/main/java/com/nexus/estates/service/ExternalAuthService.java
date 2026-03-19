package com.nexus.estates.service;

import com.nexus.estates.dto.ExternalApiConfig;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * Serviço especializado na gestão de segurança e cabeçalhos para comunicações externas.
 * <p>
 * Atua como um componente auxiliar do {@code ExternalSyncService}, encapsulando a complexidade
 * de construir cabeçalhos de autenticação (Bearer, Basic, API Key) de forma segura.
 * </p>
 *
 * @author Nexus Estates Architect
 * @version 1.0
 */
@Service
public class ExternalAuthService {

    /**
     * Aplica os cabeçalhos de autenticação e headers customizados num objeto {@code HttpHeaders}.
     * <p>
     * Este método é chamado automaticamente durante o fluxo de uma requisição resiliente
     * para garantir que as credenciais são injetadas no formato esperado pelo fornecedor.
     * </p>
     *
     * @param headers O objeto de cabeçalhos do Spring que será modificado.
     * @param config  A configuração da API externa contendo o tipo de autenticação e credenciais.
     */
    public void applyAuthentication(HttpHeaders headers, ExternalApiConfig config) {
        // Primeiro aplicamos a autenticação
        if (config.authType() != null && config.authType() != ExternalApiConfig.AuthType.NONE) {
            switch (config.authType()) {
                case BEARER -> headers.setBearerAuth(config.credentials());
                case BASIC -> applyBasicAuth(headers, config.credentials());
                case API_KEY -> applyApiKey(headers, config);
                default -> {}
            }
        }

        // DEPOIS aplicamos os headers customizados (sempre, mesmo que authType seja NONE)
        if (config.customHeaders() != null) {
            config.customHeaders().forEach(headers::add);
        }
    }

    /**
     * Aplica autenticação HTTP Basic aos cabeçalhos.
     *
     * @param headers     O objeto de cabeçalhos a ser modificado.
     * @param credentials String no formato "utilizador:password" a ser codificada em Base64.
     */
    private void applyBasicAuth(HttpHeaders headers, String credentials) {
        if (credentials != null && !credentials.isBlank()) {
            String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
            headers.setBasicAuth(encoded);
        }
    }

    /**
     * Aplica uma API Key aos cabeçalhos da requisição.
     * <p>
     * Por defeito, utiliza o cabeçalho {@code X-API-Key}, a menos que um cabeçalho
     * com o mesmo nome já tenha sido definido nas configurações customizadas.
     * </p>
     *
     * @param headers O objeto de cabeçalhos a ser modificado.
     * @param config  A configuração da API contendo a chave.
     */
    private void applyApiKey(HttpHeaders headers, ExternalApiConfig config) {
        // Por padrão, assume que API Key vai no header X-API-Key se não houver custom headers
        if (config.customHeaders() == null || !config.customHeaders().containsKey("X-API-Key")) {
            headers.set("X-API-Key", config.credentials());
        }
    }
}

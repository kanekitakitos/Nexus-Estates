package com.nexus.estates.service.external;

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
 * @since 2026-03-31
 */
@Service
public class ExternalAuthService {

    /**
     * Aplica autenticação e headers customizados aos cabeçalhos HTTP.
     *
     * @param headers cabeçalhos a serem preenchidos
     * @param config  configuração da API externa (tipo de auth, credenciais, headers)
     */
    public void applyAuthentication(HttpHeaders headers, ExternalApiConfig config) {
        if (config.authType() != null && config.authType() != ExternalApiConfig.AuthType.NONE) {
            switch (config.authType()) {
                case BEARER -> headers.setBearerAuth(config.credentials());
                case BASIC -> applyBasicAuth(headers, config.credentials());
                case API_KEY -> applyApiKey(headers, config);
                default -> {}
            }
        }

        if (config.customHeaders() != null) {
            config.customHeaders().forEach(headers::add);
        }
    }

    /**
     * Aplica autenticação Basic (Base64 de user:pass).
     *
     * @param headers     cabeçalhos
     * @param credentials credenciais user:pass
     */
    private void applyBasicAuth(HttpHeaders headers, String credentials) {
        if (credentials != null && !credentials.isBlank()) {
            String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
            headers.setBasicAuth(encoded);
        }
    }

    /**
     * Aplica API Key num header padrão X-API-Key (se não customizado).
     *
     * @param headers cabeçalhos
     * @param config  configuração com chave
     */
    private void applyApiKey(HttpHeaders headers, ExternalApiConfig config) {
        if (config.customHeaders() == null || !config.customHeaders().containsKey("X-API-Key")) {
            headers.set("X-API-Key", config.credentials());
        }
    }
}

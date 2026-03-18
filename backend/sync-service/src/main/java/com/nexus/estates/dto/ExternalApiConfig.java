package com.nexus.estates.dto;

import lombok.Builder;
import java.util.Map;

/**
 * DTO que encapsula as configurações necessárias para interagir com qualquer API externa.
 * <p>
 * Este objeto é utilizado pelo {@code ExternalSyncService} para parametrizar chamadas HTTP
 * resilientes, permitindo configurar dinamicamente o endpoint, tipo de autenticação
 * e headers customizados sem necessidade de alterar o código de infraestrutura.
 * </p>
 *
 * @param baseUrl        URL base da API (ex: https://api.airbnb.com).
 * @param endpoint       Caminho relativo do recurso (ex: /v2/bookings).
 * @param authType       Estratégia de autenticação a aplicar (Bearer, Basic, API Key).
 * @param credentials    Credenciais necessárias (token, chave ou user:pass).
 * @param customHeaders  Mapa opcional de headers adicionais específicos da integração.
 *
 * @author Nexus Estates Architect
 * @version 1.0
 */
@Builder
public record ExternalApiConfig(
        String baseUrl,
        String endpoint,
        AuthType authType,
        String credentials,
        Map<String, String> customHeaders
) {
    /**
     * Define os tipos de autenticação suportados pelo sistema de integração.
     */
    public enum AuthType {
        /** Nenhuma autenticação necessária. */
        NONE,
        /** Autenticação via Token Bearer (OAuth 2.0). */
        BEARER,
        /** Autenticação HTTP Basic (Base64). */
        BASIC,
        /** Autenticação via API Key no Header. */
        API_KEY
    }
}

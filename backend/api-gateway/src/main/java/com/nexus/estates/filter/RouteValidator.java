package com.nexus.estates.filter;

import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

/**
 * Componente responsável por determinar se uma rota requer ou não autenticação.
 * <p>
 * Atua como um "Gatekeeper" lógico, mantendo uma lista de permissões (whitelist) para endpoints
 * que devem ser publicamente acessíveis sem necessidade de um token JWT válido.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Component
public class RouteValidator {

    /**
     * Lista imutável de padrões de URL que são considerados públicos (Open Endpoints).
     * <p>
     * Inclui:
     * <ul>
     *   <li>Endpoints de Autenticação (Login/Registo)</li>
     *   <li>Pesquisa pública de propriedades</li>
     *   <li>Documentação da API (Swagger/OpenAPI) - Futuro</li>
     * </ul>
     * </p>
     */
    public static final List<String> openApiEndpoints = List.of(
            "/api/v1/users/auth/register",
            "/api/v1/users/auth/login",
            "/api/v1/properties/search",
            "/swagger-ui",
            "/swagger-ui.html",
            "/v3/api-docs"
    );

    /**
     * Predicado funcional que avalia se um pedido HTTP requer segurança.
     * <p>
     * Retorna {@code true} se o caminho do pedido NÃO corresponder a nenhum dos
     * endpoints listados em {@link #openApiEndpoints}.
     * </p>
     */
    public Predicate<ServerHttpRequest> isSecured =
            request -> openApiEndpoints
                    .stream()
                    .noneMatch(uri -> request.getURI().getPath().contains(uri));
}

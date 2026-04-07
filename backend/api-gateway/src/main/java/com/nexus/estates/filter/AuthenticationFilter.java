package com.nexus.estates.filter;

import com.nexus.estates.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.core.env.Environment;

import java.util.Arrays;

/**
 * Filtro global de autenticação para o API Gateway.
 * <p>
 * Este componente interceta todos os pedidos HTTP de entrada e impõe a política de segurança:
 * <ol>
 *   <li>Verifica se a rota solicitada é segura (via {@link RouteValidator}).</li>
 *   <li>Valida a presença e formato do cabeçalho "Authorization".</li>
 *   <li>Valida a assinatura e validade do Token JWT (via {@link JwtUtil}).</li>
 * </ol>
 * </p>
 * <p>
 * <b>Nota:</b> Futuramente, este filtro será responsável por extrair o contexto do utilizador (ID, Roles)
 * e propagá-lo para os microserviços downstream através de cabeçalhos HTTP personalizados.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private RouteValidator validator;

    @Autowired
    private JwtUtil jwtUtil;


    @Autowired
    private Environment env; // Adicionado para detetar o profile

    /**
     * Classe de configuração para o filtro (Padrão Spring Cloud Gateway).
     * Pode ser expandida para aceitar parâmetros no application.yml.
     */
    public static class Config {
        // Configuração vazia por agora
    }

    /**
     * Construtor padrão que regista a classe de configuração.
     */
    public AuthenticationFilter() {
        super(Config.class);
    }

    /**
     * Aplica a lógica de filtragem ao pedido.
     *
     * @param config Configuração do filtro (atualmente vazia).
     * @return O {@link GatewayFilter} que executa a validação de segurança.
     * @throws RuntimeException Se o token for inválido, ausente ou expirado (Resulta em 401/403).
     */
    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            // Verifica se o profile "god-mode" está ativo
            boolean isGodMode = Arrays.asList(env.getActiveProfiles()).contains("god-mode");

            if (isGodMode) {
                // MODO GOD-MODE: Ignora JWT e injeta headers de OWNER/ADMIN
                var request = exchange.getRequest()
                        .mutate()
                        .header("X-User-Id", "1")
                        .header("X-User-Role", "OWNER") // Necessário para o @PreAuthorize dos controllers
                        .header("X-User-Email", "god-mode@nexus.com")
                        .header("X-Actor-UserId", "1") // Para a auditoria/logs que vimos no Hibernate
                        .build();
                return chain.filter(exchange.mutate().request(request).build());
            }

            // LÓGICA PADRÃO (Produção/Auth Real)
            if (validator.isSecured.test(exchange.getRequest())) {
                // ... lógica de verificação de cabeçalho "Authorization" e jwtUtil.validateToken ...

                // Exemplo de como ficaria a injeção após validação real:
                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }

                try {
                    jwtUtil.validateToken(authHeader);
                    var claims = jwtUtil.getAllClaimsFromToken(authHeader);
                    var request = exchange.getRequest()
                            .mutate()
                            .header("X-User-Id", String.valueOf(claims.get("userId")))
                            .header("X-User-Role", String.valueOf(claims.get("role")))
                            .header("X-User-Email", String.valueOf(claims.getSubject()))
                            .build();
                    return chain.filter(exchange.mutate().request(request).build());
                } catch (Exception e) {
                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                    return exchange.getResponse().setComplete();
                }
            }
            return chain.filter(exchange);
        });
    }

}

package com.nexus.estates.filter;

import com.nexus.estates.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;

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

            // 1. Verifica se a rota precisa de segurança (Whitelist check)
            if (validator.isSecured.test(exchange.getRequest())) {

                // 2. Verifica se o Header Authorization existe
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    throw new RuntimeException("Cabeçalho de autorização em falta");
                }

                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

                // Normalização: Remove o prefixo "Bearer " se existir
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
                    throw new RuntimeException("Acesso não autorizado: Token inválido");
                }
            }
            return chain.filter(exchange);
        });
    }

}

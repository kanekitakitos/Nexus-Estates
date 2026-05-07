package com.nexus.estates.filter;

import com.nexus.estates.util.JwtUtil;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para {@link AuthenticationFilter}.
 * <p>
 * Valida os três cenários documentados no TESTS.md:
 * <ul>
 *   <li>Rotas públicas passam sem validação JWT.</li>
 *   <li>Rotas seguras sem Authorization causam resposta 401.</li>
 *   <li>Rotas seguras com Bearer token válido são processadas.</li>
 * </ul>
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
class AuthenticationFilterTest {

    // ─── Constantes ──────────────────────────────────────────────────────────

    /** Chave Base64 de 32 bytes — mesma usada no JwtUtilTest para consistência. */
    private static final String SECRET = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=";

    // ─── Componentes ─────────────────────────────────────────────────────────

    private AuthenticationFilter filter;
    private RouteValidator routeValidator;
    private JwtUtil jwtUtil;
    private AuthenticationFilter.Config config;

    // ─── Setup ───────────────────────────────────────────────────────────────

    @BeforeEach
    void setUp() {
        // JwtUtil real, injectado com a secret via ReflectionTestUtils
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);

        // RouteValidator real — usa a lista estática de endpoints públicos
        routeValidator = new RouteValidator();

        // Filter com dependências reais (sem Spring context)
        filter = new AuthenticationFilter();
        ReflectionTestUtils.setField(filter, "validator", routeValidator);
        ReflectionTestUtils.setField(filter, "jwtUtil", jwtUtil);

        config = new AuthenticationFilter.Config();
    }

    // ─── Testes ──────────────────────────────────────────────────────────────

    /**
     * Verifica que pedidos para rotas públicas passam pelo filter sem validar JWT
     * e que a chain é executada.
     * <p>
     * Cenário: pedido para {@code /api/users/auth/login} (endpoint público).
     * Expectativa: o filtro não valida o token e delega para a chain normalmente.
     * </p>
     */
    @Test
    @DisplayName("shouldPassThroughWhenRouteIsNotSecured: rotas públicas passam sem validação JWT")
    void shouldPassThroughWhenRouteIsNotSecured() {
        // Arrange — pedido para endpoint público, sem token
        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/users/auth/login")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Chain mock que regista se foi chamada
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        // Act
        filter.apply(config).filter(exchange, chain).block();

        // Assert — a chain foi chamada (pedido passou sem ser bloqueado)
        verify(chain, times(1)).filter(any());
        // O status não deve ter sido alterado (não há 401)
        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    /**
     * Verifica que rotas seguras sem header Authorization causam RuntimeException.
     * <p>
     * Cenário: pedido para {@code /api/bookings} (endpoint seguro) sem o header
     * {@code Authorization}. O filtro deve definir o status 401 e completar a resposta.
     * </p>
     */
    @Test
    @DisplayName("shouldThrowExceptionWhenAuthHeaderIsMissingForSecuredRoute: 401 sem Authorization")
    void shouldThrowExceptionWhenAuthHeaderIsMissingForSecuredRoute() {
        // Arrange — pedido para rota segura, sem token
        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/bookings")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        // Act
        StepVerifier.create(filter.apply(config).filter(exchange, chain))
                .verifyComplete();

        // Assert — resposta deve ser 401 Unauthorized
        assertThat(exchange.getResponse().getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);

        // A chain não deve ter sido chamada — o pedido foi bloqueado
        verify(chain, never()).filter(any());
    }

    /**
     * Verifica que, com Bearer token presente, o token é validado e a request segue na chain.
     * <p>
     * Cenário: pedido para {@code /api/bookings} com um token JWT válido no header
     * {@code Authorization: Bearer <token>}. O filtro valida, extrai claims e
     * encaminha o pedido enriquecido com os headers X-User-*.
     * </p>
     */
    @Test
    @DisplayName("shouldValidateTokenWhenAuthHeaderIsPresent: token válido passa e chain é executada")
    void shouldValidateTokenWhenAuthHeaderIsPresent() {
        // Arrange — gerar token JWT válido com claims de utilizador
        String token = buildValidToken(Map.of("userId", 42L, "role", "OWNER"), "user@nexus.pt");

        MockServerHttpRequest request = MockServerHttpRequest
                .get("/api/bookings")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        // Act
        StepVerifier.create(filter.apply(config).filter(exchange, chain))
                .verifyComplete();

        // Assert — a chain foi chamada (token válido, pedido passou)
        verify(chain, times(1)).filter(any());

        // O status não deve ser 401 — o pedido não foi bloqueado
        assertThat(exchange.getResponse().getStatusCode())
                .isNotEqualTo(HttpStatus.UNAUTHORIZED);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Constrói um token JWT válido assinado com a mesma chave secreta configurada no filtro.
     *
     * @param claims Claims adicionais a incluir no payload.
     * @param subject Email/subject do utilizador.
     * @return String do token JWT compacto.
     */
    private String buildValidToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(new HashMap<>(claims))
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 30)) // 30 min
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Devolve a chave HMAC-SHA derivada da secret configurada.
     */
    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
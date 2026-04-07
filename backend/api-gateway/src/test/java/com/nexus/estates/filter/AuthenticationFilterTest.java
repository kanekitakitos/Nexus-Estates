package com.nexus.estates.filter;

import com.nexus.estates.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.util.ReflectionTestUtils;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationFilterTest {

    @Spy
    private RouteValidator routeValidator = new RouteValidator();

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private Environment env;

    @Mock
    private GatewayFilterChain filterChain;

    @InjectMocks
    private AuthenticationFilter authenticationFilter;

    @BeforeEach
    void setUp() {
        // As injecções do mock podem não acontecer de imediato no construtor do AbstractGatewayFilterFactory
        ReflectionTestUtils.setField(authenticationFilter, "env", env);
        ReflectionTestUtils.setField(authenticationFilter, "validator", routeValidator);
        ReflectionTestUtils.setField(authenticationFilter, "jwtUtil", jwtUtil);
    }

    @Test
    void shouldPassThroughWhenRouteIsNotSecured() {
        when(env.getActiveProfiles()).thenReturn(new String[]{"test"});

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/users/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        // Força o RouteValidator a considerar esta requisição como pública (não segura)
        routeValidator.isSecured = req -> false;

        when(filterChain.filter(exchange)).thenReturn(Mono.empty());

        authenticationFilter.apply(new AuthenticationFilter.Config()).filter(exchange, filterChain).block();

        verify(jwtUtil, never()).validateToken(anyString());
        verify(filterChain).filter(exchange);
    }

    @Test
    void shouldReturn401WhenAuthHeaderIsMissingForSecuredRoute() {
        when(env.getActiveProfiles()).thenReturn(new String[]{"test"});

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/bookings").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        routeValidator.isSecured = req -> true;

        authenticationFilter.apply(new AuthenticationFilter.Config()).filter(exchange, filterChain).block();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        verify(filterChain, never()).filter(any());
    }

    @Test
    void shouldValidateTokenWhenAuthHeaderIsPresent() {
        when(env.getActiveProfiles()).thenReturn(new String[]{"test"});

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/bookings")
                .header(HttpHeaders.AUTHORIZATION, "Bearer valid-token")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        routeValidator.isSecured = req -> true;
        when(filterChain.filter(any())).thenReturn(Mono.empty());
        doNothing().when(jwtUtil).validateToken("valid-token");
        io.jsonwebtoken.Claims claims = mock(io.jsonwebtoken.Claims.class);
        when(claims.get("userId")).thenReturn(java.util.UUID.randomUUID().toString());
        when(claims.get("role")).thenReturn("GUEST");
        when(claims.getSubject()).thenReturn("user@example.com");
        when(jwtUtil.getAllClaimsFromToken("valid-token")).thenReturn(claims);

        authenticationFilter.apply(new AuthenticationFilter.Config()).filter(exchange, filterChain).block();

        verify(jwtUtil).validateToken("valid-token");
        verify(filterChain).filter(any());
    }

    @Test
    void shouldBypassValidationWhenGodModeIsActive() {
        // Altera o environment para fingir que o god-mode está ativo
        when(env.getActiveProfiles()).thenReturn(new String[]{"god-mode", "test"});

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/bookings").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(filterChain.filter(any())).thenReturn(Mono.empty());

        authenticationFilter.apply(new AuthenticationFilter.Config()).filter(exchange, filterChain).block();

        // O filtro saltou a lógica real, logo, nunca devia usar o jwtUtil
        verify(jwtUtil, never()).validateToken(anyString());
        verify(filterChain).filter(any());
    }
}

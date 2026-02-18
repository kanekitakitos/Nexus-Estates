package com.nexus.estates.filter;

import com.nexus.estates.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationFilterTest {

    @Spy
    private RouteValidator routeValidator = new RouteValidator();

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private GatewayFilterChain filterChain;

    @InjectMocks
    private AuthenticationFilter authenticationFilter;

    @Test
    void shouldPassThroughWhenRouteIsNotSecured() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/users/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(filterChain.filter(exchange)).thenReturn(Mono.empty());

        authenticationFilter.apply(new AuthenticationFilter.Config()).filter(exchange, filterChain);

        verify(jwtUtil, never()).validateToken(anyString());
        verify(filterChain).filter(exchange);
    }

    @Test
    void shouldThrowExceptionWhenAuthHeaderIsMissingForSecuredRoute() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/bookings").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        assertThrows(RuntimeException.class, () -> 
            authenticationFilter.apply(new AuthenticationFilter.Config()).filter(exchange, filterChain)
        );
    }

    @Test
    void shouldValidateTokenWhenAuthHeaderIsPresent() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/bookings")
                .header(HttpHeaders.AUTHORIZATION, "Bearer valid-token")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(filterChain.filter(any())).thenReturn(Mono.empty());
        doNothing().when(jwtUtil).validateToken("valid-token");
        io.jsonwebtoken.Claims claims = mock(io.jsonwebtoken.Claims.class);
        when(claims.get("userId")).thenReturn(java.util.UUID.randomUUID().toString());
        when(claims.get("role")).thenReturn("GUEST");
        when(claims.getSubject()).thenReturn("user@example.com");
        when(jwtUtil.getAllClaimsFromToken("valid-token")).thenReturn(claims);

        authenticationFilter.apply(new AuthenticationFilter.Config()).filter(exchange, filterChain);

        verify(jwtUtil).validateToken("valid-token");
        verify(filterChain).filter(any());
    }
}

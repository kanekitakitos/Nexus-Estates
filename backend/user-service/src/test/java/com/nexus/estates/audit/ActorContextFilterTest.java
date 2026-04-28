package com.nexus.estates.audit;

import com.nexus.estates.entity.User;
import com.nexus.estates.entity.UserRole;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActorContextFilterTest {
    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpServletResponse response;
    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setup() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
        ActorContext.clear();
    }

    @Test
    void setsActorContextFromGatewayHeaders() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn("55");
        when(request.getHeader("X-Actor-UserId")).thenReturn(null);
        when(request.getHeader("X-User-Email")).thenReturn("actor@nexus.com");

        doAnswer(invocation -> {
            var actor = ActorContext.get().orElseThrow();
            assertEquals(55L, actor.userId());
            assertEquals("actor@nexus.com", actor.email());
            return null;
        }).when(filterChain).doFilter(any(), any());

        new ActorContextFilter().doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertTrue(ActorContext.get().isEmpty());
    }

    @Test
    void fallsBackToSecurityContextWhenHeadersMissing() throws Exception {
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-Actor-UserId")).thenReturn(null);
        when(request.getHeader("X-User-Email")).thenReturn(null);

        User principal = User.builder()
                .id(77L)
                .email("principal@nexus.com")
                .password("x")
                .role(UserRole.ADMIN)
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, java.util.List.of())
        );

        doAnswer(invocation -> {
            var actor = ActorContext.get().orElseThrow();
            assertEquals(77L, actor.userId());
            assertEquals("principal@nexus.com", actor.email());
            return null;
        }).when(filterChain).doFilter(any(), any());

        new ActorContextFilter().doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertTrue(ActorContext.get().isEmpty());
    }
}


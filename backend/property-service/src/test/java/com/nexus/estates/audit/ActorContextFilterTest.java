package com.nexus.estates.audit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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

    @AfterEach
    void cleanup() {
        ActorContext.clear();
    }

    @Test
    void setsActorContextFromHeadersDuringRequestAndClearsAfter() throws Exception {
        when(request.getHeader("X-Actor-UserId")).thenReturn("123");
        when(request.getHeader("X-User-Id")).thenReturn(null);
        when(request.getHeader("X-User-Email")).thenReturn("actor@nexus.com");

        doAnswer(invocation -> {
            var actor = ActorContext.get().orElseThrow();
            assertEquals(123L, actor.userId());
            assertEquals("actor@nexus.com", actor.email());
            return null;
        }).when(filterChain).doFilter(any(), any());

        new ActorContextFilter().doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertTrue(ActorContext.get().isEmpty());
    }
}


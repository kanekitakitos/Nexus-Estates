package com.nexus.estates.audit;

import com.nexus.estates.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ActorContextFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            Long actorUserId = parseLong(firstNonBlank(
                    request.getHeader("X-User-Id"),
                    request.getHeader("X-Actor-UserId")
            ));
            String actorEmail = blankToNull(request.getHeader("X-User-Email"));

            if (actorUserId == null || actorEmail == null) {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                Object principal = auth != null ? auth.getPrincipal() : null;
                if (principal instanceof User user) {
                    if (actorUserId == null) actorUserId = user.getId();
                    if (actorEmail == null) actorEmail = user.getEmail();
                }
            }

            ActorContext.set(new ActorContext.Actor(actorUserId, actorEmail));
            filterChain.doFilter(request, response);
        } finally {
            ActorContext.clear();
        }
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }

    private static Long parseLong(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Long.parseLong(value);
        } catch (Exception ignored) {
            return null;
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}

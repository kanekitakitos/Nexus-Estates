package com.nexus.estates.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Filtro responsável por ler os cabeçalhos injetados pelo API Gateway
 * e preencher o SecurityContext do Spring Security.
 */
@Component
public class GatewayHeaderFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Extrair os cabeçalhos enviados pelo Gateway (seja via JWT real ou God-Mode)
        String userId = request.getHeader("X-User-Id");
        String roles = request.getHeader("X-User-Role");
        String email = request.getHeader("X-User-Email");

        if (userId != null && roles != null) {
            // 2. Converter a string de roles (ex: "OWNER,ADMIN") em autoridades do Spring
            List<SimpleGrantedAuthority> authorities = Arrays.stream(roles.split(","))
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.trim()))
                    .collect(Collectors.toList());

            // 3. Criar o objeto de autenticação
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(email != null ? email : userId, null, authorities);

            // 4. Preencher o contexto de segurança
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}
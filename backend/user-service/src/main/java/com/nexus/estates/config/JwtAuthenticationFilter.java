package com.nexus.estates.config;

import com.nexus.estates.entity.UserRole;
import com.nexus.estates.repository.UserRepository;
import com.nexus.estates.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Filtro de autenticação JWT que interceta cada pedido HTTP.
 * <p>
 *     Este filtro tem duas responsabilidades principais:
 *     <ol>
 *         <li>Validar o token JWT presente no cabeçalho "Authorization".</li>
 *         <li>Processar o cabeçalho "X-User-Role" injetado pelo Gateway para definir as autoridades do utilizador.</li>
 *     </ol>
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain ) throws ServletException, IOException {

        // 1. Tenta apanhar o cabeçalho "Authorization"
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;
        final String roleHeader = request.getHeader("X-User-Role"); // Cabeçalho injetado pelo Gateway

        // 2. Verifica se o cabeçalho existe e começa por "Bearer "
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            jwt = authHeader.substring(7);
            userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                var userDetails = userRepository.findByEmail(userEmail).orElse(null);

                if (userDetails != null && jwtService.isTokenValid(jwt, userDetails.getEmail())) {
                    
                    // Determinar as autoridades (roles)
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    
                    // Se o Gateway enviou o role, usamos esse (confiança no Gateway)
                    if (roleHeader != null && !roleHeader.isEmpty()) {
                        // O Spring Security espera o prefixo "ROLE_" por convenção para hasRole()
                        String roleName = roleHeader.toUpperCase();
                        if (!roleName.startsWith("ROLE_")) {
                            roleName = "ROLE_" + roleName;
                        }
                        authorities.add(new SimpleGrantedAuthority(roleName));
                    } else {
                        // Fallback: usa o role da base de dados se o header não vier
                        String dbRole = userDetails.getRole().name();
                         if (!dbRole.startsWith("ROLE_")) {
                            dbRole = "ROLE_" + dbRole;
                        }
                        authorities.add(new SimpleGrantedAuthority(dbRole));
                    }

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception ex) {
            // Em caso de erro no token, não autentica, mas deixa o filtro seguir (o SecurityConfig vai barrar se necessário)
            // Opcionalmente, pode-se retornar 401 aqui se quiser ser estrito.
            // response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
             filterChain.doFilter(request, response);
        }
    }
}

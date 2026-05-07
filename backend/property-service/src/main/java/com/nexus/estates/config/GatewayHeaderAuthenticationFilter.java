package com.nexus.estates.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro de segurança personalizado que realiza a autenticação baseada em cabeçalhos
 * <p>
 *     Como este microserviço reside atrás de um API gateway, ele não valida passwords
 *     Em vez disso, estw filtro confia nos cabeçalhos {@code X-Actor-UserId} e {@code X-User-roles}
 *     injetados pelo Gateway após a validação do JWT original
 * </p>
 * @author Nexus Estates Team
 * @version 1.0
 */
@Component
public class GatewayHeaderAuthenticationFilter extends OncePerRequestFilter {


    /**
     * Executa a lógica de extração de identidade e roles para cada pedido HTTP
     * <p>
     *     Se os cabeçalhos necessários estiverem presentes, cria um {@link UsernamePasswordAuthenticationToken}
     *     e coloca-o no contexto de segurança do Spring
     * </p>
     * @param request O pedido HTTP
     * @param response A resposta HTTP
     * @param filterChain A cadeia de filtros
     * @throws ServletException Caso ocorra um erro no processamento
     * @throws IOException Caso ocorra um erro de input/output
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String email = request.getHeader("X-User-Email");
            String role = request.getHeader("X-User-Role");

            if (email != null && !email.isBlank()) {
                String roleName = role == null ? null : role.trim().toUpperCase();
                if (roleName != null && !roleName.isEmpty() && !roleName.startsWith("ROLE_")) {
                    roleName = "ROLE_" + roleName;
                }

                List<SimpleGrantedAuthority> authorities = roleName == null || roleName.isBlank()
                        ? List.of()
                        : List.of(new SimpleGrantedAuthority(roleName));

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email,
                        null,
                        authorities
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}


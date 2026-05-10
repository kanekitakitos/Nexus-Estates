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

/**
 * Filtro HTTP de prioridade máxima responsável por inicializar a identidade do utilizador (Ator)
 * <p>
 *     Interceta todos os pedidos de entrada e tenta extrair o utilizador ativo através
 *     de cabeçalhos HTTP injetados (ex: por uma API Gateway) ou, em alternativa como fallback
 *     através do contexto de segurança do Spring ({@link SecurityContextHolder})
 *     O filtro armazena estes dados no {@link ActorContext} e garante a sua limpeza no final
 *
 * @author Nexus Estates Team
 * @version 1.0
 * </p>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ActorContextFilter extends OncePerRequestFilter {

    /**
     * Executa a lógica de interceção, extração e injeção do Ator por cada pedido HTTP
     * @param request O pedido HTTP de entrada
     * @param response A resposta HTTP de saída
     * @param filterChain A cadeia de filtros seguinte
     * @throws ServletException Em caso de erro interno de processamento dos servlets
     * @throws IOException Em caso de erro na leitura ou escrita da resposta
     */
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


    /**
     * Método auxiliar para devolver a primeira String não nula e não vazia
     * @param a Primeira opção
     * @param b Segunda opção
     * @return O valor válido encontrado ou nulo
     */
    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }


    /**
     * Método auxiliar para converter uma String num Long de forma segura (sem lançar exceções)
     * @param value A string a converter
     * @return O valor numérico ou nulo se for inválido/vazio
     */
    private static Long parseLong(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Long.parseLong(value);
        } catch (Exception ignored) {
            return null;
        }
    }

    /**
     * Método auxiliar para normalizar Strings em branco para valores efetivamente nulos
     * @param value A string a avaliar
     * @return A própria string ou nulo
     */
    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}

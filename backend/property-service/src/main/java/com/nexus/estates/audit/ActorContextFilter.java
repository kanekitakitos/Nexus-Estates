package com.nexus.estates.audit;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro HTTP responsável por extrair a identidade do utilizador dos cabeçalhos do Gateway
 * <p>
 *     Este filtro interceta todos os pedidos e procura pelo cabeçalho {@code X-Actor-UserId}
 *     Caso encontre, regista-o no {@link ActorContext} para que a auditoria possa identificar
 *     o autor das alterações na base de dados
 * </p>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ActorContextFilter extends OncePerRequestFilter {

    /**
     * Interceta o pedido HTTP para extrair os cabeçalhos de identidade e injetálos no contexto
     * @param request O pedido HTTP recebido
     * @param response A resposta HTTP a ser enviada
     * @param filterChain A cadeia de filtros de segurança do Spring
     * @throws ServletException Se ocorrer um erro durante o processamento do filtro
     * @throws IOException Se ocorrer um erro de entrada/saída
     */
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            Long actorUserId = parseLong(firstNonBlank(
                    request.getHeader("X-Actor-UserId"),
                    request.getHeader("X-User-Id")
            ));
            String actorEmail = blankToNull(request.getHeader("X-User-Email"));
            ActorContext.set(new ActorContext.Actor(actorUserId, actorEmail));
            filterChain.doFilter(request, response);
        } finally {
            ActorContext.clear();
        }
    }

    /**
     * Retorna o primeiro valor de cabeçalho que não seja nulo nem em branco
     */
    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }

    /**
     * Converte um string de texto num Long de forma segura, ignorando exceções de formatação
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
     * Converte um string vazia ou apenas com espaços, para nulo
     */
    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}

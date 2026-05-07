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
 * Filtro HTTP responsável por capturar a identidade do utilizador para fins de auditoria
 * <p>
 *     O filtro tenta extrair o ID e email do utilizador através dos seguintes passos:
 *     <ol>
 *         <li>
 *             Lê os cabeçalhos {@code X-User-Id} ou {@code X-Actor-UserId} enviados pelo Gateway
 *         </li>
 *         <li>
 *             Caso falhe, tenta ovter a informação do {@link SecurityContextHolder} [Spring Security)
 *         </li>
 *         <li>
 *             Regista a identidade no {@link ActorContext} e garante a limpeza no final do pedido
 *         </li>
 *     </ol>
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ActorContextFilter extends OncePerRequestFilter {

    /**
     * Interceta o pedido HTTP para extrair a identidade do utilizador e injetá-la no contexto da thread
     * @param request O pedido HTTP recebido
     * @param response A resposta HTTP a ser enviada
     * @param filterChain A cadeia de filtros de segurança do Spring
     * @throws ServletException Se ocorrer um erro interno durante o processamento do filtro
     * @throws IOException Se ocorrer um erro de entrada/saída de dados
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
     * Retorna o primeiro valor de cabeçalho que nao seja nulo nem em branco
     * @param a O primeiro valor a verificar (prioritário)
     * @param b O segundo valor a verificar (fallback)
     * @return O primeiro valor válido encontrado, ou null se ambos forem inválidos
     */
    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }

    /**
     * Converte uma string de texto num Long de forma segura
     * <p>
     *     Evita que a aplicação lance exceções (como @code NumberFormatException})
     *     caso o cabeçalho venha corrompido ou mal formatado
     * </p>
     * @param value A string a converter
     * @return O valor numérico Long, ou null caso a conversão falhe
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
     * Converte uma string vazia ou apenas com espaços em branco num valor nulo real
     * @param value A string a avaliar
     * @return A string original limpa, ou null se estiver estruturalmente vazia
     */
    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}

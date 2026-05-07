package com.nexus.estates.audit;

import java.util.Optional;

/**
 * Utilitário para gestão do contexto do ator (utilizador) na thread atual
 * <p>
 *     Utiliza {@link ThreadLocal} para armazenar o identificador e o email do utilizador que
 *     iniciou o pedido, permitindo o acesso seguro a esta informação em qualquer camada do
 *     microserviço sem necessidade de a passar como parâmetro
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public final class ActorContext {
    private static final ThreadLocal<Actor> CURRENT = new ThreadLocal<>();

    private ActorContext() {
    }

    /**
     * Define o ator (utilizador) ativo para a thread atual
     * @param actor O objeto contendo a identidade do utilizador
     */
    public static void set(Actor actor) {
        CURRENT.set(actor);
    }

    /**
     * Recupera o ator atualmente registado no contexto da thread
     * @return Um {@link Optional} contendo o ator, ou vazio caso nenhum ator tenha sido definido
     */
    public static Optional<Actor> get() {
        return Optional.ofNullable(CURRENT.get());
    }

    /**
     * Limpa o contexto da thread atual
     * <p>
     *     É fundamental invocar este método no final de cada pedido HTTP para evitar
     *     memory leaks e contaminação de contexto entre pedidos diferentes
     * </p>
     */
    public static void clear() {
        CURRENT.remove();
    }

    /**
     * Registo que encapsula a identidade do utilizador (ator)
     * @param userId O identificador único do utilizador
     * @param email O endereço de email do utilizador
     */
    public record Actor(Long userId, String email) {
    }
}

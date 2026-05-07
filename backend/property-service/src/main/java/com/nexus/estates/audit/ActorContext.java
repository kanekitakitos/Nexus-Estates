package com.nexus.estates.audit;

import java.util.Optional;

/**
 * Utilitário para gestão do contexto do ator (utilizador) ma thread atual
 * <p>
 *     Utiliza {@link ThreadLocal} para armazenar o identificador do utilizador que iniciou
 *     o pedido, permitindo que esta informação seja acedida de forma segura em qualquer camada
 *     do microserviço (Service, Repository, Audit) sem necessidade de a passar explicitamente como parâmetro
 * </p>
 * @author Nexus Estates Team
 * @version 1.0
 */
public final class ActorContext {
    private static final ThreadLocal<Actor> CURRENT = new ThreadLocal<>();

    private ActorContext() {
    }

    /**
     * Define o ator (utilziadro) ativo para a thread atual
     * @param actor O objeto contendo as informações de identidade do utilizador
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
     *     É crítico invocar este método no final de cada processamento de pedido HTTP
     *     (geralmente um bloco finally) para evitar memory leaks e o vazamento de contexto
     *     entre pedidos, uma vez que os servidores aplicacionais reutilizam threads (Thread Pools)
     * </p>
     */
    public static void clear() {
        CURRENT.remove();
    }

    /**
     * Registo que encapsula a identidade do utilizador que está a executar a ação
     * @param userId O identificador único do utilizador
     * @param email O enderço de email do utilizador
     */
    public record Actor(Long userId, String email) {
    }
}

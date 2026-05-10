package com.nexus.estates.audit;

import java.util.Optional;


/**
 * Contexto de execução local à thread (ThreadLocal) para armazenar o Ator (utilizador) atual
 * <p>
 *     Permite que as informações sobre o utilizador que desencadeou a ação (ID e email)
 *     sejam acedidas em qualquer camada da aplicação de forma transparente, sem necessidade
 *     de passar estes dados nos parâmetros dos métodos. É crucial para injetar a identidade
 *     em eventos de auditoria (Hibernate Envers) na camada de persistência
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
public final class ActorContext {

    /**
     * Contentor isolado por thread que guarda o ator atual
     * Garante que diferentes pedidos HTTP processados em simultâneo não misturam identidades
     */
    private static final ThreadLocal<Actor> CURRENT = new ThreadLocal<>();

    /**
     * Construtor privado para evitar a instanciação desta classe utilitária
     */
    private ActorContext() {
    }

    /**
     * Define o ator para a thread atual
     * @param actor O registo contendo o ID e o email do utilizador
     */
    public static void set(Actor actor) {
        CURRENT.set(actor);
    }

    /**
     * ecupera o ator associado à thread atual de forma segura
     * @return Um {@link Optional} contendo o ator, ou vazio se não houver contexto de utilizador
     */
    public static Optional<Actor> get() {
        return Optional.ofNullable(CURRENT.get());
    }


    /**
     * Limpa explicitamente o contexto da thread atual
     */
    public static void clear() {
        CURRENT.remove();
    }


    /**
     * Registo (Record) imutável que representa a identidade básica de um utilizador (Ator)
     * @param userId O identificador único do utilizador
     * @param email O endereço de e-mail do utilizador
     */
    public record Actor(Long userId, String email) {
    }
}

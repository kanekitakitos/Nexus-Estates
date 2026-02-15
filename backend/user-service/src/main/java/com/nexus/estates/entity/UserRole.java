package com.nexus.estates.entity;

/**
 * Enumeração que define os niveis de acesso e responsabilidade dentro do ecossistema Nexus Estates.
 * <p>
 *     Esta enumeração é central para o mecanismo de Autorização (RBAC - Role-Based Access Control).
 *     Cada valor representa um perfil de utilizador distinto com permissões específicas.
 * </p>
 *
 * <ul>
 *     <li>{@link #GUEST} - Utilizador final (consumidor).</li>
 *     <li>{@link #OWNER} - Parceiro de negócio (fornecedor).</li>
 *     <li>{@link #ADMIN} - Gestão da plataforma.</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 */

public enum UserRole {

    /**
     * Utilizador comum da plataforma.
     * <p>
     *     <b>Permissões:</b>
     *     <ul>
     *         <li>Pesquisar imóveis.</li>
     *         <li>Efetuar reservas.</li>
     *         <li>Gerir o próprio perfil.</li>
     *     </ul>
     * </p>
     */
    GUEST,

    /**
     * Proprietário de imóveis ou gestor de propriedades.
     * <p>
     *     <b>Permissões:</b>
     *     <ul>
     *         <li>Todas as permissões de {@code GUEST}</li>
     *         <li>Adicionar e editar propriedades.</li>
     *         <li>Gerir disponibilidade e preços.</li>
     *         <li>Visualizar relatórios de ocupação.</li>
     *     </ul>
     * </p>
     */
    OWNER,

    /**
     * Administrador do sistema (Super-User):.
     * <p>
     *     <b>Permissões:</b>
     *     <ul>
     *         <li>Acesso total irrestrito a todos os recursos.</li>
     *         <li>Gestão de utilizadores (banir/bloquear).</li>
     *         <li>Configurações globais da plataforma.</li>
     *     </ul>
     * </p>
     */
    ADMIN
}

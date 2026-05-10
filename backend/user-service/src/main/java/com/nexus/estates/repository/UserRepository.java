package com.nexus.estates.repository;

import com.nexus.estates.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Interface de repositório para acesso aos dados da entidade {@link User}.
 * <p>
 *     Estende {@link JpaRepository} para fornecer operações CRUD (Create, Read, Update, Delete)
 *     padrão, paginação e ordenação sem necessidade de implementação manual.
 * </p>
 *
 * <p>
 *     <b>Funcionalidades Automáticas:</b>
 * </p>
 *      <ul>
 *          <li>{@code save(User)} - Persistência e atualização.</li>
 *          <li>{@code findById(Long)} - Recuperação por chave primária.</li>
 *          <li>{@code findAll()} - Listagem completa.</li>
 *      </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 * @see org.springframework.data.jpa.repository.JpaRepository
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Procura um utilizador através do seu enderço de email
     * <p>
     *     Utilizado primordialmente nos fluxos de autenticação nativa (login), processos de
     *     recuperação de password e validação de unicidade de contas no registo
     * </p>
     * @param email O email exato do utilizador a pesquisar (case-sensitive ou insensitive dependendo do Dialeto SQL)
     * @return Um {@link Optional} contendo o utilizador correspondente, se este exisitir na base de dados
     */
    Optional<User> findByEmail(String email);


    /**
     * Procura um utilizador através do seu identificador no provedor de identidade externo (Clerk)
     * <p>
     *     Este método é fundamental para os fluxos de Single Sign-On (SSO)
     *     Permite sincronizar e recuperar a conta interna do Nexus Estates associada á sessão externa gerida pelo Clerk
     * </p>
     * @param clerkUserId O ID único alfanumérico atribuído ao utilizador pela plataforma Clerk
     * @return Um {@link Optional} contendo o utilizador correspondente, se este já tiver efetuado a integração/registo
     */
    Optional<User> findByClerkUserId(String clerkUserId);
}

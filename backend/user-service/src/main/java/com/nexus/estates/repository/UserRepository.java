package com.nexus.estates.repository;

import com.nexus.estates.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

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
 *          <li>{@code findaById(UUID} - Recuperação por chave primária.</li>
 *          <li>{@code findAll()} - Listagem completa.</li>
 *      </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 * @see org.springframework.data.jpa.repository.JpaRepository
 */

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

}

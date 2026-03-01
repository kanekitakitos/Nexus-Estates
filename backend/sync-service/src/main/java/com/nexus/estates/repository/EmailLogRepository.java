package com.nexus.estates.repository;

import com.nexus.estates.entity.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório JPA para a entidade {@link EmailLog}.
 *
 * <p>Fornece métodos padrão para operações CRUD (Create, Read, Update, Delete)
 * sobre a tabela de logs de email, permitindo a persistência e consulta
 * do histórico de comunicações.</p>
 *
 * @author Nexus Estates Team
 */
@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {
}
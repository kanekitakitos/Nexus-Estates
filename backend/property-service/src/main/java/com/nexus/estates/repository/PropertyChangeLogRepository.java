package com.nexus.estates.repository;

import com.nexus.estates.entity.PropertyChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Repositório Spring Data JPA para a entidade {@link PropertyChangeLog}
 * <p>
 *     Fornece os métodos de acesso á base de dados para consultar o histórico de auditoria
 *     e alterações de negócio efetuadas numa propriedade específica
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Repository
public interface PropertyChangeLogRepository extends JpaRepository<PropertyChangeLog, Long> {

    /**
     * Recupera todo o histórico de alterações de uma propriedade, ordenado da modificação
     * mais recente para a mais antiga (ordem cronológica inversa)
     * @param propertyId O identificador único do imóvel auditado
     * @return Lista de registos de alterações cronologicamente invertida
     */
    List<PropertyChangeLog> findByPropertyIdOrderByChangedAtDesc(Long propertyId);
}

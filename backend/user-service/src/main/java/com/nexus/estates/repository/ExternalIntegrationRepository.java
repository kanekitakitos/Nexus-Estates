package com.nexus.estates.repository;

import com.nexus.estates.entity.ExternalIntegration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
/**
 * Repositório JPA para integrações externas de utilizadores.
 * <p>
 * Fornece operações de leitura por utilizador e validação de pertença.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 */
public interface ExternalIntegrationRepository extends JpaRepository<ExternalIntegration, Long> {
    /**
     * Lista integrações por identificador do utilizador.
     *
     * @param userId id do utilizador
     * @return lista de integrações
     */
    List<ExternalIntegration> findByUserId(Long userId);
    /**
     * Obtém uma integração específica pertencente ao utilizador.
     *
     * @param id id da integração
     * @param userId id do utilizador
     * @return integração se encontrada
     */
    Optional<ExternalIntegration> findByIdAndUserId(Long id, Long userId);
}

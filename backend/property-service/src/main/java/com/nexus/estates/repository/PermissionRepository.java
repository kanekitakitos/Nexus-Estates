package com.nexus.estates.repository;

import com.nexus.estates.entity.PropertyPermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.nexus.estates.entity.AccessLevel;


/**
 * Interface de repositório para a entidade {@link PropertyPermission}.
 *
 * <p>Responsável pela persistência e consulta das permissões de acesso
 * que ligam utilizadores a propriedades específicas.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-12
 */
public interface PermissionRepository extends JpaRepository<PropertyPermission, Long> {
    /**
     * Lista todas as permissões associadas a um utilizador.
     */
    List<PropertyPermission> findByUserId(Long userId);

    /**
     * Lista todas as permissões associadas a uma propriedade.
     */
    List<PropertyPermission> findByPropertyId(Long propertyId);

    /**
     * Resolve a permissão de um utilizador numa propriedade específica (se existir).
     */
    Optional<PropertyPermission> findFirstByPropertyIdAndUserId(Long propertyId, Long userId);

    /**
     * Resolve a permissão (por nível) de uma propriedade, útil para obter o PRIMARY_OWNER.
     */
    Optional<PropertyPermission> findFirstByPropertyIdAndAccessLevel(Long propertyId, AccessLevel accessLevel);
}

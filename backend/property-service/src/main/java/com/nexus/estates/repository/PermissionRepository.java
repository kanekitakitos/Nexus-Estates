package com.nexus.estates.repository;

import com.nexus.estates.entity.PropertyPermission;
import org.springframework.data.jpa.repository.JpaRepository;


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
}
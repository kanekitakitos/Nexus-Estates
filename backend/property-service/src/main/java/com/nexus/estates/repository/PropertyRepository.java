package com.nexus.estates.repository;

import com.nexus.estates.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;


/**
 * Interface de repositório para a entidade {@link Property}.
 *
 * <p>Gere todas as operações de base de dados relacionadas com os imóveis,
 * utilizando {@code UUID} como tipo de identificador primário.</p>
 *
 * @author Nexus Estates Team
 */
public interface PropertyRepository extends JpaRepository<Property, Long> {
}
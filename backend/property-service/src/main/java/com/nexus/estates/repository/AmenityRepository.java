package com.nexus.estates.repository;

import com.nexus.estates.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;


/**
 * Interface de repositório para a entidade {@link Amenity}.
 *
 * <p>Esta interface abstrai o acesso à base de dados, fornecendo métodos
 * padrão para operações de CRUD (Create, Read, Update, Delete) através do Spring Data JPA.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-12
 */
public interface AmenityRepository extends JpaRepository<Amenity, Long> {
}
package com.nexus.estates.repository;

import com.nexus.estates.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Interface de repositório para a entidade {@link Property}.
 *
 * <p>Gere todas as operações de base de dados relacionadas com os imóveis,
 * utilizando {@code Long} como tipo de identificador primário.</p>
 *
 * @author Nexus Estates Team
 */
@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    @Query("SELECT DISTINCT p FROM Property p LEFT JOIN FETCH p.amenities")
    List<Property> findAllWithAmenities();

    @Query(value = "SELECT DISTINCT p FROM Property p " +
                    "LEFT JOIN FETCH p.amenities " +
                    "LEFT JOIN FETCH p.propertyRule " +
                    "LEFT JOIN FETCH p.seasonalityRules " +
                    "WHERE p.id = :id")
    Optional<Property> findExpandedById(@Param("id") Long id);

    /**
     * Carrega uma propriedade sob lock pessimista de escrita.
     *
     * <p>Usado em operações de atualização concorrente (ex.: regras, sazonalidade, permissões),
     * evitando condições de corrida quando múltiplos utilizadores (PRIMARY_OWNER/MANAGER)
     * alteram o mesmo ativo em paralelo.</p>
     *
     * @param id ID da propriedade
     * @return propriedade, caso exista
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Property p WHERE p.id = :id")
    Optional<Property> findByIdForUpdate(@Param("id") Long id);

    @Query(
            value = "SELECT p FROM Property p " +
                    "WHERE p.id IN :ids " +
                    "AND (:city IS NULL OR LOWER(CAST(p.city AS string)) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%'))) " +
                    "AND (:isActive IS NULL OR p.isActive = :isActive) " +
                    "AND (:minPrice IS NULL OR p.basePrice >= :minPrice) " +
                    "AND (:maxPrice IS NULL OR p.basePrice <= :maxPrice)",
            countQuery = "SELECT COUNT(p) FROM Property p " +
                    "WHERE p.id IN :ids " +
                    "AND (:city IS NULL OR LOWER(CAST(p.city AS string)) LIKE LOWER(CONCAT('%', CAST(:city AS string), '%'))) " +
                    "AND (:isActive IS NULL OR p.isActive = :isActive) " +
                    "AND (:minPrice IS NULL OR p.basePrice >= :minPrice) " +
                    "AND (:maxPrice IS NULL OR p.basePrice <= :maxPrice)"
    )
    org.springframework.data.domain.Page<Property> findByIdsWithFilters(
            @Param("ids") java.util.Collection<Long> ids,
            @Param("city") String city,
            @Param("isActive") Boolean isActive,
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice,
            org.springframework.data.domain.Pageable pageable
    );

    /**
     * Obtém apenas o preço por noite de uma propriedade otimizando o tráfego de rede e DB.
     * <p>Esta query projeta apenas o campo necessário em vez de instanciar toda a Entidade.</p>
     *
     * @param id O ‘ID’ da propriedade
     * @return O preço, caso a propriedade exista
     */
    @Query("SELECT p.basePrice FROM Property p WHERE p.id = :id")
    Optional<BigDecimal> findPriceById(@Param("id") Long id);
}

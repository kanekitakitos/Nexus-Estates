package com.nexus.estates.repository;

import com.nexus.estates.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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
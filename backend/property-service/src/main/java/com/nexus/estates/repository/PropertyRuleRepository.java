package com.nexus.estates.repository;

import com.nexus.estates.entity.PropertyRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositório JPA para a gestão da persistência de regras de propriedade.
 *
 * <p>Permite operações de criação, leitura, atualização e remoção (CRUD)
 * na tabela {@code property_rules}.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Repository
public interface PropertyRuleRepository extends JpaRepository<PropertyRule, Long> {
}
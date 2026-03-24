package com.nexus.estates.service;

import com.nexus.estates.common.dto.SeasonalityRuleDTO;
import com.nexus.estates.entity.Property;
import com.nexus.estates.entity.SeasonalityRule;
import com.nexus.estates.exception.PropertyNotFoundException;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.repository.SeasonalityRuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Serviço para gerir a lógica de negócio das regras de sazonalidade de uma propriedade.
 *
 * <p>Este serviço fornece endpoints de leitura para regras de sazonalidade (precificação dinâmica),
 * mantendo o contrato exposto através de DTOs e evitando a exposição direta de entidades JPA.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Service
public class SeasonalityRuleService {

    private final PropertyRepository propertyRepository;
    private final SeasonalityRuleRepository seasonalityRuleRepository;

    public SeasonalityRuleService(PropertyRepository propertyRepository, SeasonalityRuleRepository seasonalityRuleRepository) {
        this.propertyRepository = propertyRepository;
        this.seasonalityRuleRepository = seasonalityRuleRepository;
    }

    /**
     * Lista regras de sazonalidade de uma propriedade.
     *
     * @param propertyId ID da propriedade
     * @return lista de regras mapeadas para {@link SeasonalityRuleDTO}
     * @throws PropertyNotFoundException se a propriedade não existir
     */
    @Transactional(readOnly = true)
    public List<SeasonalityRuleDTO> listRules(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));

        List<SeasonalityRule> rules = seasonalityRuleRepository.findByProperty_IdOrderByStartDateAsc(property.getId());
        return rules.stream()
                .map(this::toDto)
                .toList();
    }

    private SeasonalityRuleDTO toDto(SeasonalityRule rule) {
        return new SeasonalityRuleDTO(
                rule.getId(),
                rule.getStartDate(),
                rule.getEndDate(),
                rule.getPriceModifier(),
                rule.getDayOfWeek(),
                rule.getChannel()
        );
    }
}


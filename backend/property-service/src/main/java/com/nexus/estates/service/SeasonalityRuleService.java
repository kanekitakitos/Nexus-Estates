package com.nexus.estates.service;

import com.nexus.estates.common.dto.SeasonalityRuleDTO;
import com.nexus.estates.dto.SeasonalityRulePatchRequest;
import com.nexus.estates.entity.Property;
import com.nexus.estates.entity.SeasonalityRule;
import com.nexus.estates.exception.PropertyNotFoundException;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.repository.SeasonalityRuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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


    /**
     *Converte uma entidade JPA {@link SeasonalityRule} para o seu respetivo
     * Data Transfer Object [@link SeasonalityRuleDTO}
     * <p>
     *     Garante que a camada web apenas recebe os dados necessários e seguros,
     *     ocultando detalhes internos da base de dados
     * </p>
     * @param rule A entidade de regra de sazonalidade original obtida da base de dados
     * @return O DTO encapsulando os dados da regra
     */
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

    private void validateReplaceDto(SeasonalityRuleDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Regra inválida.");
        }
        validateEntity(dto.startDate(), dto.endDate(), dto.priceModifier());
    }

    private void validateEntity(LocalDate startDate, LocalDate endDate, BigDecimal priceModifier) {
        if (startDate == null || endDate == null || priceModifier == null) {
            throw new IllegalArgumentException("startDate, endDate e priceModifier são obrigatórios.");
        }
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("A data de fim não pode ser anterior à data de início.");
        }
        if (priceModifier.compareTo(new BigDecimal("0.01")) < 0) {
            throw new IllegalArgumentException("O multiplicador deve ser >= 0.01.");
        }
    }
}


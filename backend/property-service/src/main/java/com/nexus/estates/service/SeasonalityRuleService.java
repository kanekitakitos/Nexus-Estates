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
     * Substitui a lista completa de regras de sazonalidade de uma propriedade (PUT).
     *
     * <p>Estratégia:</p>
     * <ul>
     *   <li>Regras com {@code id} que existam e pertençam à propriedade são atualizadas.</li>
     *   <li>Regras sem {@code id} (ou com {@code id} inválido) são criadas de novo.</li>
     *   <li>Regras existentes que não estejam no payload são removidas (orphanRemoval).</li>
     * </ul>
     *
     * @param propertyId ID da propriedade
     * @param dtos lista final de regras desejada
     * @return lista persistida (com IDs reais), ordenada por data de início
     */
    @Transactional
    public List<SeasonalityRuleDTO> replaceRules(Long propertyId, List<SeasonalityRuleDTO> dtos) {
        if (dtos == null) {
            throw new IllegalArgumentException("Lista de regras inválida.");
        }

        Property property = propertyRepository.findByIdForUpdate(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));

        Map<Long, SeasonalityRule> existingById = new HashMap<>();
        for (SeasonalityRule r : seasonalityRuleRepository.findByProperty_IdOrderByStartDateAsc(property.getId())) {
            existingById.put(r.getId(), r);
        }

        for (SeasonalityRuleDTO dto : dtos) {
            validateReplaceDto(dto);

            SeasonalityRule entity = (dto.id() != null) ? existingById.remove(dto.id()) : null;
            if (entity == null) {
                entity = new SeasonalityRule();
                entity.setProperty(property);
            }

            entity.setStartDate(dto.startDate());
            entity.setEndDate(dto.endDate());
            entity.setPriceModifier(dto.priceModifier());
            entity.setDayOfWeek(dto.dayOfWeek());
            entity.setChannel(dto.channel());

            seasonalityRuleRepository.save(entity);
        }

        for (SeasonalityRule orphan : existingById.values()) {
            seasonalityRuleRepository.delete(orphan);
        }

        return seasonalityRuleRepository.findByProperty_IdOrderByStartDateAsc(property.getId())
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Cria uma nova regra de sazonalidade.
     *
     * @param propertyId ID da propriedade
     * @param dto regra a criar
     * @return regra persistida
     */
    @Transactional
    public SeasonalityRuleDTO createRule(Long propertyId, SeasonalityRuleDTO dto) {
        validateReplaceDto(dto);

        Property property = propertyRepository.findByIdForUpdate(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));

        SeasonalityRule entity = new SeasonalityRule();
        entity.setProperty(property);
        entity.setStartDate(dto.startDate());
        entity.setEndDate(dto.endDate());
        entity.setPriceModifier(dto.priceModifier());
        entity.setDayOfWeek(dto.dayOfWeek());
        entity.setChannel(dto.channel());

        return toDto(seasonalityRuleRepository.save(entity));
    }

    /**
     * Atualiza parcialmente uma regra de sazonalidade.
     *
     * @param propertyId ID da propriedade
     * @param ruleId ID da regra
     * @param patch payload parcial
     * @return regra atualizada
     */
    @Transactional
    public SeasonalityRuleDTO patchRule(Long propertyId, Long ruleId, SeasonalityRulePatchRequest patch) {
        if (patch == null) {
            throw new IllegalArgumentException("Payload de patch inválido.");
        }

        propertyRepository.findByIdForUpdate(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));

        SeasonalityRule entity = seasonalityRuleRepository.findById(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Regra de sazonalidade não encontrada."));

        if (!entity.getProperty().getId().equals(propertyId)) {
            throw new IllegalArgumentException("Regra não pertence à propriedade.");
        }

        if (patch.startDate() != null) entity.setStartDate(patch.startDate());
        if (patch.endDate() != null) entity.setEndDate(patch.endDate());
        if (patch.priceModifier() != null) entity.setPriceModifier(patch.priceModifier());
        if (patch.dayOfWeek() != null) entity.setDayOfWeek(patch.dayOfWeek());
        if (patch.channel() != null) entity.setChannel(patch.channel());

        validateEntity(entity.getStartDate(), entity.getEndDate(), entity.getPriceModifier());

        return toDto(seasonalityRuleRepository.save(entity));
    }

    /**
     * Remove uma regra de sazonalidade.
     *
     * @param propertyId ID da propriedade
     * @param ruleId ID da regra
     */
    @Transactional
    public void deleteRule(Long propertyId, Long ruleId) {
        propertyRepository.findByIdForUpdate(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));

        SeasonalityRule entity = seasonalityRuleRepository.findById(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Regra de sazonalidade não encontrada."));

        if (!entity.getProperty().getId().equals(propertyId)) {
            throw new IllegalArgumentException("Regra não pertence à propriedade.");
        }

        seasonalityRuleRepository.delete(entity);
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


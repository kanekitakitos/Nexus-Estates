package com.nexus.estates.service;

import com.nexus.estates.common.dto.PropertyRuleDTO;
import com.nexus.estates.dto.PropertyRulePatchRequest;
import com.nexus.estates.entity.Property;
import com.nexus.estates.entity.PropertyRule;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.repository.PropertyRuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço para gerir a lógica de negócio das regras operacionais de uma propriedade.
 * <p>
 * Este serviço atua como intermediário entre o {@link com.nexus.estates.controller.PropertyController}
 * e os repositórios, encapsulando as operações de leitura e atualização das
 * entidades {@link PropertyRule}.
 * </p>
 *
 * @author Nexus Estates Team
 */
@Service
public class PropertyRuleService {

    private final PropertyRepository propertyRepository;
    private final PropertyRuleRepository ruleRepository;

    public PropertyRuleService(PropertyRepository propertyRepository, PropertyRuleRepository ruleRepository) {
        this.propertyRepository = propertyRepository;
        this.ruleRepository = ruleRepository;
    }

    /**
     * Obtém as regras operacionais de uma propriedade específica.
     * <p>
     * Se a propriedade não tiver regras explicitamente definidas, retorna um conjunto
     * de regras padrão para garantir um comportamento previsível no sistema.
     * </p>
     *
     * @param propertyId O ID da propriedade.
     * @return Um {@link PropertyRuleDTO} com as regras da propriedade.
     * @throws PropertyNotFoundException se a propriedade com o ID fornecido não for encontrada.
     */
    @Transactional(readOnly = true)
    public PropertyRuleDTO getRules(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new com.nexus.estates.exception.PropertyNotFoundException(propertyId));

        PropertyRule rule = property.getPropertyRule();
        if (rule == null) {
            // Retorna um DTO com valores padrão se não existirem regras definidas
            return new PropertyRuleDTO(
                    java.time.LocalTime.of(15, 0), // Check-in 15:00
                    java.time.LocalTime.of(11, 0), // Check-out 11:00
                    1,                             // Min noites
                    30,                            // Max noites
                    0                              // Booking lead time days
            );
        }

        return new PropertyRuleDTO(
                rule.getCheckInTime(),
                rule.getCheckOutTime(),
                rule.getMinNights(),
                rule.getMaxNights(),
                rule.getBookingLeadTimeDays()
        );
    }

    /**
     * Atualiza ou cria as regras operacionais de uma propriedade.
     * <p>
     * Se a propriedade ainda não tiver regras, uma nova entidade {@link PropertyRule}
     * será criada e associada. Caso contrário, os valores existentes serão atualizados.
     * </p>
     *
     * @param propertyId O ID da propriedade a ser atualizada.
     * @param dto O {@link PropertyRuleDTO} com os novos valores das regras.
     * @return O {@link PropertyRuleDTO} representando o estado atualizado das regras.
     * @throws PropertyNotFoundException se a propriedade com o ID fornecido não for encontrada.
     */
    @Transactional
    public PropertyRuleDTO updateRules(Long propertyId, PropertyRuleDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Payload de regras inválido.");
        }
        if (dto.checkInTime() == null || dto.checkOutTime() == null || dto.minNights() == null || dto.maxNights() == null || dto.bookingLeadTimeDays() == null) {
            throw new IllegalArgumentException("Todos os campos de regras são obrigatórios para substituição total (PUT).");
        }
        validateConsistency(dto.minNights(), dto.maxNights(), dto.bookingLeadTimeDays());

        Property property = propertyRepository.findByIdForUpdate(propertyId)
                .orElseThrow(() -> new com.nexus.estates.exception.PropertyNotFoundException(propertyId));

        PropertyRule rule = property.getPropertyRule();
        if (rule == null) {
            rule = new PropertyRule();
            rule.setProperty(property);
            property.setPropertyRule(rule);
        }

        rule.setCheckInTime(dto.checkInTime());
        rule.setCheckOutTime(dto.checkOutTime());
        rule.setMinNights(dto.minNights());
        rule.setMaxNights(dto.maxNights());
        rule.setBookingLeadTimeDays(dto.bookingLeadTimeDays());

        PropertyRule savedRule = ruleRepository.save(rule);

        return new PropertyRuleDTO(
                savedRule.getCheckInTime(),
                savedRule.getCheckOutTime(),
                savedRule.getMinNights(),
                savedRule.getMaxNights(),
                savedRule.getBookingLeadTimeDays()
        );
    }

    /**
     * Atualiza parcialmente as regras operacionais de uma propriedade (PATCH).
     *
     * <p>Somente os campos não-nulos do payload são aplicados, mantendo os restantes
     * valores inalterados.</p>
     *
     * @param propertyId ID da propriedade
     * @param patch payload parcial
     * @return DTO com o estado atualizado das regras
     */
    @Transactional
    public PropertyRuleDTO patchRules(Long propertyId, PropertyRulePatchRequest patch) {
        if (patch == null) {
            throw new IllegalArgumentException("Payload de patch inválido.");
        }

        Property property = propertyRepository.findByIdForUpdate(propertyId)
                .orElseThrow(() -> new com.nexus.estates.exception.PropertyNotFoundException(propertyId));

        PropertyRule rule = property.getPropertyRule();
        if (rule == null) {
            rule = PropertyRule.builder()
                    .property(property)
                    .checkInTime(java.time.LocalTime.of(15, 0))
                    .checkOutTime(java.time.LocalTime.of(11, 0))
                    .minNights(1)
                    .maxNights(30)
                    .bookingLeadTimeDays(0)
                    .build();
            property.setPropertyRule(rule);
        }

        if (patch.checkInTime() != null) rule.setCheckInTime(patch.checkInTime());
        if (patch.checkOutTime() != null) rule.setCheckOutTime(patch.checkOutTime());
        if (patch.minNights() != null) rule.setMinNights(patch.minNights());
        if (patch.maxNights() != null) rule.setMaxNights(patch.maxNights());
        if (patch.bookingLeadTimeDays() != null) rule.setBookingLeadTimeDays(patch.bookingLeadTimeDays());

        validateConsistency(rule.getMinNights(), rule.getMaxNights(), rule.getBookingLeadTimeDays());

        PropertyRule savedRule = ruleRepository.save(rule);
        return new PropertyRuleDTO(
                savedRule.getCheckInTime(),
                savedRule.getCheckOutTime(),
                savedRule.getMinNights(),
                savedRule.getMaxNights(),
                savedRule.getBookingLeadTimeDays()
        );
    }

    private void validateConsistency(Integer minNights, Integer maxNights, Integer bookingLeadTimeDays) {
        if (minNights == null || maxNights == null || bookingLeadTimeDays == null) {
            throw new IllegalArgumentException("Campos de regras inválidos.");
        }
        if (minNights < 1) {
            throw new IllegalArgumentException("O número mínimo de noites deve ser >= 1.");
        }
        if (maxNights < 1) {
            throw new IllegalArgumentException("O número máximo de noites deve ser >= 1.");
        }
        if (maxNights < minNights) {
            throw new IllegalArgumentException("O número máximo de noites não pode ser inferior ao mínimo.");
        }
        if (bookingLeadTimeDays < 0) {
            throw new IllegalArgumentException("A antecedência mínima deve ser >= 0.");
        }
    }
}

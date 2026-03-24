package com.nexus.estates.service;

import com.nexus.estates.common.dto.PropertyRuleDTO;
import com.nexus.estates.entity.Property;
import com.nexus.estates.entity.PropertyRule;
import com.nexus.estates.exception.PropertyNotFoundException;
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
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));

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
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new PropertyNotFoundException(propertyId));

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
}
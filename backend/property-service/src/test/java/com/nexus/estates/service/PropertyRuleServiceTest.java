package com.nexus.estates.service;

import com.nexus.estates.common.dto.PropertyRuleDTO;
import com.nexus.estates.entity.Property;
import com.nexus.estates.entity.PropertyRule;
import com.nexus.estates.exception.PropertyNotFoundException;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.repository.PropertyRuleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PropertyRuleServiceTest {

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private PropertyRuleRepository ruleRepository;

    @InjectMocks
    private PropertyRuleService propertyRuleService;

    private Property property;
    private PropertyRule propertyRule;

    @BeforeEach
    void setUp() {
        property = new Property();
        property.setId(1L);

        propertyRule = PropertyRule.builder()
                .id(1L)
                .property(property)
                .checkInTime(LocalTime.of(16, 0))
                .checkOutTime(LocalTime.of(11, 0))
                .minNights(2)
                .maxNights(30)
                .bookingLeadTimeDays(2)
                .build();
    }

    @Test
    void getRules_ShouldReturnRules_WhenPropertyExistsAndHasRules() {
        property.setPropertyRule(propertyRule);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        PropertyRuleDTO result = propertyRuleService.getRules(1L);

        assertNotNull(result);
        assertEquals(LocalTime.of(16, 0), result.checkInTime());
        assertEquals(2, result.minNights());
    }

    @Test
    void getRules_ShouldReturnDefaultRules_WhenPropertyExistsButHasNoRules() {
        property.setPropertyRule(null);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));

        PropertyRuleDTO result = propertyRuleService.getRules(1L);

        assertNotNull(result);
        assertEquals(LocalTime.of(15, 0), result.checkInTime()); // Default
        assertEquals(1, result.minNights()); // Default
    }

    @Test
    void getRules_ShouldThrowException_WhenPropertyDoesNotExist() {
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(PropertyNotFoundException.class, () -> propertyRuleService.getRules(99L));
    }

    @Test
    void updateRules_ShouldUpdateExistingRules() {
        property.setPropertyRule(propertyRule);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(ruleRepository.save(any(PropertyRule.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PropertyRuleDTO newRules = new PropertyRuleDTO(
                LocalTime.of(14, 0),
                LocalTime.of(10, 0),
                5,
                60,
                7
        );

        PropertyRuleDTO result = propertyRuleService.updateRules(1L, newRules);

        assertEquals(5, result.minNights());
        assertEquals(7, result.bookingLeadTimeDays());
        verify(ruleRepository).save(any(PropertyRule.class));
    }

    @Test
    void updateRules_ShouldCreateNewRules_WhenNoneExist() {
        property.setPropertyRule(null);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(ruleRepository.save(any(PropertyRule.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PropertyRuleDTO newRules = new PropertyRuleDTO(
                LocalTime.of(14, 0),
                LocalTime.of(10, 0),
                3,
                15,
                1
        );

        PropertyRuleDTO result = propertyRuleService.updateRules(1L, newRules);

        assertEquals(3, result.minNights());
        verify(ruleRepository).save(any(PropertyRule.class));
    }
}
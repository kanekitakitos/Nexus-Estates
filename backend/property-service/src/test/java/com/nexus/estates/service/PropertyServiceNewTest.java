package com.nexus.estates.service;

import com.nexus.estates.dto.UpdatePropertyRequest;
import com.nexus.estates.entity.Property;
import com.nexus.estates.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PropertyServiceNewTest {

    private PropertyRepository propertyRepository;
    private AmenityRepository amenityRepository;
    private SeasonalityRuleRepository seasonalityRepo;
    private PropertyRuleRepository ruleRepository;
    private PermissionRepository permissionRepository;
    private PropertyChangeLogRepository changeLogRepository;
    private RuleOverrideRepository ruleOverrideRepository;
    private PropertyService service;

    @BeforeEach
    void setUp() {
        propertyRepository = mock(PropertyRepository.class);
        amenityRepository = mock(AmenityRepository.class);
        seasonalityRepo = mock(SeasonalityRuleRepository.class);
        ruleRepository = mock(PropertyRuleRepository.class);
        permissionRepository = mock(PermissionRepository.class);
        changeLogRepository = mock(PropertyChangeLogRepository.class);
        ruleOverrideRepository = mock(RuleOverrideRepository.class);
        
        service = new PropertyService(
                propertyRepository, 
                amenityRepository, 
                seasonalityRepo, 
                ruleRepository, 
                permissionRepository, 
                changeLogRepository,
                ruleOverrideRepository
        );
    }

    @Test
    @DisplayName("Atualizar preço inválido deve lançar exceção")
    void updateInvalidPrice() {
        Property p = new Property();
        p.setId(1L);
        p.setName("Casa");
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(p));
        
        UpdatePropertyRequest invalidRequest = new UpdatePropertyRequest(null, null, null, null, null, BigDecimal.ZERO, null, null);
        
        assertThrows(IllegalArgumentException.class, () ->
                service.updateProperty(1L, invalidRequest, null)
        );
    }

    @Test
    @DisplayName("Atualização válida altera campos")
    void validUpdate() {
        Property p = new Property();
        p.setId(1L);
        p.setName("Casa");
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(p));
        when(propertyRepository.save(any(Property.class))).thenAnswer(inv -> inv.getArgument(0));
        
        UpdatePropertyRequest validRequest = new UpdatePropertyRequest("Nova", null, null, null, null, new BigDecimal("100.00"), 2, true);
        
        Property updated = service.updateProperty(1L, validRequest, 10L);
        
        assertEquals("Nova", updated.getName());
        assertEquals(0, new BigDecimal("100.00").compareTo(updated.getBasePrice()));
        assertEquals(2, updated.getMaxGuests());
        assertTrue(updated.getIsActive());
        verify(changeLogRepository, atLeastOnce()).save(any());
    }
}
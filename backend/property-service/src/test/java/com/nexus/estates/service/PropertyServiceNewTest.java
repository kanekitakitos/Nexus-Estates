package com.nexus.estates.service;

import com.nexus.estates.dto.UpdatePropertyRequest;
import com.nexus.estates.entity.Property;
import com.nexus.estates.repository.AmenityRepository;
import com.nexus.estates.repository.PermissionRepository;
import com.nexus.estates.repository.PropertyChangeLogRepository;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.repository.PropertyRuleRepository;
import com.nexus.estates.repository.SeasonalityRuleRepository;
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
    private PropertyService service;

    @BeforeEach
    void setUp() {
        propertyRepository = mock(PropertyRepository.class);
        amenityRepository = mock(AmenityRepository.class);
        seasonalityRepo = mock(SeasonalityRuleRepository.class);
        ruleRepository = mock(PropertyRuleRepository.class);
        permissionRepository = mock(PermissionRepository.class);
        changeLogRepository = mock(PropertyChangeLogRepository.class);
        service = new PropertyService(propertyRepository, amenityRepository, seasonalityRepo, ruleRepository, permissionRepository, changeLogRepository);
    }

    @Test
    @DisplayName("Atualizar preço inválido deve lançar exceção")
    void updateInvalidPrice() {
        Property p = new Property();
        p.setId(1L);
        p.setName("Casa");
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(p));
        assertThrows(IllegalArgumentException.class, () ->
                service.updateProperty(1L, new UpdatePropertyRequest(null, null, null, null, null, BigDecimal.ZERO, null, null, null), null)
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
        Property updated = service.updateProperty(1L, new UpdatePropertyRequest("Nova", null, null, null, null, new BigDecimal("100.00"), 2, true, null), 10L);
        assertEquals("Nova", updated.getName());
        assertEquals(new BigDecimal("100.00"), updated.getBasePrice());
        assertEquals(2, updated.getMaxGuests());
        assertTrue(updated.getIsActive());
        verify(changeLogRepository, atLeastOnce()).save(any());
    }
}

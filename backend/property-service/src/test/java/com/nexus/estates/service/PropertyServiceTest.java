package com.nexus.estates.service;

import com.nexus.estates.entity.Property;
import com.nexus.estates.exception.PropertyNotFoundException;
import com.nexus.estates.repository.PropertyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para o {@link PropertyService}.
 */
class PropertyServiceTest {

    @Mock
    private PropertyRepository repository;

    @Mock
    private EmailService emailService; // 1. Adicionado Mock do EmailService

    @InjectMocks
    private PropertyService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Should create property successfully and trigger email")
    void shouldCreateProperty() {
        // Arrange
        Property property = new Property();
        property.setId(1L); // Simular um ID atribuído
        property.setName("Casa Teste");
        property.setBasePrice(new BigDecimal("100.00"));
        property.setCity("Lisboa");

        when(repository.save(any(Property.class))).thenReturn(property);

        // Act
        Property saved = service.create(property);

        // Assert
        assertNotNull(saved);
        assertEquals("Casa Teste", saved.getName());
        verify(repository).save(property);

        // 2. VERIFICAÇÃO DO EMAIL:
        // Confirmamos que o sendEmailFromTemplate foi chamado exatamente 1 vez com qualquer parâmetro
        verify(emailService, times(1)).sendEmailFromTemplate(
                anyString(),
                anyString(),
                eq("property-created"),
                anyMap()
        );
    }

    @Test
    @DisplayName("Should return all properties")
    void shouldReturnAllProperties() {
        // Arrange
        when(repository.findAll()).thenReturn(List.of(new Property()));

        // Act
        List<Property> properties = service.findAll();

        // Assert
        assertEquals(1, properties.size());
        verify(repository).findAll();
    }

    @Test
    @DisplayName("Should return property by ID when found")
    void shouldReturnPropertyById() {
        // Arrange
        Long id = 1L;
        Property property = new Property();
        property.setId(id);
        property.setName("Apartamento");

        when(repository.findById(id)).thenReturn(Optional.of(property));

        // Act
        Property result = service.findById(id);

        // Assert
        assertNotNull(result);
        assertEquals("Apartamento", result.getName());
        assertEquals(id, result.getId());
        verify(repository).findById(id);
    }

    @Test
    @DisplayName("Should throw PropertyNotFoundException when ID does not exist")
    void shouldThrowPropertyNotFoundExceptionWhenPropertyNotFound() {
        // Arrange
        Long id = 9L;
        when(repository.findById(id)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(PropertyNotFoundException.class, () -> service.findById(id));

        verify(repository).findById(id);
    }
}
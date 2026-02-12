package com.nexus.estates.service;

import com.nexus.estates.entity.Property;
import com.nexus.estates.repository.PropertyRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PropertyServiceTest {

    @Test
    void shouldCreateProperty() {

        PropertyRepository repository = mock(PropertyRepository.class);
        PropertyService service = new PropertyService(repository);

        Property property = new Property();
        property.setTitle("Casa Teste");
        property.setPrice(100.0);
        property.setOwnerId(1L);

        when(repository.save(property)).thenReturn(property);

        Property saved = service.create(property);

        assertNotNull(saved);
        assertEquals("Casa Teste", saved.getTitle());

        verify(repository).save(property);
    }

    @Test
    void shouldReturnAllProperties() {

        PropertyRepository repository = mock(PropertyRepository.class);
        PropertyService service = new PropertyService(repository);

        when(repository.findAll()).thenReturn(List.of(new Property()));

        List<Property> properties = service.findAll();

        assertEquals(1, properties.size());

        verify(repository).findAll();
    }

    @Test
    void shouldReturnPropertyById() {

        PropertyRepository repository = mock(PropertyRepository.class);
        PropertyService service = new PropertyService(repository);

        Property property = new Property();
        property.setTitle("Apartamento");

        when(repository.findById(1L)).thenReturn(Optional.of(property));

        Property result = service.findById(1L);

        assertNotNull(result);
        assertEquals("Apartamento", result.getTitle());

        verify(repository).findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenPropertyNotFound() {

        PropertyRepository repository = mock(PropertyRepository.class);
        PropertyService service = new PropertyService(repository);

        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.findById(1L));

        verify(repository).findById(1L);
    }
}

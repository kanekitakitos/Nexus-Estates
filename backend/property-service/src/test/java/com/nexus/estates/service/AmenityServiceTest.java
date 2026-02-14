package com.nexus.estates.service;

import com.nexus.estates.entity.Amenity;
import com.nexus.estates.entity.AmenityCategory;
import com.nexus.estates.exception.AmenityNotFoundException;
import com.nexus.estates.repository.AmenityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para o {@link AmenityService}.
 * * * Foca na validação da lógica de negócio e na correta propagação
 * de exceções personalizadas.
 */
@ExtendWith(MockitoExtension.class)
class AmenityServiceTest {

    @Mock
    private AmenityRepository repository;

    @InjectMocks
    private AmenityService service;

    private Amenity amenity;
    private UUID amenityId;

    @BeforeEach
    void setUp() {
        amenityId = UUID.randomUUID();
        amenity = new Amenity();
        amenity.setId(amenityId);
        amenity.setName("Piscina");
        amenity.setCategory(AmenityCategory.LEISURE);
    }

    @Test
    @DisplayName("Should create amenity successfully")
    void shouldCreateAmenityWithSuccess() {
        // Arrange
        when(repository.save(any(Amenity.class))).thenReturn(amenity);

        // Act
        Amenity result = service.create(new Amenity());

        // Assert
        assertNotNull(result);
        assertEquals("Piscina", result.getName());
        verify(repository, times(1)).save(any(Amenity.class));
    }

    @Test
    @DisplayName("Should return all amenities")
    void shouldFindAllAmenities() {
        // Arrange
        when(repository.findAll()).thenReturn(List.of(amenity));

        // Act
        List<Amenity> result = service.findAll();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Piscina", result.get(0).getName());
        verify(repository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return amenity by ID when found")
    void shouldFindAmenityByIdWithSuccess() {
        // Arrange
        when(repository.findById(amenityId)).thenReturn(Optional.of(amenity));

        // Act
        Amenity result = service.findById(amenityId);

        // Assert
        assertNotNull(result);
        assertEquals(amenityId, result.getId());
    }

    @Test
    @DisplayName("Should throw AmenityNotFoundException when ID does not exist")
    void shouldThrowAmenityNotFoundExceptionWhenIdDoesNotExist() {
        // Arrange
        UUID idInexistente = UUID.randomUUID();
        when(repository.findById(idInexistente)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AmenityNotFoundException.class, () -> {
            service.findById(idInexistente);
        });

        verify(repository, times(1)).findById(idInexistente);
    }
}
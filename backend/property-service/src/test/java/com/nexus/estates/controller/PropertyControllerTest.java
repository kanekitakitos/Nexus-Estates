package com.nexus.estates.controller;

import com.nexus.estates.dto.CreatePropertyRequest;
import com.nexus.estates.entity.Property;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.service.PropertyService;
import com.nexus.estates.service.ImageStorageService; // Importar a interface
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PropertyControllerTest {

    private PropertyService propertyService;
    private ImageStorageService imageStorageService; // Usar a interface
    private PropertyController controller;
    private PropertyRepository repository;

    @BeforeEach
    void setUp() {
        // Inicializamos os mocks e o controller antes de cada teste
        propertyService = mock(PropertyService.class);
        imageStorageService = mock(ImageStorageService.class); // Mock da interface
        repository = mock(PropertyRepository.class);

        controller = new PropertyController(propertyService, imageStorageService,repository);
    }

    @Test
    @DisplayName("Should return 201 Created when request is valid")
    void shouldReturnCreatedWhenRequestIsValid() {
        // Arrange
        CreatePropertyRequest request = new CreatePropertyRequest(
                "Apartamento Luxo",
                Map.of("pt", "Descrição"),
                500.0,
                1L,
                "Lisboa",
                Set.of()
        );

        when(propertyService.create(any(CreatePropertyRequest.class))).thenReturn(new Property());

        // Act
        var response = controller.create(request);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(propertyService, times(1)).create(request);
    }

    @Test
    @DisplayName("Should return upload parameters asynchronously")
    void shouldReturnUploadParameters() throws ExecutionException, InterruptedException {
        // Arrange
        Map<String, Object> mockParams = Map.of("signature", "123", "timestamp", "456");
        when(imageStorageService.getUploadParameters()).thenReturn(mockParams);

        // Act
        CompletableFuture<org.springframework.http.ResponseEntity<Map<String, Object>>> futureResponse = controller.getUploadParams();
        var response = futureResponse.get(); // Espera o resultado da thread asíncrona

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockParams, response.getBody());
        verify(imageStorageService, times(1)).getUploadParameters();
    }
}
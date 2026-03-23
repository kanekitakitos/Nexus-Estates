package com.nexus.estates.controller;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.dto.CreatePropertyRequest;
import com.nexus.estates.entity.Property;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.service.PropertyService;
import com.nexus.estates.service.ImageStorageService;
import com.nexus.estates.service.PropertyRuleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PropertyControllerTest {

    private PropertyService propertyService;
    private ImageStorageService imageStorageService;
    private PropertyRepository repository;
    private PropertyRuleService ruleService;
    private PropertyController controller;

    @BeforeEach
    void setUp() {
        // Inicializamos os mocks e o controller antes de cada teste
        propertyService = mock(PropertyService.class);
        imageStorageService = mock(ImageStorageService.class);
        repository = mock(PropertyRepository.class);
        ruleService = mock(PropertyRuleService.class);

        controller = new PropertyController(propertyService, imageStorageService, repository, ruleService);
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
        ResponseEntity<ApiResponse<Property>> response = controller.create(request);

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
        CompletableFuture<ResponseEntity<ApiResponse<Map<String, Object>>>> futureResponse = controller.getUploadParams();
        ResponseEntity<ApiResponse<Map<String, Object>>> response = futureResponse.get(); // Espera o resultado da thread asíncrona

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(mockParams, response.getBody().getData());
        verify(imageStorageService, times(1)).getUploadParameters();
    }
}
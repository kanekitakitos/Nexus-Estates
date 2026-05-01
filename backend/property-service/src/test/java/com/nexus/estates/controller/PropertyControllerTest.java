package com.nexus.estates.controller;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.dto.CreatePropertyRequest;
import com.nexus.estates.entity.Property;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.service.PermissionService;
import com.nexus.estates.service.PropertyService;
import com.nexus.estates.service.PropertyRuleService;
import com.nexus.estates.service.SeasonalityRuleService;
import com.nexus.estates.service.repository.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class PropertyControllerTest {

    private PropertyService propertyService;
    private ImageStorageService imageStorageService;
    private PropertyRepository repository;
    private PropertyRuleService ruleService;
    private SeasonalityRuleService seasonalityRuleService;
    private PermissionService permissionService;
    private PropertyController controller;

    @BeforeEach
    void setUp() {
        propertyService = mock(PropertyService.class);
        imageStorageService = mock(ImageStorageService.class);
        repository = mock(PropertyRepository.class);
        ruleService = mock(PropertyRuleService.class);
        seasonalityRuleService = mock(SeasonalityRuleService.class);
        permissionService = mock(PermissionService.class);
        
        controller = new PropertyController(propertyService, imageStorageService, repository, ruleService, seasonalityRuleService, permissionService);
    }

    @Test
    @DisplayName("Should return 201 Created when request is valid")
    void shouldReturnCreatedWhenRequestIsValid() {
        CreatePropertyRequest request = new CreatePropertyRequest(
                "Apartamento Luxo",
                Map.of("pt", "Descrição"),
                500.0,
                1L,
                "Lisboa",
                "Lisboa",
                "Av. da Liberdade, 1",
                2,
                Set.of(1L, 2L),
                null
        );

        when(propertyService.create(any(CreatePropertyRequest.class), any())).thenReturn(new Property());

        ResponseEntity<ApiResponse<Property>> response = controller.create(request, null);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(propertyService, times(1)).create(request, null);
    }

    @Test
    @DisplayName("Should add amenity to property successfully")
    void shouldAddAmenityToProperty() {
        Long propertyId = 1L;
        Long amenityId = 5L;
        when(propertyService.addAmenity(propertyId, amenityId)).thenReturn(new Property());

        ResponseEntity<ApiResponse<Property>> response = controller.addAmenity(propertyId, amenityId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        verify(propertyService).addAmenity(propertyId, amenityId);
    }

    @Test
    @DisplayName("Should remove amenity from property successfully")
    void shouldRemoveAmenityFromProperty() {
        Long propertyId = 1L;
        Long amenityId = 5L;
        when(propertyService.removeAmenity(propertyId, amenityId)).thenReturn(new Property());

        ResponseEntity<ApiResponse<Property>> response = controller.removeAmenity(propertyId, amenityId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        verify(propertyService).removeAmenity(propertyId, amenityId);
    }

    @Test
    @DisplayName("Should return upload parameters asynchronously")
    void shouldReturnUploadParameters() throws Exception {
        Map<String, Object> mockParams = Map.of("signature", "123", "timestamp", "456");
        when(imageStorageService.getUploadParameters()).thenReturn(mockParams);

        CompletableFuture<ResponseEntity<ApiResponse<Map<String, Object>>>> futureResponse = controller.getUploadParams();
        
        ResponseEntity<ApiResponse<Map<String, Object>>> response = futureResponse.get(2, TimeUnit.SECONDS);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals(mockParams, response.getBody().getData());
        verify(imageStorageService, times(1)).getUploadParameters();
    }
}

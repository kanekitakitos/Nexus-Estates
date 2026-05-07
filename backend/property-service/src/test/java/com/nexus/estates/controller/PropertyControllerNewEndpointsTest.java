package com.nexus.estates.controller;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.dto.ExpandedPropertyResponse;
import com.nexus.estates.dto.UpdatePropertyRequest;
import com.nexus.estates.entity.AccessLevel;
import com.nexus.estates.entity.Property;
import com.nexus.estates.entity.PropertyChangeLog;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.service.PermissionService;
import com.nexus.estates.service.PropertyRuleService;
import com.nexus.estates.service.PropertyService;
import com.nexus.estates.service.SeasonalityRuleService;
import com.nexus.estates.service.repository.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PropertyControllerNewEndpointsTest {

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
    @DisplayName("Listar propriedades por utilizador com paginação")
    void listByUser() {
        Page<Property> page = new PageImpl<>(List.of(), PageRequest.of(0,20), 0);
        when(propertyService.listByUserWithFilters(eq(1L), any(), any(), any(), any(), any())).thenReturn(page);
        ResponseEntity<ApiResponse<Page<Map<String,Object>>>> resp = controller.listByUser(1L, 0, 20, "name,asc", null, null, null, null);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getBody().isSuccess());
    }

    @Test
    @DisplayName("Obter propriedade expandida")
    void getExpanded() {
        when(propertyService.getExpandedById(1L)).thenReturn(new ExpandedPropertyResponse(
                1L, "Casa", Map.of("pt","desc"), "Lisboa", "Lisboa", "Rua", BigDecimal.TEN, 4, true, List.of(), null, List.of(), List.of(), null
        ));
        ResponseEntity<ApiResponse<ExpandedPropertyResponse>> resp = controller.getExpanded(1L);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertNotNull(resp.getBody().getData());
    }

    @Test
    @DisplayName("Patch de propriedade")
    void patch() {
        Property mockProperty = new Property();
        when(propertyService.requireManageAccess(eq(1L), eq("1"))).thenReturn(AccessLevel.PRIMARY_OWNER);
        when(propertyService.updateProperty(eq(1L), any(UpdatePropertyRequest.class), isNull())).thenReturn(mockProperty);
        
        ExpandedPropertyResponse mockResponse = new ExpandedPropertyResponse(
                1L, "Casa", Map.of("pt","desc"), "Lisboa", "Lisboa", "Rua", BigDecimal.TEN, 4, true, List.of(), null, List.of(), List.of(), null
        );
        when(propertyService.convertToExpandedDto(mockProperty)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<ExpandedPropertyResponse>> resp = controller.patch(
                1L,
                new UpdatePropertyRequest("X", null, null, null, null, null, null, null, null),
                null,
                "1"
        );
        
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertNotNull(resp.getBody());
        assertEquals("Propriedade atualizada com sucesso.", resp.getBody().getMessage());
        assertEquals(mockResponse, resp.getBody().getData());
        verify(propertyService).requireManageAccess(1L, "1");
    }

    @Test
    @DisplayName("Eliminar propriedade")
    void delete() {
        ResponseEntity<Void> resp = controller.delete(1L, null, "1");
        assertEquals(HttpStatus.NO_CONTENT, resp.getStatusCode());
        verify(propertyService, times(1)).requirePrimaryOwnerAccess(1L, "1");
        verify(propertyService, times(1)).deleteProperty(1L, null);
    }

    @Test
    @DisplayName("Histórico de alterações")
    void history() {
        when(propertyService.getHistory(1L)).thenReturn(List.of(new PropertyChangeLog()));
        ResponseEntity<ApiResponse<List<PropertyChangeLog>>> resp = controller.history(1L);
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertFalse(resp.getBody().getData().isEmpty());
    }

    @Test
    @DisplayName("Parâmetros de upload de documentos")
    void documentUploadParams() {
        when(propertyService.requireManageAccess(eq(1L), eq("1"))).thenReturn(AccessLevel.PRIMARY_OWNER);
        when(imageStorageService.getUploadParameters()).thenReturn(Map.of("signature","abc"));
        ResponseEntity<ApiResponse<Map<String, Object>>> resp = controller.documentUploadParams(1L, "1");
        assertEquals(HttpStatus.OK, resp.getStatusCode());
        assertTrue(resp.getBody().getData().containsKey("context_property_id"));
        verify(propertyService).requireManageAccess(1L, "1");
    }
}

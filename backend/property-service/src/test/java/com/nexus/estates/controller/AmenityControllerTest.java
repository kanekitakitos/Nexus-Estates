package com.nexus.estates.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.estates.entity.Amenity;
import com.nexus.estates.entity.AmenityCategory;
import com.nexus.estates.service.AmenityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser; // Import necessário
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf; // Import necessário
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes unitários para o {@link AmenityController}.
 *
 * <p>Esta classe utiliza o MockMvc para simular pedidos HTTP aos endpoints
 * de gestão de comodidades, garantindo que o controller responde corretamente
 * aos diferentes cenários de entrada.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-12
 */
@WebMvcTest(AmenityController.class)
@WithMockUser // Resolve o erro 401: Simula um utilizador autenticado para todos os testes
class AmenityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AmenityService service;

    @Autowired
    private ObjectMapper objectMapper;

    private Amenity validAmenity;
    private Long amenityId;

    /**
     * Configuração inicial para cada teste.
     */
    @BeforeEach
    void setUp() {
        amenityId = 5L;
        validAmenity = new Amenity();
        validAmenity.setId(amenityId);
        // Ajuste para Map (i18n)
        validAmenity.setName(Map.of("pt", "Piscina", "en", "Pool"));
        validAmenity.setCategory(AmenityCategory.LEISURE);
    }

    /**
     * Testa a criação de uma comodidade com sucesso.
     * @throws Exception caso ocorra erro na simulação do pedido
     */
    @Test
    void shouldCreateAmenityWithSuccess() throws Exception {
        when(service.create(any(Amenity.class))).thenReturn(validAmenity);

        mockMvc.perform(post("/api/amenities")
                        .with(csrf()) // Resolve o erro 403: Adiciona o token CSRF obrigatório em POST
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validAmenity)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(amenityId))
                .andExpect(jsonPath("$.name.pt").value("Piscina"));
    }

    /**
     * Testa a validação de campos obrigatórios no endpoint de criação.
     * Deve retornar 400 Bad Request quando o nome é nulo.
     */
    @Test
    void shouldReturnBadRequestWhenNameIsNull() throws Exception {
        Amenity invalidAmenity = new Amenity();
        invalidAmenity.setCategory(AmenityCategory.SAFETY);

        mockMvc.perform(post("/api/amenities")
                        .with(csrf()) // Resolve o erro 403
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidAmenity)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Testa a listagem de todas as comodidades.
     */
    @Test
    void shouldListAllAmenities() throws Exception {
        when(service.findAll()).thenReturn(List.of(validAmenity));

        mockMvc.perform(get("/api/amenities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name.pt").value("Piscina"));
    }

    /**
     * Testa a obtenção de uma comodidade específica por ID.
     */
    @Test
    void shouldGetAmenityById() throws Exception {
        when(service.findById(amenityId)).thenReturn(validAmenity);

        mockMvc.perform(get("/api/amenities/{id}", amenityId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(amenityId))
                .andExpect(jsonPath("$.name.pt").value("Piscina"));
    }
}
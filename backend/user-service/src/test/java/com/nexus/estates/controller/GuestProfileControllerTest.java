package com.nexus.estates.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.estates.config.JwtAuthenticationFilter;
import com.nexus.estates.config.SecurityConfig;
import com.nexus.estates.dto.GuestProfileRequest;
import com.nexus.estates.dto.GuestProfileResponse;
import com.nexus.estates.repository.UserRepository;
import com.nexus.estates.service.GuestProfileService;
import com.nexus.estates.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Suite de testes para a camada Web do controlador {@link GuestProfileController}.
 * <p>
 * Valida os endpoints expostos e especialmente as políticas de segurança e RBAC,
 * verificando que apenas utilizadores com roles MANAGER ou ADMIN podem aceder às notas internas.
 * </p>
 *
 * @author Nexus Estates Team
 */
@WebMvcTest(GuestProfileController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@DisplayName("Testes Web: Guest Profile Controller (Segurança e Endpoints)")
class GuestProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GuestProfileService guestProfileService;

    // Dependências necessárias para a Filter Chain de Segurança funcionar no WebMvcTest
    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    private GuestProfileResponse mockResponse;
    private GuestProfileRequest mockRequest;

    @BeforeEach
    void setUp() {
        mockResponse = GuestProfileResponse.builder()
                .id(1L)
                .userId(10L)
                .userEmail("guest@test.com")
                .internalNotes("Notas internas secretas")
                .tags(List.of("Problematic", "Late Checkout"))
                .build();

        mockRequest = new GuestProfileRequest();
        mockRequest.setInternalNotes("Novas notas");
        mockRequest.setTags(List.of("VIP"));
    }

    @Test
    @DisplayName("Deve permitir GET (ler perfil) se utilizador for ADMIN")
    @WithMockUser(roles = "ADMIN")
    void getGuestProfile_ShouldReturn200_WhenUserIsAdmin() throws Exception {
        when(guestProfileService.getProfileByUserId(10L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/users/10/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(10L))
                .andExpect(jsonPath("$.internalNotes").value("Notas internas secretas"))
                .andExpect(jsonPath("$.tags[0]").value("Problematic"));
    }

    @Test
    @DisplayName("Deve permitir GET (ler perfil) se utilizador for MANAGER")
    @WithMockUser(roles = "MANAGER")
    void getGuestProfile_ShouldReturn200_WhenUserIsManager() throws Exception {
        when(guestProfileService.getProfileByUserId(10L)).thenReturn(mockResponse);

        mockMvc.perform(get("/api/users/10/profile"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Deve retornar 403 Forbidden no GET se utilizador for um GUEST normal")
    @WithMockUser(roles = "GUEST")
    void getGuestProfile_ShouldReturn403_WhenUserIsGuest() throws Exception {
        mockMvc.perform(get("/api/users/10/profile"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Deve atualizar perfil (PUT) e retornar 200 OK se autorizado")
    @WithMockUser(roles = "ADMIN")
    void updateGuestProfile_ShouldReturn200_WhenAuthorized() throws Exception {
        when(guestProfileService.updateGuestProfile(eq(10L), any(GuestProfileRequest.class)))
                .thenReturn(mockResponse);

        mockMvc.perform(put("/api/users/10/profile")
                        .with(csrf()) // Necessário para simular requisições POST/PUT/PATCH em testes mockados
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(10L));
    }

    @Test
    @DisplayName("Deve atualizar parcialmente (PATCH) e retornar 200 OK se autorizado")
    @WithMockUser(roles = "MANAGER")
    void patchGuestProfile_ShouldReturn200_WhenAuthorized() throws Exception {
        when(guestProfileService.patchGuestProfile(eq(10L), any(GuestProfileRequest.class)))
                .thenReturn(mockResponse);

        mockMvc.perform(patch("/api/users/10/profile")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.internalNotes").value("Notas internas secretas"));
    }

    @Test
    @DisplayName("Deve negar PATCH se utilizador for GUEST")
    @WithMockUser(roles = "GUEST")
    void patchGuestProfile_ShouldReturn403_WhenUnauthorized() throws Exception {
        mockMvc.perform(patch("/api/users/10/profile")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(mockRequest)))
                .andExpect(status().isForbidden());
    }
}
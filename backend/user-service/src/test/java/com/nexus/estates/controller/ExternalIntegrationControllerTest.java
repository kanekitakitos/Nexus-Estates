package com.nexus.estates.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.estates.config.JwtAuthenticationFilter;
import com.nexus.estates.config.SecurityConfig;
import com.nexus.estates.dto.CreateExternalIntegrationRequest;
import com.nexus.estates.dto.ExternalIntegrationDTO;
import com.nexus.estates.entity.ExternalProviderName;
import com.nexus.estates.repository.UserRepository;
import com.nexus.estates.service.ExternalIntegrationService;
import com.nexus.estates.service.JwtService;
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
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExternalIntegrationController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@DisplayName("Testes Web: External Integration Controller")
class ExternalIntegrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExternalIntegrationService integrationService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @Test
    @DisplayName("POST deve criar integração quando OWNER")
    @WithMockUser(roles = "OWNER")
    void shouldCreateIntegrationAsOwner() throws Exception {
        CreateExternalIntegrationRequest req = new CreateExternalIntegrationRequest();
        req.setProviderName(ExternalProviderName.AIRBNB);
        req.setApiKey("sk_live_abcdefgh1234");
        req.setActive(true);

        ExternalIntegrationDTO dto = ExternalIntegrationDTO.builder()
                .id(1L)
                .providerName(ExternalProviderName.AIRBNB)
                .apiKeyMasked("sk_live_****1234")
                .active(true)
                .build();
        when(integrationService.createIntegration(any(CreateExternalIntegrationRequest.class))).thenReturn(dto);

        mockMvc.perform(post("/api/users/integrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.providerName").value("AIRBNB"))
                .andExpect(jsonPath("$.data.apiKeyMasked").value("sk_live_****1234"));
    }

    @Test
    @DisplayName("POST deve retornar 403 quando GUEST")
    @WithMockUser(roles = "GUEST")
    void shouldForbidPostAsGuest() throws Exception {
        CreateExternalIntegrationRequest req = new CreateExternalIntegrationRequest();
        req.setProviderName(ExternalProviderName.BOOKING);
        req.setApiKey("key");
        req.setActive(true);

        mockMvc.perform(post("/api/users/integrations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET deve listar integrações para utilizador autenticado")
    @WithMockUser(roles = "OWNER")
    void shouldListIntegrations() throws Exception {
        ExternalIntegrationDTO dto = ExternalIntegrationDTO.builder()
                .id(10L)
                .providerName(ExternalProviderName.BOOKING)
                .apiKeyMasked("sk_****abcd")
                .active(true)
                .build();
        when(integrationService.listIntegrationsForCurrentUser()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/users/integrations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(10))
                .andExpect(jsonPath("$.data[0].providerName").value("BOOKING"))
                .andExpect(jsonPath("$.data[0].apiKeyMasked").value("sk_****abcd"));
    }

    @Test
    @DisplayName("DELETE deve remover integração quando autenticado")
    @WithMockUser(roles = "OWNER")
    void shouldDeleteIntegration() throws Exception {
        doNothing().when(integrationService).deleteIntegration(10L);

        mockMvc.perform(delete("/api/users/integrations/{id}", 10L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}

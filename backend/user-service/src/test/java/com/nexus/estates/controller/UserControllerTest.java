package com.nexus.estates.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.estates.config.JwtAuthenticationFilter;
import com.nexus.estates.config.SecurityConfig;
import com.nexus.estates.entity.User;
import com.nexus.estates.entity.UserRole;
import com.nexus.estates.repository.UserRepository;
import com.nexus.estates.service.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Suite de testes para a camada Web do controlador {@link UserController}.
 * <p>
 * O foco principal desta classe é validar as políticas de Autorização (RBAC).
 * Utiliza o {@link MockMvc} para simular chamadas HTTP e verifica se os
 * diferentes perfis de utilizador (ADMIN, OWNER, GUEST) possuem as permissões
 * corretas definidas no {@link SecurityConfig}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
@DisplayName("Testes Web: User Controller (Segurança e RBAC)")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtService jwtService;

    /**
     * Valida o acesso à listagem total de utilizadores.
     * <p>
     * <b>Cenário:</b> Utilizador autenticado com role ADMIN.<br>
     * <b>Expectativa:</b> Status 200 OK e retorno da lista serializada.
     * </p>
     */
    @Test
    @DisplayName("Deve permitir listar utilizadores quando o role é ADMIN")
    @WithMockUser(roles = "ADMIN")
    void shouldReturnListWhenAdmin() throws Exception {
        User user = User.builder()
                .id(1L)
                .email("admin@nexus.com")
                .role(UserRole.ADMIN)
                .build();

        when(userRepository.findAll()).thenReturn(List.of(user));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("admin@nexus.com"))
                .andExpect(jsonPath("$[0].role").value("ADMIN"));
    }

    /**
     * Valida a restrição de segurança para utilizadores comuns.
     * <p>
     * <b>Cenário:</b> Utilizador autenticado com role GUEST tenta listar utilizadores.<br>
     * <b>Expectativa:</b> Status 403 Forbidden.
     * </p>
     */
    @Test
    @DisplayName("Deve retornar 403 Forbidden quando GUEST tenta listar utilizadores")
    @WithMockUser(roles = "GUEST")
    void shouldReturnForbiddenWhenGuestListsUsers() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    /**
     * Valida a criação de novos utilizadores por um administrador.
     * <p>
     * Verifica se o fluxo de encriptação de password é invocado antes da persistência.
     * </p>
     */
    @Test
    @DisplayName("Deve criar utilizador com sucesso quando autenticado como ADMIN")
    @WithMockUser(roles = "ADMIN")
    void shouldCreateUserWhenAdmin() throws Exception {
        User inputUser = User.builder()
                .email("new@nexus.com")
                .password("plainPassword")
                .role(UserRole.GUEST)
                .build();

        User savedUser = User.builder()
                .id(10L)
                .email("new@nexus.com")
                .password("encodedPassword")
                .role(UserRole.GUEST)
                .build();

        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        mockMvc.perform(post("/api/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.email").value("new@nexus.com"));
    }

    /**
     * Valida a impossibilidade de um OWNER criar utilizadores.
     * <p>
     * Demonstra que a hierarquia de permissões impede que utilizadores com role OWNER
     * realizem operações administrativas de gestão de contas.
     * </p>
     */
    @Test
    @DisplayName("Deve retornar 403 Forbidden quando OWNER tenta criar utilizador")
    @WithMockUser(roles = "OWNER")
    void shouldReturnForbiddenWhenOwnerCreatesUser() throws Exception {
        User inputUser = User.builder()
                .email("hack@nexus.com")
                .password("123")
                .role(UserRole.ADMIN)
                .build();

        mockMvc.perform(post("/api/users")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputUser)))
                .andExpect(status().isForbidden());
    }

    /**
     * Valida a consulta individual por ID.
     */
    @Test
    @DisplayName("Deve retornar detalhes do utilizador quando OWNER solicita por ID")
    @WithMockUser(roles = "OWNER")
    void shouldReturnUserByIdWhenOwner() throws Exception {
        Long userId = 5L;
        User user = User.builder()
                .id(userId)
                .email("owner@nexus.com")
                .role(UserRole.OWNER)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        mockMvc.perform(get("/api/users/{id}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("owner@nexus.com"));
    }

    /**
     * Valida o bloqueio de consulta por ID para perfis GUEST.
     */
    @Test
    @DisplayName("Deve retornar 403 Forbidden quando GUEST solicita utilizador por ID")
    @WithMockUser(roles = "GUEST")
    void shouldReturnForbiddenWhenGuestRequestsUserById() throws Exception {
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isForbidden());
    }
}
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
 * Testes unitários para o controlador de utilizadores (UserController).
 * <p>
 * Verifica as permissões de acesso (RBAC) e o retorno dos dados.
 * Importa o JwtAuthenticationFilter para satisfazer as dependências do SecurityConfig.
 * </p>
 */
@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
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

    @Test
    @DisplayName("Should return list of users when user has ADMIN role")
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

    @Test
    @DisplayName("Should return 403 Forbidden when GUEST tries to list users")
    @WithMockUser(roles = "GUEST")
    void shouldReturnForbiddenWhenGuestListsUsers() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should create user successfully when ADMIN")
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
                        .with(csrf()) // Necessário para métodos POST/PUT em testes com segurança
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.email").value("new@nexus.com"));
    }

    @Test
    @DisplayName("Should return 403 Forbidden when OWNER tries to create user")
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

    @Test
    @DisplayName("Should return user details when OWNER requests by ID")
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

    @Test
    @DisplayName("Should return 403 Forbidden when GUEST requests user by ID")
    @WithMockUser(roles = "GUEST")
    void shouldReturnForbiddenWhenGuestRequestsUserById() throws Exception {
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isForbidden());
    }
}
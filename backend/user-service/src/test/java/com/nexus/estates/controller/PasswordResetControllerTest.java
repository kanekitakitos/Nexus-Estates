package com.nexus.estates.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.estates.dto.ForgotPasswordRequest;
import com.nexus.estates.dto.ResetPasswordRequest;
import com.nexus.estates.service.PasswordResetService;
import com.nexus.estates.service.JwtService;
import com.nexus.estates.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PasswordResetController.class)
class PasswordResetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PasswordResetService passwordResetService;

    // Mocking beans required by SecurityConfig/JwtAuthenticationFilter
    @MockBean
    private JwtService jwtService;
    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser
    void forgotPassword_ShouldReturnOk_WhenEmailIsValid() throws Exception {
        // Arrange
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("user@example.com");

        doNothing().when(passwordResetService).initiatePasswordReset("user@example.com");

        // Act & Assert
        mockMvc.perform(post("/api/users/auth/password/forgot")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Se o email existir, as instruções foram enviadas."));
    }

    @Test
    @WithMockUser
    void resetPassword_ShouldReturnOk_WhenTokenIsValid() throws Exception {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setNewPassword("newPass123");

        doNothing().when(passwordResetService).resetPassword("valid-token", "newPass123");

        // Act & Assert
        mockMvc.perform(post("/api/users/auth/password/reset")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Password alterada com sucesso."));
    }
}

package com.nexus.estates.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.estates.dto.ForgotPasswordRequest;
import com.nexus.estates.dto.ResetPasswordRequest;
import com.nexus.estates.service.PasswordResetService;
import com.nexus.estates.service.JwtService;
import com.nexus.estates.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
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

/**
 * Testes de integração da camada Web para o {@link PasswordResetController}.
 * <p>
 * Esta classe utiliza o MockMvc para simular pedidos HTTP e validar o comportamento
 * dos endpoints de recuperação de password, garantindo que os contratos JSON
 * e os códigos de estado HTTP estão em conformidade com a especificação da API.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@WebMvcTest(PasswordResetController.class)
@DisplayName("Testes Web: Password Reset Controller")
class PasswordResetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PasswordResetService passwordResetService;

    /**
     * Mocks necessários para carregar o contexto de segurança (SecurityConfig).
     * Como o JwtAuthenticationFilter depende destes beans, eles precisam de ser mockados
     * mesmo que não sejam usados diretamente no teste do controller.
     */
    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Valida o endpoint de solicitação de recuperação de password.
     * <p>
     * <b>Cenário:</b> Envio de um email válido via POST.<br>
     * <b>Expectativa:</b> Retorno de HTTP 200 OK com uma mensagem de sucesso genérica
     * (mantendo o princípio de segurança de não confirmar se o email existe).
     * </p>
     */
    @Test
    @WithMockUser
    @DisplayName("Deve retornar 200 OK ao solicitar recuperação de password")
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

    /**
     * Valida o endpoint de redefinição final de password.
     * <p>
     * <b>Cenário:</b> Envio de um token e nova password válidos.<br>
     * <b>Expectativa:</b> Retorno de HTTP 200 OK confirmando a alteração.
     * </p>
     */
    @Test
    @WithMockUser
    @DisplayName("Deve retornar 200 OK ao redefinir password com token válido")
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
package com.nexus.estates.service;

import com.nexus.estates.entity.PasswordResetToken;
import com.nexus.estates.entity.User;
import com.nexus.estates.exception.InvalidTokenException;
import com.nexus.estates.repository.PasswordResetTokenRepository;
import com.nexus.estates.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Suite de testes unitários para o serviço {@link PasswordResetService}.
 * <p>
 * Valida a lógica de negócio do ciclo de vida de recuperação de passwords,
 * cobrindo a geração de tokens, validação de expiração e atualização de credenciais.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Testes de Unidade: Password Reset Service (Business Logic)")
class PasswordResetServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User user;
    private PasswordResetToken validToken;
    private PasswordResetToken expiredToken;

    /**
     * Configuração do cenário base para os testes.
     * Prepara utilizadores e tokens (válidos e expirados) para simular estados da BD.
     */
    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("oldPassword")
                .build();

        validToken = PasswordResetToken.builder()
                .token("valid-token-uuid")
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();

        expiredToken = PasswordResetToken.builder()
                .token("expired-token-uuid")
                .user(user)
                .expiryDate(LocalDateTime.now().minusMinutes(1))
                .build();
    }

    /**
     * Testa o início do processo de recuperação para um utilizador existente.
     * <p>
     * <b>Expectativa:</b> Limpar tokens antigos e gravar um novo token UUID.
     * </p>
     */
    @Test
    @DisplayName("Deve gerar novo token quando o email do utilizador existe")
    void initiatePasswordReset_ShouldGenerateToken_WhenUserExists() {
        String email = "test@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        passwordResetService.initiatePasswordReset(email);

        verify(tokenRepository).deleteByUser(user);
        verify(tokenRepository).save(any(PasswordResetToken.class));
    }

    /**
     * Testa o início do processo para um email inexistente.
     * <p>
     * <b>Expectativa:</b> Silêncio operacional (nada é gravado) para evitar leak de informação.
     * </p>
     */
    @Test
    @DisplayName("Não deve fazer nada quando o email não está registado (Privacy)")
    void initiatePasswordReset_ShouldDoNothing_WhenUserNotFound() {
        String email = "unknown@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        passwordResetService.initiatePasswordReset(email);

        verify(tokenRepository, never()).save(any());
    }

    /**
     * Valida a redefinição final com um token saudável.
     * <p>
     * <b>Expectativa:</b> Password atualizada, gravada e token eliminado da BD.
     * </p>
     */
    @Test
    @DisplayName("Deve atualizar a password e remover o token quando este é válido")
    void resetPassword_ShouldUpdatePassword_WhenTokenIsValid() {
        String token = "valid-token-uuid";
        String newPassword = "newStrongPassword";

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(validToken));
        when(passwordEncoder.encode(newPassword)).thenReturn("encodedNewPassword");

        passwordResetService.resetPassword(token, newPassword);

        assertEquals("encodedNewPassword", user.getPassword());
        verify(userRepository).save(user);
        verify(tokenRepository).delete(validToken);
    }

    /**
     * Valida a rejeição de tokens fora de prazo.
     * <p>
     * <b>Expectativa:</b> Lançar exceção e garantir que a password original não foi alterada.
     * </p>
     */
    @Test
    @DisplayName("Deve lançar exceção e apagar o token quando este já expirou")
    void resetPassword_ShouldThrowException_WhenTokenIsExpired() {
        String token = "expired-token-uuid";
        String newPassword = "newPassword";

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(expiredToken));

        assertThrows(InvalidTokenException.class, () -> passwordResetService.resetPassword(token, newPassword));

        verify(tokenRepository).delete(expiredToken);
        verify(userRepository, never()).save(any());
    }

    /**
     * Valida a tentativa de uso de um token que não existe na BD.
     */
    @Test
    @DisplayName("Deve lançar exceção quando o token fornecido não existe")
    void resetPassword_ShouldThrowException_WhenTokenNotFound() {
        String token = "invalid-token";
        String newPassword = "newPassword";

        when(tokenRepository.findByToken(token)).thenReturn(Optional.empty());

        assertThrows(InvalidTokenException.class, () -> passwordResetService.resetPassword(token, newPassword));
    }
}
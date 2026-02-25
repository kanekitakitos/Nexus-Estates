package com.nexus.estates.service;

import com.nexus.estates.dto.ForgotPasswordRequest;
import com.nexus.estates.dto.ResetPasswordRequest;
import com.nexus.estates.entity.PasswordResetToken;
import com.nexus.estates.entity.User;
import com.nexus.estates.exception.InvalidTokenException;
import com.nexus.estates.repository.PasswordResetTokenRepository;
import com.nexus.estates.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
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

@ExtendWith(MockitoExtension.class)
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

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L) // ID agora é Long
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

    @Test
    void forgotPassword_ShouldGenerateToken_WhenUserExists() {
        // Arrange
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("test@example.com");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        
        // Act
        String token = passwordResetService.forgotPassword(request);

        // Assert
        assertNotNull(token);
        verify(tokenRepository).deleteByUser(user); // Garante que tokens antigos são apagados
        verify(tokenRepository).save(any(PasswordResetToken.class)); // Garante que o novo token é salvo
    }

    @Test
    void forgotPassword_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("unknown@example.com");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> passwordResetService.forgotPassword(request));
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void resetPassword_ShouldUpdatePassword_WhenTokenIsValid() {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token-uuid");
        request.setNewPassword("newStrongPassword");

        when(tokenRepository.findByToken("valid-token-uuid")).thenReturn(Optional.of(validToken));
        when(passwordEncoder.encode("newStrongPassword")).thenReturn("encodedNewPassword");

        // Act
        passwordResetService.resetPassword(request);

        // Assert
        assertEquals("encodedNewPassword", user.getPassword()); // Verifica se a password foi atualizada no objeto User
        verify(userRepository).save(user); // Verifica se o user atualizado foi salvo
        verify(tokenRepository).delete(validToken); // Verifica se o token foi invalidado após uso
    }

    @Test
    void resetPassword_ShouldThrowException_WhenTokenIsExpired() {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("expired-token-uuid");
        request.setNewPassword("newPassword");

        when(tokenRepository.findByToken("expired-token-uuid")).thenReturn(Optional.of(expiredToken));

        // Act & Assert
        assertThrows(InvalidTokenException.class, () -> passwordResetService.resetPassword(request));
        
        verify(tokenRepository).delete(expiredToken); // Deve apagar o token expirado
        verify(userRepository, never()).save(any()); // NÃO deve salvar o user
    }

    @Test
    void resetPassword_ShouldThrowException_WhenTokenNotFound() {
        // Arrange
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("invalid-token");

        when(tokenRepository.findByToken("invalid-token")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(InvalidTokenException.class, () -> passwordResetService.resetPassword(request));
    }
}

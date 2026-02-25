package com.nexus.estates.service;

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

    @Test
    void initiatePasswordReset_ShouldGenerateToken_WhenUserExists() {
        // Arrange
        String email = "test@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        
        // Act
        passwordResetService.initiatePasswordReset(email);

        // Assert
        verify(tokenRepository).deleteByUser(user);
        verify(tokenRepository).save(any(PasswordResetToken.class));
    }

    @Test
    void initiatePasswordReset_ShouldDoNothing_WhenUserNotFound() {
        // Arrange
        String email = "unknown@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act
        passwordResetService.initiatePasswordReset(email);

        // Assert
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void resetPassword_ShouldUpdatePassword_WhenTokenIsValid() {
        // Arrange
        String token = "valid-token-uuid";
        String newPassword = "newStrongPassword";

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(validToken));
        when(passwordEncoder.encode(newPassword)).thenReturn("encodedNewPassword");

        // Act
        passwordResetService.resetPassword(token, newPassword);

        // Assert
        assertEquals("encodedNewPassword", user.getPassword());
        verify(userRepository).save(user);
        verify(tokenRepository).delete(validToken);
    }

    @Test
    void resetPassword_ShouldThrowException_WhenTokenIsExpired() {
        // Arrange
        String token = "expired-token-uuid";
        String newPassword = "newPassword";

        when(tokenRepository.findByToken(token)).thenReturn(Optional.of(expiredToken));

        // Act & Assert
        assertThrows(InvalidTokenException.class, () -> passwordResetService.resetPassword(token, newPassword));
        
        verify(tokenRepository).delete(expiredToken);
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_ShouldThrowException_WhenTokenNotFound() {
        // Arrange
        String token = "invalid-token";
        String newPassword = "newPassword";

        when(tokenRepository.findByToken(token)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(InvalidTokenException.class, () -> passwordResetService.resetPassword(token, newPassword));
    }
}

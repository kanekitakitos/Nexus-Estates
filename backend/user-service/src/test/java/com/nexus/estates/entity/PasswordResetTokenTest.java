package com.nexus.estates.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class PasswordResetTokenTest {

    @Test
    void isExpired_ShouldReturnTrue_WhenDateIsInPast() {
        // Arrange
        PasswordResetToken token = PasswordResetToken.builder()
                .expiryDate(LocalDateTime.now().minusMinutes(1)) // Expirou há 1 minuto
                .build();

        // Act & Assert
        assertTrue(token.isExpired(), "O token deveria estar expirado");
    }

    @Test
    void isExpired_ShouldReturnFalse_WhenDateIsInFuture() {
        // Arrange
        PasswordResetToken token = PasswordResetToken.builder()
                .expiryDate(LocalDateTime.now().plusMinutes(15)) // Válido por mais 15 minutos
                .build();

        // Act & Assert
        assertFalse(token.isExpired(), "O token deveria estar válido");
    }
}

package com.nexus.estates.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para a lógica de domínio da entidade {@link PasswordResetToken}.
 * <p>
 * O foco destes testes é validar o comportamento intrínseco da entidade,
 * especificamente o cálculo de expiração temporal, garantindo a integridade
 * das regras de segurança antes mesmo de qualquer interação com a base de dados.
 * </p>
 * * @author Nexus Estates Team
 * @version 1.0
 */
@DisplayName("Testes de Unidade: Entidade PasswordResetToken")
class PasswordResetTokenTest {

    /**
     * Valida o cenário onde o token já ultrapassou o tempo de vida útil (TTL).
     * <p>
     * <b>Cenário:</b> Data de expiração definida para 1 minuto atrás.<br>
     * <b>Expectativa:</b> O método {@code isExpired()} deve retornar {@code true}.
     * </p>
     */
    @Test
    @DisplayName("Deve confirmar expiração quando a data está no passado")
    void isExpired_ShouldReturnTrue_WhenDateIsInPast() {
        // Arrange (Preparação)
        PasswordResetToken token = PasswordResetToken.builder()
                .expiryDate(LocalDateTime.now().minusMinutes(1))
                .build();

        // Act & Assert (Ação e Verificação)
        assertTrue(token.isExpired(), "O token deveria estar expirado");
    }

    /**
     * Valida o cenário onde o token ainda está dentro do prazo de validade.
     * <p>
     * <b>Cenário:</b> Data de expiração definida para 15 minutos no futuro.<br>
     * <b>Expectativa:</b> O método {@code isExpired()} deve retornar {@code false}.
     * </p>
     */
    @Test
    @DisplayName("Deve confirmar validade quando a data está no futuro")
    void isExpired_ShouldReturnFalse_WhenDateIsInFuture() {
        // Arrange
        PasswordResetToken token = PasswordResetToken.builder()
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();

        // Act & Assert
        assertFalse(token.isExpired(), "O token deveria estar válido");
    }
}
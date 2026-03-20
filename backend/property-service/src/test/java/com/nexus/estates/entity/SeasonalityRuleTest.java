package com.nexus.estates.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para a entidade {@link SeasonalityRule}.
 * <p>
 * Valida a lógica de negócio encapsulada na entidade, incluindo verificações
 * de intervalo de datas, dias da semana e canais de venda.
 * </p>
 */
class SeasonalityRuleTest {

    @Test
    @DisplayName("isActiveOn: Deve retornar true para data dentro do intervalo")
    void isActiveOn_ShouldReturnTrue_WhenDateIsWithinRange() {
        // Arrange
        SeasonalityRule rule = new SeasonalityRule();
        rule.setStartDate(LocalDate.of(2024, 6, 1));
        rule.setEndDate(LocalDate.of(2024, 6, 30));

        // Act & Assert
        assertTrue(rule.isActiveOn(LocalDate.of(2024, 6, 1)), "Deve estar ativo na data de início");
        assertTrue(rule.isActiveOn(LocalDate.of(2024, 6, 15)), "Deve estar ativo no meio do intervalo");
        assertTrue(rule.isActiveOn(LocalDate.of(2024, 6, 30)), "Deve estar ativo na data de fim");
    }

    @Test
    @DisplayName("isActiveOn: Deve retornar false para data fora do intervalo")
    void isActiveOn_ShouldReturnFalse_WhenDateIsOutsideRange() {
        // Arrange
        SeasonalityRule rule = new SeasonalityRule();
        rule.setStartDate(LocalDate.of(2024, 6, 1));
        rule.setEndDate(LocalDate.of(2024, 6, 30));

        // Act & Assert
        assertFalse(rule.isActiveOn(LocalDate.of(2024, 5, 31)), "Não deve estar ativo antes do início");
        assertFalse(rule.isActiveOn(LocalDate.of(2024, 7, 1)), "Não deve estar ativo após o fim");
    }

    @Test
    @DisplayName("isActiveOn: Deve validar dia da semana quando especificado")
    void isActiveOn_ShouldCheckDayOfWeek_WhenSpecified() {
        // Arrange
        SeasonalityRule rule = new SeasonalityRule();
        rule.setStartDate(LocalDate.of(2024, 6, 1)); // Sábado
        rule.setEndDate(LocalDate.of(2024, 6, 30));
        rule.setDayOfWeek(DayOfWeek.SATURDAY);

        // Act & Assert
        // 1 de Junho de 2024 foi Sábado
        assertTrue(rule.isActiveOn(LocalDate.of(2024, 6, 1)), "Deve estar ativo ao Sábado");
        
        // 2 de Junho de 2024 foi Domingo
        assertFalse(rule.isActiveOn(LocalDate.of(2024, 6, 2)), "Não deve estar ativo ao Domingo");
    }

    @Test
    @DisplayName("matchesChannel: Deve retornar true para correspondência correta")
    void matchesChannel_ShouldReturnTrue_WhenChannelMatches() {
        // Arrange
        SeasonalityRule rule = new SeasonalityRule();
        rule.setChannel("Airbnb");

        // Act & Assert
        assertTrue(rule.matchesChannel("Airbnb"), "Deve corresponder ao canal exato");
        assertTrue(rule.matchesChannel("airbnb"), "Deve corresponder ignorando maiúsculas/minúsculas");
    }

    @Test
    @DisplayName("matchesChannel: Deve retornar true se a regra não tiver canal (regra global)")
    void matchesChannel_ShouldReturnTrue_WhenRuleHasNoChannel() {
        // Arrange
        SeasonalityRule rule = new SeasonalityRule();
        rule.setChannel(null);

        // Act & Assert
        assertTrue(rule.matchesChannel("Airbnb"));
        assertTrue(rule.matchesChannel("Booking"));
    }

    @Test
    @DisplayName("validateDateRange: Deve lançar exceção se data fim for anterior ao início")
    void validateDateRange_ShouldThrowException_WhenRangeIsInvalid() {
        // Arrange
        SeasonalityRule rule = new SeasonalityRule();
        rule.setStartDate(LocalDate.of(2024, 6, 10));
        rule.setEndDate(LocalDate.of(2024, 6, 1)); // Inválido: Fim antes do Início
        rule.setPriceModifier(BigDecimal.ONE);

        // Como o método validateDateRange é privado e chamado pelo ciclo de vida JPA (@PrePersist),
        // em teste unitário puro não conseguimos invocá-lo diretamente a menos que usemos reflexão 
        // ou um teste de integração. 
        // No entanto, podemos simular a lógica aqui ou testar via PropertyService se fosse um teste de integração.
        
        // Para este teste unitário simples, vamos validar a lógica se a tivéssemos exposto ou 
        // se usássemos reflexão. Vou usar reflexão para garantir que a lógica privada está correta.
        
        Exception exception = assertThrows(Exception.class, () -> {
            java.lang.reflect.Method method = SeasonalityRule.class.getDeclaredMethod("validateDateRange");
            method.setAccessible(true);
            try {
                method.invoke(rule);
            } catch (java.lang.reflect.InvocationTargetException e) {
                throw (Exception) e.getTargetException();
            }
        });

        assertEquals("A data de fim não pode ser anterior à data de início.", exception.getMessage());
    }
}
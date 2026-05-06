package com.nexus.estates.common.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

/**
 * Resposta unificada contendo o resultado da validação e a cotação de preço.
 *
 * @param valid Indica se a reserva é possível segundo as regras da propriedade.
 * @param totalPrice O preço total calculado (incluindo taxas e sazonalidade) se for válido.
 * @param currency A moeda do preço (ex: "EUR").
 * @param validationErrors Lista de mensagens de erro caso a validação falhe (ex: "Mínimo 3 noites").
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Schema(description = "Resultado da validação e cotação")
public record PropertyQuoteResponse(
        @Schema(description = "Reserva permitida?", example = "true")
        boolean valid,

        @Schema(description = "Preço total calculado", example = "450.00")
        BigDecimal totalPrice,

        @Schema(description = "Moeda", example = "EUR")
        String currency,

        @Schema(description = "Erros de validação (se valid=false)")
        List<String> validationErrors
) {
    /**
     * Cria uma resposta de sucesso para uma cotação válida
     * @param price O preço total calculado
     * @param currency A moeda do preço
     * @return Uma instância de {@link PropertyQuoteResponse} com valid=true e sem erros
     */
    public static PropertyQuoteResponse success(BigDecimal price, String currency) {
        return new PropertyQuoteResponse(true, price, currency, List.of());
    }

    /**
     * Cria uma resposta de falha quando a reserva viola as regras da propriedade
     * @param errors Lista de mensagens detalhando as regras violadas
     * @return Uma instância de {@link PropertyQuoteResponse} com valid=false e a lista de erros
     */
    public static PropertyQuoteResponse failure(List<String> errors) {
        return new PropertyQuoteResponse(false, null, null, errors);
    }
}
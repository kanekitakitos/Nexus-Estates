package com.nexus.estates.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Objeto padrão para representação de detalhes de erros na API.
 * <p>
 * Este DTO é utilizado dentro do {@link ApiResponse} quando uma operação falha.
 * Inclui campos para timestamp, status HTTP, mensagens de erro e, opcionalmente,
 * um mapa de erros de validação de campos.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 */
@Data
@Builder
@Jacksonized
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Objeto que detalha uma falha ocorrida na API.")
public class ErrorResponse {

    @Schema(description = "Timestamp exato de quando o erro ocorreu (UTC).", example = "2026-02-15T10:30:00")
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    @Schema(description = "Código de status HTTP.", example = "400")
    private int status;

    @Schema(description = "Descrição curta do status HTTP.", example = "Bad Request")
    private String error;

    @Schema(description = "Mensagem detalhada sobre a causa do erro.", example = "O email é obrigatório.")
    private String message;

    @Schema(description = "O endpoint que originou o erro.", example = "/api/v1/users/auth/register")
    private String path;

    @Schema(description = "Mapa de erros de validação, onde a chave é o campo e o valor é a mensagem de erro.",
            example = "{\"email\": \"O formato do email é inválido.\", \"password\": \"A password é obrigatória.\"}")
    private Map<String, String> validationErrors;
}

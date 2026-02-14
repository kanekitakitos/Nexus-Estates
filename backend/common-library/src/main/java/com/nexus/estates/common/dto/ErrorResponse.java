package com.nexus.estates.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDateTime;

/**
 * Objeto padrão para representação de erros na API.
 * <p>
 * Segue a estrutura recomendada pelo RFC 7807 (Problem Details for HTTP APIs),
 * fornecendo contexto rico sobre falhas ocorridas durante o processamento de pedidos.
 * </p>
 *
 * @author Nexus Estates Team
 */
@Data
@Builder
@Jacksonized
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    /** Timestamp exato de quando o erro ocorreu (UTC). */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /** Código de status HTTP (ex: 400, 404, 500). */
    private int status;

    /** Descrição curta do erro (ex: "Bad Request"). */
    private String error;

    /** Mensagem detalhada para o cliente/developer. */
    private String message;

    /** O endpoint que originou o erro. */
    private String path;
}
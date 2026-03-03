package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Objeto de Transferência de Dados (DTO) para a resposta de autenticação.
 * <p>
 *     Este DTO é retornado após um login ou registo bem-sucedido, contendo
 *     o token JWT e as informações essenciais do utilizador.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resposta contendo o token de autenticação e detalhes do utilizador")
public class AuthResponde {

    @Schema(description = "Token JWT para autenticação em pedidos subsequentes", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String token;

    @Schema(description = "Identificador único do utilizador", example = "1")
    private Long id;

    @Schema(description = "Endereço de email do utilizador", example = "user@example.com")
    private String email;

    @Schema(description = "Papel (Role) do utilizador no sistema", example = "GUEST")
    private String role;
}

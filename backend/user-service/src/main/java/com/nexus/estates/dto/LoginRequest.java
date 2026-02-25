package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.AllArgsConstructor;

/**
 * Objeto de Transferência de Dados (DTO) para o pedido de login.
 * <p>
 *     Contém as credenciais necessárias para autenticar um utilizador.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 */
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@Schema(description = "Requisição de login com credenciais do utilizador")
public class LoginRequest {

    @Schema(description = "Email do utilizador", example = "user@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @Schema(description = "Password do utilizador", example = "password123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;
}

package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para o pedido de recuperação de password.
 */
@Data
@NoArgsConstructor
@Schema(description = "Pedido de recuperação de password")
public class ForgotPasswordRequest {

    @Schema(description = "Email do utilizador que esqueceu a password", example = "user@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;
}

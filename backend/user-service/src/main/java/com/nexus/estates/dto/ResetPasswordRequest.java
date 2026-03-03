package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para redefinição de password.
 */
@Data
@NoArgsConstructor
@Schema(description = "Pedido de redefinição de password")
public class ResetPasswordRequest {

    @Schema(description = "Token de recuperação recebido por email", example = "123e4567-e89b-12d3-a456-426614174000", requiredMode = Schema.RequiredMode.REQUIRED)
    private String token;

    @Schema(description = "Nova password segura", example = "NewStrongPass!123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String newPassword;
}

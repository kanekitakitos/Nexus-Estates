package com.nexus.estates.dto;

import com.nexus.estates.entity.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * Objeto de Transferência de Dados (DTO) para o registo de novos utilizadores.
 * <p>
 *     Encapsula os dados necessários para criar uma nova conta no sistema.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 */
@Data
@Schema(description = "Requisição de registo de novo utilizador")
public class RegisterRequest {

    @Schema(description = "Email do utilizador (deve ser único)", example = "novo.user@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @Schema(description = "Password segura", example = "StrongPass!123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    @Schema(description = "Número de telefone para contacto", example = "+351912345678")
    private String phone;

    @Schema(description = "Papel do utilizador no sistema", example = "GUEST")
    private UserRole role;
}

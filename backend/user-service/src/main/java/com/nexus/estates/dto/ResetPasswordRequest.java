package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Objeto de Transferência de Dados (DTO) para a conclusão da redefinição de password.
 * <p>
 * Este DTO transporta a prova de posse do acesso ao email (Token) e a nova
 * credencial definida pelo utilizador. É o passo final do fluxo iniciado
 * pelo {@link ForgotPasswordRequest}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 */
@Data
@NoArgsConstructor
@Schema(description = "Pedido de redefinição de password")
public class ResetPasswordRequest {

    /**
     * Identificador único e temporário enviado para o e-mail do utilizador.
     * <p>
     * Deve ser validado pelo backend quanto à sua existência, pertença ao utilizador
     * e prazo de validade (TTL) antes de permitir a alteração da password.
     * </p>
     */
    @Schema(
            description = "Token de recuperação recebido por email",
            example = "123e4567-e89b-12d3-a456-426614174000",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String token;

    /**
     * A nova password em texto limpo que substituirá a anterior.
     * <p>
     * Esta string deve ser submetida a validações de complexidade no backend
     * e encriptada via PasswordEncoder antes de ser persistida na base de dados.
     * </p>
     */
    @Schema(
            description = "Nova password segura",
            example = "NewStrongPass!123",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String newPassword;
}
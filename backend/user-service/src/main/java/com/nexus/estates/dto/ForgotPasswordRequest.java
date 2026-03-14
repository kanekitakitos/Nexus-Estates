package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Objeto de Transferência de Dados (DTO) para o processo de recuperação de credenciais.
 * <p>
 * Este DTO é utilizado no ponto de entrada do fluxo de "Esqueci-me da password",
 * servindo para identificar a conta que requer a redefinição de segurança.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 */
@Data
@NoArgsConstructor
@Schema(description = "Pedido de recuperação de password")
public class ForgotPasswordRequest {

    /**
     * O endereço de email associado à conta do utilizador.
     * <p>
     * Após a receção deste pedido, o sistema deve validar a existência do email
     * e despoletar o envio de um token de recuperação por via externa (E-mail).
     * </p>
     */
    @Schema(
            description = "Email do utilizador que esqueceu a password",
            example = "user@example.com",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String email;
}
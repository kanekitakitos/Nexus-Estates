package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Objeto de Transferência de Dados (DTO) para o pedido de login.
 * <p>
 * Contém as credenciais necessárias para autenticar um utilizador, com validações
 * para garantir que os campos não estão vazios e que o email tem um formato válido.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 */
@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@Schema(description = "Requisição de login com as credenciais do utilizador.")
public class LoginRequest {

    @Schema(description = "Email do utilizador registado.", example = "user@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "O email é obrigatório.")
    @Email(message = "O formato do email é inválido.")
    private String email;

    @Schema(description = "Password do utilizador.", example = "password123", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "A password é obrigatória.")
    private String password;
}

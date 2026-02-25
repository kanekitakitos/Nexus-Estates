package com.nexus.estates.dto;

import com.nexus.estates.entity.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Objeto de Transferência de Dados (DTO) para o registo de novos utilizadores.
 * <p>
 * Encapsula os dados necessários para criar uma nova conta, aplicando regras de validação
 * para garantir a integridade dos dados de entrada.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 */
@Data
@Schema(description = "Requisição para o registo de um novo utilizador.")
public class RegisterRequest {

    @Schema(description = "Endereço de email do utilizador. Deve ser único e válido.", example = "novo.user@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "O email é obrigatório.")
    @Email(message = "O formato do email é inválido.")
    private String email;

    @Schema(description = "Password de acesso. Deve ter no mínimo 8 caracteres.", example = "StrongPass!123", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "A password é obrigatória.")
    @Size(min = 8, message = "A password deve ter no mínimo 8 caracteres.")
    private String password;

    @Schema(description = "Número de telefone para contacto.", example = "+351912345678", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "O número de telefone é obrigatório.")
    private String phone;

    @Schema(description = "Papel do utilizador no sistema. Se não for fornecido, o padrão é 'GUEST'.", example = "GUEST")
    private UserRole role;
}

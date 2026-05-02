package com.nexus.estates.dto;

import com.nexus.estates.entity.AccessLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * Payload de atualização parcial de permissões (PATCH).
 *
 * <p>Usado para alterar apenas o {@code accessLevel} de um utilizador
 * numa propriedade específica.</p>
 */
@Schema(description = "Payload para atualização parcial de uma permissão de propriedade.")
public record PropertyPermissionPatchRequest(
        @NotNull
        @Schema(description = "Novo nível de acesso", example = "MANAGER")
        AccessLevel accessLevel
) {}


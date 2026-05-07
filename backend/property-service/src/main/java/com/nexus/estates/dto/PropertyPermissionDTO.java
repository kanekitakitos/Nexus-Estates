package com.nexus.estates.dto;

import com.nexus.estates.entity.AccessLevel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para expor e receber permissões (ACL) de uma propriedade.
 *
 * <p>Este contrato é independente do {@link com.nexus.estates.entity.PropertyPermission} (entidade JPA)
 * para evitar acoplamento a detalhes de persistência.</p>
 *
 * <p>Nota importante:</p>
 * <ul>
 *   <li>O identificador do utilizador é {@code userId} (não email).</li>
 *   <li>O nível de acesso é baseado em {@link AccessLevel} (PRIMARY_OWNER, MANAGER, STAFF).</li>
 * </ul>
 */
@Schema(description = "Permissão de acesso de um utilizador a uma propriedade.")
public record PropertyPermissionDTO(
        @NotNull
        @Schema(description = "ID do utilizador", example = "1013")
        Long userId,

        @NotNull
        @Schema(description = "Nível de acesso", example = "MANAGER")
        AccessLevel accessLevel
) {}


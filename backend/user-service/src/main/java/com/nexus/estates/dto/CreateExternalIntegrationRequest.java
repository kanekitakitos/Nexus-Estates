package com.nexus.estates.dto;

import com.nexus.estates.entity.ExternalProviderName;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO de criação de integração externa.
 * <p>
 * Recebe a API Key em texto limpo; a encriptação é aplicada na persistência.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Data
public class CreateExternalIntegrationRequest {
    @NotNull
    @Schema(description = "Provider externo (AIRBNB, BOOKING, ...)")
    private ExternalProviderName providerName;
    @NotBlank
    @Schema(description = "API Key em texto limpo (será encriptada ao persistir)")
    private String apiKey;
    @Schema(description = "Estado ativo", defaultValue = "true")
    private boolean active = true;
}

package com.nexus.estates.dto;

import com.nexus.estates.entity.ExternalProviderName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

/**
 * DTO de leitura para integrações externas.
 * <p>
 * Garante que a API Key é sempre devolvida mascarada.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Data
@Builder
public class ExternalIntegrationDTO {
    @Schema(description = "Identificador da integração")
    private Long id;
    @Schema(description = "Nome do provider externo")
    private ExternalProviderName providerName;
    @Schema(description = "Chave API mascarada")
    private String apiKeyMasked;
    @Schema(description = "Estado ativo/inativo")
    private boolean active;
}

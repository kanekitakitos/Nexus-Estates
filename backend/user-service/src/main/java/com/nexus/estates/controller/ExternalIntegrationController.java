package com.nexus.estates.controller;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.dto.CreateExternalIntegrationRequest;
import com.nexus.estates.dto.ExternalIntegrationDTO;
import com.nexus.estates.service.ExternalIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/integrations")
@RequiredArgsConstructor
@Tag(name = "Integrações Externas", description = "CRUD de integrações externas (API Keys encriptadas)")
/**
 * Controlador REST para gestão de credenciais de integrações externas.
 * <p>
 * Exponde endpoints para criação, listagem e remoção de integrações de canais
 * como Airbnb e Booking, aplicando masking nas respostas e exigindo JWT.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 */
public class ExternalIntegrationController {

    private final ExternalIntegrationService integrationService;

    /**
     * Regista uma API Key para um provider externo (encriptada em repouso).
     *
     * @param request payload de criação contendo providerName, apiKey e active
     * @return resposta com DTO e masking aplicado
     * @author Nexus Estates Team
     * @version 1.0
     */
    @Operation(summary = "Criar integração", description = "Regista uma API Key (encriptada) para um provider externo")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Integração criada com sucesso",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class)))
    @PostMapping
    @PreAuthorize("hasRole('OWNER') or hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ExternalIntegrationDTO>> create(@Valid @RequestBody CreateExternalIntegrationRequest request) {
        ExternalIntegrationDTO dto = integrationService.createIntegration(request);
        return ResponseEntity.ok(ApiResponse.success(dto, "Integração criada."));
    }

    /**
     * Lista integrações do utilizador autenticado devolvendo apenas a chave mascarada.
     *
     * @return lista de integrações com masking
     */
    @Operation(summary = "Listar integrações", description = "Lista integrações do utilizador com a API Key mascarada")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Listagem efetuada",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class)))
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<ExternalIntegrationDTO>>> list() {
        List<ExternalIntegrationDTO> list = integrationService.listIntegrationsForCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(list, "Integrações recuperadas."));
    }

    /**
     * Remove uma integração por identificador, garantindo pertença ao utilizador autenticado.
     *
     * @param id identificador da integração
     * @return operação concluída
     */
    @Operation(summary = "Eliminar integração", description = "Remove uma integração por id, se pertencer ao utilizador")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Integração eliminada",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class)))
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        integrationService.deleteIntegration(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Integração eliminada."));
    }
}

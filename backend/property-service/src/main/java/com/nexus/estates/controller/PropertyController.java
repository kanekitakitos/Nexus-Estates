package com.nexus.estates.controller;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.dto.CreatePropertyRequest;
import com.nexus.estates.entity.Property;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.service.PropertyService;
import com.nexus.estates.service.ImageStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

/**
 * REST Controller responsável pela gestão de propriedades.
 *
 * <p>Expõe endpoints para criação e consulta de propriedades no sistema.</p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 * @since 2026-02-13
 */
@RestController
@RequestMapping("/api/properties")
@Tag(name = "Property API", description = "Gestão de propriedades da Nexus Estates")
public class PropertyController {

    private final PropertyService service;
    private final PropertyRepository repository;

    private final ImageStorageService imageStorageService;

    /**
     * Construtor do controller.
     *
     * @param service serviço responsável pela lógica de negócio das propriedades
     * @param imageStorageService serviço responsável pela integração com armazenamento de imagens
     */
    public PropertyController(PropertyService service, ImageStorageService imageStorageService, PropertyRepository repository) {
        this.service = service;
        this.imageStorageService = imageStorageService;
        this.repository = repository;
    }

    /**
     * Gera parâmetros de upload para o serviço de armazenamento de forma assíncrona.
     *
     * <p>Permite que o frontend faça upload de fotos diretamente para a cloud
     * de forma segura, sem sobrecarregar a thread principal do servidor.</p>
     *
     * @return CompletableFuture com os parâmetros de autenticação
     */
    @Operation(summary = "Obter parâmetros de upload", description = "Gera uma assinatura segura para upload de fotos. Requer role OWNER.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Parâmetros gerados com sucesso"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acesso negado - Requer permissão de OWNER")
    })
    @GetMapping("/upload-params")
    @PreAuthorize("hasRole('OWNER')")
    public CompletableFuture<ResponseEntity<ApiResponse<Map<String, Object>>>> getUploadParams() {
        return CompletableFuture.supplyAsync(() ->
                ResponseEntity.ok(ApiResponse.success(imageStorageService.getUploadParameters(), "Parâmetros de upload gerados."))
        );
    }

    /**
     * Cria uma propriedade.
     *
     * @param request dados da propriedade a criar via DTO
     * @return propriedade criada com status 201 Created
     */
    @Operation(summary = "Criar nova propriedade", description = "Cria uma propriedade e envia email de confirmação. Suporta múltiplos idiomas na descrição.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Propriedade criada com sucesso"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dados de entrada inválidos ou campos obrigatórios em falta")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<Property>> create(@Valid @RequestBody CreatePropertyRequest request) {
        Property property = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(property, "Propriedade criada com sucesso."));
    }

    /**
     * Atualiza a lista de comodidades de uma propriedade.
     *
     * <p>Este endpoint permite associar ou remover características da propriedade
     * (ex: WiFi, Piscina) de forma dinâmica.</p>
     *
     * @param id identificador único da propriedade
     * @param amenityIds conjunto de IDs das comodidades a associar
     * @return propriedade atualizada de forma assíncrona
     */
    @Operation(summary = "Atualizar comodidades", description = "Substitui as comodidades da casa pelos IDs fornecidos. Requer role OWNER.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Comodidades atualizadas com sucesso"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Propriedade não encontrada"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @PutMapping("/{id}/amenities")
    @PreAuthorize("hasRole('OWNER')")
    public CompletableFuture<ResponseEntity<ApiResponse<Property>>> updateAmenities(
            @Parameter(description = "ID da propriedade") @PathVariable Long id,
            @RequestBody Set<Long> amenityIds) {
        return CompletableFuture.supplyAsync(() -> {
            Property property = service.updateAmenities(id, amenityIds);
            return ResponseEntity.ok(ApiResponse.success(property, "Comodidades atualizadas com sucesso."));
        });
    }

    /**
     * Lista todas as propriedades registadas.
     *
     * @return lista de propriedades
     */
    @Operation(summary = "Listar todas as propriedades", description = "Retorna uma lista de todos os imóveis")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Sucesso ao retornar lista")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Property>>> listAll() {
        List<Property> properties = service.findAll();
        return ResponseEntity.ok(ApiResponse.success(properties, "Propriedades listadas com sucesso."));
    }

    /**
     * Obtém os detalhes de uma propriedade pelo ID.
     *
     * @param id identificador da propriedade
     * @return propriedade encontrada
     */
    @Operation(summary = "Obter propriedade por ID", description = "Retorna os detalhes de um imóvel específico")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Imóvel encontrado"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Imóvel não existe")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Property>> getById(
            @Parameter(description = "ID único da propriedade", example = "1")
            @PathVariable Long id) {
        Property property = service.findById(id);
        return ResponseEntity.ok(ApiResponse.success(property, "Propriedade encontrada."));
    }



    public BigDecimal getPriceById(Long id) {
        return repository.findPriceById(id)
                .orElseThrow(() -> new EntityNotFoundException("Propriedade não encontrada com o ID: " + id));
    }
}

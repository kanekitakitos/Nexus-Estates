package com.nexus.estates.controller;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.common.dto.PropertyQuoteRequest;
import com.nexus.estates.common.dto.PropertyQuoteResponse;
import com.nexus.estates.dto.CreatePropertyRequest;
import com.nexus.estates.dto.ExpandedPropertyResponse;
import com.nexus.estates.dto.UpdatePropertyRequest;
import com.nexus.estates.common.dto.PropertyRuleDTO;
import com.nexus.estates.common.dto.RuleOverrideDTO;
import com.nexus.estates.common.dto.SeasonalityRuleDTO;
import com.nexus.estates.entity.Property;
import com.nexus.estates.entity.PropertyChangeLog;
import com.nexus.estates.entity.RuleOverride;
import com.nexus.estates.repository.PropertyRepository;
import com.nexus.estates.service.PropertyService;
import com.nexus.estates.service.repository.ImageStorageService;
import com.nexus.estates.service.PropertyRuleService;
import com.nexus.estates.service.SeasonalityRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * REST Controller responsável pela gestão de propriedades e suas regras associadas.
 *
 * <p>Expõe endpoints para criação, consulta e atualização de propriedades,
 * bem como para a gestão das suas regras operacionais.</p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 */
@RestController
@RequestMapping("/api/properties")
@Tag(name = "Property API", description = "Gestão de propriedades e regras da Nexus Estates")
public class PropertyController {

    private final PropertyService service;
    private final PropertyRepository repository;
    private final PropertyRuleService ruleService;
    private final SeasonalityRuleService seasonalityRuleService;

    private final ImageStorageService imageStorageService;

    /**
     * Construtor do controller.
     *
     * @param service serviço responsável pela lógica de negócio das propriedades
     * @param imageStorageService serviço responsável pela integração com armazenamento de imagens
     * @param repository repositório de propriedades
     * @param ruleService serviço de gestão de regras
     * @param seasonalityRuleService serviço de gestão de regras de sazonalidade
     */
    public PropertyController(
            PropertyService service,
            ImageStorageService imageStorageService,
            PropertyRepository repository,
            PropertyRuleService ruleService,
            SeasonalityRuleService seasonalityRuleService
    ) {
        this.service = service;
        this.imageStorageService = imageStorageService;
        this.repository = repository;
        this.ruleService = ruleService;
        this.seasonalityRuleService = seasonalityRuleService;
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
    @Operation(summary = "Criar nova propriedade", description = "Cria uma propriedade e as suas regras padrão. Suporta múltiplos idiomas na descrição.")
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
     * Adiciona uma comodidade específica a uma propriedade.
     */
    @Operation(summary = "Adicionar comodidade", description = "Associa uma nova comodidade à propriedade sem remover as existentes. Requer role OWNER.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Comodidade adicionada com sucesso"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Propriedade ou Comodidade não encontrada")
    })
    @PostMapping("/{id}/amenities/{amenityId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Property>> addAmenity(
            @Parameter(description = "ID da propriedade") @PathVariable Long id,
            @Parameter(description = "ID da comodidade") @PathVariable Long amenityId) {
        Property property = service.addAmenity(id, amenityId);
        return ResponseEntity.ok(ApiResponse.success(property, "Comodidade adicionada com sucesso."));
    }

    /**
     * Remove uma comodidade específica de uma propriedade.
     */
    @Operation(summary = "Remover comodidade da propriedade", description = "Desassocia uma comodidade específica da propriedade. Requer role OWNER.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Comodidade removida com sucesso"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Propriedade ou Comodidade não encontrada")
    })
    @DeleteMapping("/{id}/amenities/{amenityId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Property>> removeAmenity(
            @Parameter(description = "ID da propriedade") @PathVariable Long id,
            @Parameter(description = "ID da comodidade") @PathVariable Long amenityId) {
        Property property = service.removeAmenity(id, amenityId);
        return ResponseEntity.ok(ApiResponse.success(property, "Comodidade removida com sucesso."));
    }

    /**
     * Lista todas as propriedades registadas.
     *
     * @return lista de propriedades
     */
    @Operation(summary = "Listar todas as propriedades", description = "Retorna uma lista de todos os imóveis")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Sucesso ao retornar lista")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listAll() {
        List<Map<String, Object>> properties = repository.findAll().stream().map(p -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getName());
            m.put("description", p.getDescription());
            m.put("location", p.getLocation());
            m.put("city", p.getCity());
            m.put("address", p.getAddress());
            m.put("basePrice", p.getBasePrice());
            m.put("maxGuests", p.getMaxGuests());
            m.put("isActive", Boolean.TRUE.equals(p.getIsActive()));
            return m;
        }).toList();
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

    /**
     * Obtém as regras operacionais de uma propriedade.
     *
     * @param id O ID da propriedade.
     * @return As regras da propriedade.
     */
    @Operation(summary = "Obter regras da propriedade", description = "Retorna as regras operacionais de uma propriedade, como horários de check-in/out e noites mínimas.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Regras obtidas com sucesso."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Propriedade não encontrada.")
    })
    @GetMapping("/{id}/rules")
    public ResponseEntity<ApiResponse<PropertyRuleDTO>> getRules(@Parameter(description = "ID da propriedade") @PathVariable Long id) {
        PropertyRuleDTO rules = ruleService.getRules(id);
        return ResponseEntity.ok(ApiResponse.success(rules, "Regras da propriedade obtidas com sucesso."));
    }

    /**
     * Obtém as regras operacionais de uma propriedade (alias compatível).
     */
    @Operation(summary = "Obter regras operacionais", description = "Alias do endpoint de regras operacionais para integração por contexto.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Regras obtidas com sucesso."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Propriedade não encontrada.")
    })
    @GetMapping("/{id}/rules/operational")
    public ResponseEntity<ApiResponse<PropertyRuleDTO>> getOperationalRules(@Parameter(description = "ID da propriedade") @PathVariable Long id) {
        PropertyRuleDTO rules = ruleService.getRules(id);
        return ResponseEntity.ok(ApiResponse.success(rules, "Regras operacionais obtidas com sucesso."));
    }

    /**
     * Obtém as regras de sazonalidade (precificação dinâmica) de uma propriedade.
     */
    @Operation(summary = "Obter regras de sazonalidade", description = "Lista regras de precificação dinâmica por datas/dias da semana/canal.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Regras obtidas com sucesso."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Propriedade não encontrada.")
    })
    @GetMapping("/{id}/rules/seasonality")
    public ResponseEntity<ApiResponse<List<SeasonalityRuleDTO>>> getSeasonalityRules(@Parameter(description = "ID da propriedade") @PathVariable Long id) {
        List<SeasonalityRuleDTO> rules = seasonalityRuleService.listRules(id);
        return ResponseEntity.ok(ApiResponse.success(rules, "Regras de sazonalidade obtidas com sucesso."));
    }

    /**
     * Endpoint consolidado para validação de regras e cálculo de preço (cotação).
     *
     * <p>Consolida regras operacionais e sazonalidade de forma a manter o booking-service desacoplado
     * da lógica interna de cálculo e restrições.</p>
     */
    @Operation(summary = "Validar e cotar estadia", description = "Valida regras operacionais + sazonalidade e devolve preço total calculado.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cotação calculada com sucesso."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Pedido inválido."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Propriedade não encontrada.")
    })
    @PostMapping("/{id}/quote")
    public ResponseEntity<ApiResponse<PropertyQuoteResponse>> quote(
            @Parameter(description = "ID da propriedade") @PathVariable Long id,
            @Valid @RequestBody PropertyQuoteRequest request
    ) {
        PropertyQuoteResponse quote = service.validateAndQuote(id, request);
        String message = quote.valid() ? "Cotação calculada com sucesso." : "Cotação inválida.";
        return ResponseEntity.ok(ApiResponse.success(quote, message));
    }

    /**
     * Atualiza as regras operacionais de uma propriedade.
     *
     * @param id O ID da propriedade.
     * @param dto Os novos dados das regras.
     * @return As regras atualizadas.
     */
    @Operation(summary = "Atualizar regras da propriedade", description = "Atualiza as regras operacionais de uma propriedade. Requer a role 'OWNER'.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Regras atualizadas com sucesso."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dados de entrada inválidos."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acesso negado."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Propriedade não encontrada.")
    })
    @PutMapping("/{id}/rules")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<PropertyRuleDTO>> updateRules(
            @Parameter(description = "ID da propriedade") @PathVariable Long id,
            @Valid @RequestBody PropertyRuleDTO dto) {
        PropertyRuleDTO updatedRules = ruleService.updateRules(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updatedRules, "Regras da propriedade atualizadas com sucesso."));
    }

    /**
     * Adiciona uma sobreposição de regra sazonal (Rule Override).
     */
    @Operation(summary = "Adicionar sobreposição de regra", description = "Define regras estritas para um período específico (ex: Agosto). Requer role OWNER.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Sobreposição criada com sucesso."),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Acesso negado.")
    })
    @PostMapping("/{id}/overrides")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<RuleOverride>> addOverride(
            @PathVariable Long id,
            @Valid @RequestBody RuleOverrideDTO dto) {
        RuleOverride override = service.addRuleOverride(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(override, "Sobreposição de regra criada com sucesso."));
    }

    /**
     * Lista todas as sobreposições de regras de uma propriedade.
     */
    @Operation(summary = "Listar sobreposições", description = "Retorna todas as exceções sazonais configuradas para a propriedade.")
    @GetMapping("/{id}/overrides")
    public ResponseEntity<ApiResponse<List<RuleOverride>>> listOverrides(@PathVariable Long id) {
        List<RuleOverride> overrides = service.listOverrides(id);
        return ResponseEntity.ok(ApiResponse.success(overrides, "Sobreposições listadas com sucesso."));
    }

    /**
     * Remove uma sobreposição de regra.
     */
    @Operation(summary = "Remover sobreposição", description = "Elimina uma exceção sazonal específica. Requer role OWNER.")
    @DeleteMapping("/overrides/{overrideId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deleteOverride(@PathVariable Long overrideId) {
        service.deleteOverride(overrideId);
        return ResponseEntity.noContent().build();
    }

    public BigDecimal getPriceById(Long id) {
        return repository.findPriceById(id)
                .orElseThrow(() -> new EntityNotFoundException("Propriedade não encontrada com o ID: " + id));
    }

    @Operation(summary = "Listar propriedades por utilizador", description = "Lista propriedades vinculadas a um utilizador com paginação, filtros e ordenação.")
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> listByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String sort,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        String[] sortParts = sort.split(",");
        Sort.Order order = new Sort.Order(Sort.Direction.fromString(sortParts.length > 1 ? sortParts[1] : "asc"), sortParts[0]);
        Pageable pageable = PageRequest.of(page, size, Sort.by(order));
        Page<Property> result = service.listByUserWithFilters(userId, city, isActive, minPrice, maxPrice, pageable);
        Page<Map<String, Object>> mapped = result.map(p -> {
            Map<String, Object> m = new java.util.HashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getName());
            m.put("description", p.getDescription());
            m.put("location", p.getLocation());
            m.put("city", p.getCity());
            m.put("address", p.getAddress());
            m.put("basePrice", p.getBasePrice());
            m.put("maxGuests", p.getMaxGuests());
            m.put("isActive", Boolean.TRUE.equals(p.getIsActive()));
            return m;
        });
        return ResponseEntity.ok(ApiResponse.success(mapped, "Propriedades do utilizador listadas."));
    }

    @Operation(summary = "Obter propriedade expandida", description = "Retorna uma propriedade com dados expandidos: amenities, regras e sazonalidade.")
    @GetMapping("/{id}/expanded")
    public ResponseEntity<ApiResponse<ExpandedPropertyResponse>> getExpanded(@PathVariable Long id) {
        ExpandedPropertyResponse dto = service.getExpandedById(id);
        return ResponseEntity.ok(ApiResponse.success(dto, "Propriedade expandida obtida com sucesso."));
    }

    @Operation(summary = "Atualizar propriedade (parcial)", description = "Atualiza qualquer campo permitido da propriedade (PATCH).")
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<ExpandedPropertyResponse>> patch(
            @PathVariable Long id,
            @RequestBody UpdatePropertyRequest request,
            @RequestHeader(value = "X-Actor-UserId", required = false) Long actorUserId
    )
    {
        Property updated = service.updateProperty(id, request, actorUserId);

        ExpandedPropertyResponse response = service.convertToExpandedDto(updated);
        return ResponseEntity.ok(ApiResponse.success(response, "Propriedade atualizada com sucesso."));
    }

    @Operation(summary = "Eliminar propriedade", description = "Remove definitivamente uma propriedade.")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader(value = "X-Actor-UserId", required = false) Long actorUserId
    ) {
        service.deleteProperty(id, actorUserId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Histórico de alterações", description = "Lista o histórico de alterações de uma propriedade (audit).")
    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<PropertyChangeLog>>> history(@PathVariable Long id) {
        List<PropertyChangeLog> logs = service.getHistory(id);
        return ResponseEntity.ok(ApiResponse.success(logs, "Histórico obtido com sucesso."));
    }

    @Operation(summary = "Parâmetros de upload de documentos", description = "Obtém parâmetros temporários para upload seguro de documentos da propriedade.")
    @GetMapping("/{id}/documents/upload-params")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> documentUploadParams(@PathVariable Long id) {
        service.findById(id);
        Map<String, Object> params = imageStorageService.getUploadParameters();
        Map<String, Object> enriched = new java.util.HashMap<>(params);
        enriched.put("context_property_id", id);
        return ResponseEntity.ok(ApiResponse.success(enriched, "Parâmetros de upload gerados."));
    }

    @Operation(summary = "Relatório de propriedades (CSV)", description = "Gera um relatório CSV das propriedades do utilizador com filtros.")
    @GetMapping(value = "/reports/summary", produces = "text/csv")
    public ResponseEntity<byte[]> reportSummary(
            @RequestParam Long userId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Boolean isActive
    ) {
        Page<Property> page = service.listByUserWithFilters(userId, city, isActive, null, null, PageRequest.of(0, 1000, Sort.by("name")));
        String header = "id;nome;cidade;preco_base;ativo\n";
        String rows = page.getContent().stream().map(p ->
                p.getId() + ";" + safe(p.getName()) + ";" + safe(p.getCity()) + ";" + (p.getBasePrice() == null ? "" : p.getBasePrice()) + ";" + p.getIsActive()
        ).collect(Collectors.joining("\n"));
        byte[] bytes = (header + rows).getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "csv", StandardCharsets.UTF_8));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=propriedades.csv");
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }

    private String safe(String s) { return s == null ? "" : s.replace(";", ","); }
}
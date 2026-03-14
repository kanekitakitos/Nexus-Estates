package com.nexus.estates.controller;

import com.nexus.estates.entity.Amenity;
import com.nexus.estates.service.AmenityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller responsável pela gestão de comodidades (amenities).
 *
 * <p>Expõe endpoints para criação e consulta de comodidades no sistema.</p>
 *
 * <p>Funcionalidades principais:</p>
 * <ul>
 * <li>Criar uma nova comodidade</li>
 * <li>Listar todas as comodidades</li>
 * <li>Obter detalhes de uma comodidade</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-12
 */
@RestController
@RequestMapping("/api/amenities")
@Tag(name = "Amenity API", description = "Gestão de comodidades e características das propriedades")
public class AmenityController {

    private final AmenityService service;

    /**
     * Construtor do controller.
     *
     * @param service serviço responsável pela lógica de negócio das comodidades
     */
    public AmenityController(AmenityService service) {
        this.service = service;
    }

    /**
     * Cria uma nova comodidade.
     *
     * <p>Valida os campos obrigatórios antes de persistir:</p>
     * <ul>
     * <li>name</li>
     * <li>category</li>
     * </ul>
     *
     * @param amenity dados da comodidade a criar
     * @return comodidade criada ou erro 400 caso falhem validações
     */
    @Operation(summary = "Criar nova comodidade", description = "Adiciona uma nova característica (ex: WiFi, Piscina) ao catálogo do sistema.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comodidade criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou campos obrigatórios em falta")
    })
    @PostMapping
    public ResponseEntity<Amenity> create(@RequestBody Amenity amenity) {

        if (amenity.getName() == null || amenity.getCategory() == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(service.create(amenity));
    }

    /**
     * Lista todas as comodidades registadas.
     *
     * @return lista de comodidades
     */
    @Operation(summary = "Listar todas as comodidades", description = "Retorna a lista completa de comodidades disponíveis para associação a propriedades.")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso")
    @GetMapping
    public ResponseEntity<List<Amenity>> listAll() {
        return ResponseEntity.ok(service.findAll());
    }

    /**
     * Obtém os detalhes de uma comodidade pelo ID.
     *
     * @param id identificador único (UUID) da comodidade
     * @return comodidade encontrada
     * @throws RuntimeException caso a comodidade não exista
     */
    @Operation(summary = "Obter comodidade por ID", description = "Retorna os detalhes de uma comodidade específica.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comodidade encontrada"),
            @ApiResponse(responseCode = "404", description = "Comodidade não encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Amenity> getById(
            @Parameter(description = "ID único da comodidade", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }
}
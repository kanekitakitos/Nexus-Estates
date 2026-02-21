package com.nexus.estates.controller;

import com.nexus.estates.entity.Property;
import com.nexus.estates.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller responsável pela gestão de propriedades.
 *
 * <p>Expõe endpoints para criação e consulta de propriedades no sistema.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-13
 */
@RestController
@RequestMapping("/api/properties")
@Tag(name = "Property API", description = "Gestão de propriedades da Nexus Estates")
public class PropertyController {

    private final PropertyService service;

    /**
     * Construtor do controller.
     *
     * @param service serviço responsável pela lógica de negócio das propriedades
     */
    public PropertyController(PropertyService service) {
        this.service = service;
    }

    /**
     * Cria uma nova propriedade.
     *
     * <p>Valida os campos obrigatórios antes de persistir:</p>
     * <ul>
     * <li>name</li>
     * <li>basePrice</li>
     * <li>maxGuests</li>
     * </ul>
     *
     * @param property dados da propriedade a criar
     * @return propriedade criada ou erro 400 caso falhem validações
     */
    @Operation(summary = "Criar nova propriedade", description = "Cria uma propriedade e envia email de confirmação")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Propriedade criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Campos obrigatórios em falta")
    })
    @PostMapping
    public ResponseEntity<Property> create(@RequestBody Property property) {

        if (property.getName() == null ||
                property.getBasePrice() == null ||
                property.getMaxGuests() == null) {

            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(service.create(property));
    }

    /**
     * Lista todas as propriedades registadas.
     *
     * @return lista de propriedades
     */
    @Operation(summary = "Listar todas as propriedades", description = "Retorna uma lista de todos os imóveis")
    @ApiResponse(responseCode = "200", description = "Sucesso ao retornar lista")
    @GetMapping
    public ResponseEntity<List<Property>> listAll() {
        return ResponseEntity.ok(service.findAll());
    }

    /**
     * Obtém os detalhes de uma propriedade pelo ID.
     *
     * @param id identificador da propriedade
     * @return propriedade encontrada
     * @throws RuntimeException caso a propriedade não exista
     */
    @Operation(summary = "Obter propriedade por ID", description = "Retorna os detalhes de um imóvel específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Imóvel encontrado"),
            @ApiResponse(responseCode = "404", description = "Imóvel não existe")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Property> getById(
            @Parameter(description = "ID único da propriedade", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }
}
package com.nexus.estates.controller;

import com.nexus.estates.entity.Amenity;
import com.nexus.estates.service.AmenityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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
@RequestMapping("/amenities")
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
    @GetMapping("/{id}")
    public ResponseEntity<Amenity> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }
}
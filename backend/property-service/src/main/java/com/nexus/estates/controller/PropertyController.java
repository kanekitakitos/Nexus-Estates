package com.nexus.estates.controller;

import com.nexus.estates.entity.Property;
import com.nexus.estates.service.PropertyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller responsável pela gestão de propriedades.
 *
 * <p>Expõe endpoints para criação e consulta de propriedades no sistema.</p>
 *
 * <p>Funcionalidades principais:</p>
 * <ul>
 *     <li>Criar uma nova propriedade</li>
 *     <li>Listar todas as propriedades</li>
 *     <li>Obter detalhes de uma propriedade</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-13
 */
@RestController
@RequestMapping("/api/properties")
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
     *     <li>name</li>
     *     <li>basePrice</li>
     *     <li>maxGuests</li>
     * </ul>
     *
     * @param property dados da propriedade a criar
     * @return propriedade criada ou erro 400 caso falhem validações
     */
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
    @GetMapping("/{id}")
    public ResponseEntity<Property> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }
}

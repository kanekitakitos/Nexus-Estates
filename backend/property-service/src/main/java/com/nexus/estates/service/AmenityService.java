package com.nexus.estates.service;

import com.nexus.estates.entity.Amenity;
import com.nexus.estates.repository.AmenityRepository;
import com.nexus.estates.exception.AmenityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Serviço responsável pela lógica de negócio das comodidades (amenities).
 *
 * <p>Esta classe faz a ponte entre o controller e a camada de persistência,
 * gerindo as regras de criação e consulta de comodidades no sistema.</p>
 *
 * <p>Funcionalidades principais:</p>
 * <ul>
 * <li>Registar uma nova comodidade no sistema</li>
 * <li>Recuperar a listagem completa de comodidades</li>
 * <li>Procurar uma comodidade específica por UUID</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-12
 */
@Service
public class AmenityService {

    private final AmenityRepository repository;

    /**
     * Construtor do serviço.
     *
     * @param repository repositório para operações de base de dados de comodidades
     */
    public AmenityService(AmenityRepository repository) {
        this.repository = repository;
    }

    /**
     * Cria e guarda uma nova comodidade.
     *
     * @param amenity entidade contendo os dados da nova comodidade
     * @return a comodidade guardada com o seu estado atualizado
     */
    public Amenity create(Amenity amenity) {
        return repository.save(amenity);
    }

    /**
     * Obtém todas as comodidades registadas.
     *
     * @return lista de todas as comodidades presentes na base de dados
     */
    public List<Amenity> findAll() {
        return repository.findAll();
    }

    /**
     * Procura uma comodidade pelo seu identificador único.
     *
     * @param id identificador único (UUID) da comodidade
     * @return a comodidade encontrada
     * @throws AmenityNotFoundException caso não exista nenhuma comodidade com o ID fornecido
     */
    public Amenity findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new AmenityNotFoundException(id));
    }
}
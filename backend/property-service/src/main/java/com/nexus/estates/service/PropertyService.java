package com.nexus.estates.service;

import com.nexus.estates.dto.CreatePropertyRequest;
import com.nexus.estates.entity.Amenity;
import com.nexus.estates.entity.Property;
import com.nexus.estates.exception.PropertyNotFoundException;
import com.nexus.estates.repository.AmenityRepository; // Novo Import
import com.nexus.estates.repository.PropertyRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Serviço responsável pela lógica de negócio associada às propriedades.
 *
 * <p>Esta camada atua como intermediária entre o controller e o repositório,
 * encapsulando operações de persistência e regras de negócio.</p>
 *
 * @see PropertyRepository
 * @author Nexus Estates Team
 */
@Service
@Slf4j
public class PropertyService {

    private final PropertyRepository repository;
    private final AmenityRepository amenityRepository; // Adicionado para suporte a comodidades

    /**
     * Construtor do serviço.
     *
     * @param repository repositório responsável pelo acesso aos dados
     * @param amenityRepository repositório responsável pelas comodidades
     */
    public PropertyService(PropertyRepository repository, AmenityRepository amenityRepository) {
        this.repository = repository;
        this.amenityRepository = amenityRepository;
    }

    /**
     * Cria uma nova propriedade no sistema a partir de um DTO.
     *
     * <p>Realiza o mapeamento dos dados do Request para a Entidade,
     * suportando descrições multi-idioma (JSONB) e preparando a associação de comodidades.</p>
     *
     * @param request dados da propriedade vindos do controller (DTO)
     * @return propriedade persistida
     */
    @Transactional
    public Property create(CreatePropertyRequest request) {
        log.info("Iniciando criação de propriedade: {}", request.title());

        Property property = new Property();

        // Mapeamento dos campos do DTO para a Entity
        property.setName(request.title());
        // Conversão de Double (DTO) para BigDecimal (Entity)
        property.setBasePrice(BigDecimal.valueOf(request.price()));
        property.setLocation(request.location());

        // Atribui o mapa de descrições (que será guardado como JSONB no Postgres)
        property.setDescription(request.description());

        // Implementação da lógica de associação de amenityIds
        if (request.amenityIds() != null && !request.amenityIds().isEmpty()) {
            log.debug("Comodidades detetadas para associação: {}", request.amenityIds());
            List<Amenity> amenities = amenityRepository.findAllById(request.amenityIds());
            property.setAmenities(new HashSet<>(amenities));
        }

        return repository.save(property);
    }

    /**
     * Atualiza a lista de comodidades de uma propriedade existente.
     *
     * <p>Este método permite a gestão dinâmica de atributos da propriedade,
     * resolvendo a relação Many-to-Many entre Property e Amenity.</p>
     *
     * @param propertyId identificador da propriedade a atualizar
     * @param amenityIds conjunto de IDs das novas comodidades
     * @return propriedade atualizada
     * @throws PropertyNotFoundException caso o ID seja inválido
     */
    @Transactional
    public Property updateAmenities(Long propertyId, Set<Long> amenityIds) {
        log.info("Atualizando comodidades da propriedade ID: {}", propertyId);

        Property property = findById(propertyId);

        if (amenityIds != null && !amenityIds.isEmpty()) {
            List<Amenity> amenities = amenityRepository.findAllById(amenityIds);
            property.setAmenities(new HashSet<>(amenities));
        } else {
            property.getAmenities().clear();
        }

        return repository.save(property);
    }

    /**
     * Obtém todas as propriedades registadas.
     *
     * @return lista de propriedades
     */
    public List<Property> findAll() {
        return repository.findAll();
    }

    /**
     * Obtém uma propriedade pelo seu identificador.
     *
     * @param id identificador da propriedade
     * @return propriedade encontrada
     * @throws PropertyNotFoundException caso a propriedade não exista
     */
    public Property findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new PropertyNotFoundException(id));
    }
}
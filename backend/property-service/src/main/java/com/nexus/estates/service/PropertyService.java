package com.nexus.estates.service;

import com.nexus.estates.entity.Property;
import com.nexus.estates.exception.PropertyNotFoundException;
import com.nexus.estates.repository.PropertyRepository;
import org.springframework.stereotype.Service;

import java.util.List;


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
public class PropertyService {

    private final PropertyRepository repository;

    /**
     * Construtor do serviço.
     *
     * @param repository repositório responsável pelo acesso aos dados
     */
    public PropertyService(PropertyRepository repository) {
        this.repository = repository;
    }

    /**
     * Cria uma nova propriedade no sistema.
     *
     * <p>Persiste a entidade na base de dados.</p>
     *
     * @param property dados da propriedade
     * @return propriedade persistida
     */
    public Property create(Property property) {
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
     * @throws RuntimeException caso a propriedade não exista
     */
    public Property findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new PropertyNotFoundException(id));
    }
}

package com.nexus.estates.service;

import com.nexus.estates.entity.PropertyPermission;
import com.nexus.estates.repository.PermissionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Serviço responsável pela lógica de negócio das permissões de propriedade.
 *
 * <p>Encapsula as operações de criação, consulta e remoção de permissões
 * que definem os acessos ou direitos sobre as propriedades no sistema.</p>
 *
 * <p>Funcionalidades principais:</p>
 * <ul>
 * <li>Registar uma nova permissão</li>
 * <li>Listar todas as permissões existentes</li>
 * <li>Consultar uma permissão específica</li>
 * <li>Remover uma permissão</li>
 * </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-12
 */
@Service
public class PermissionService {

    private final PermissionRepository repository;

    /**
     * Construtor do serviço.
     *
     * @param repository repositório responsável pelo acesso aos dados das permissões
     */
    public PermissionService(PermissionRepository repository) {
        this.repository = repository;
    }

    /**
     * Cria e persiste uma nova permissão.
     *
     * @param permission entidade com os dados da permissão a criar
     * @return a permissão persistida com o ID gerado
     */
    public PropertyPermission create(PropertyPermission permission) {
        return repository.save(permission);
    }

    /**
     * Recupera todas as permissões registadas na base de dados.
     *
     * @return lista completa de permissões
     */
    public List<PropertyPermission> findAll() {
        return repository.findAll();
    }

    /**
     * Busca uma permissão pelo seu identificador único.
     *
     * @param id identificador único (UUID) da permissão
     * @return a permissão encontrada
     * @throws RuntimeException caso a permissão não seja encontrada no repositório
     */
    public PropertyPermission findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));
    }

    /**
     * Remove uma permissão do sistema.
     *
     * @param id identificador único (UUID) da permissão a remover
     */
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
package com.nexus.estates.service;

import com.nexus.estates.dto.PropertyPermissionDTO;
import com.nexus.estates.entity.AccessLevel;
import com.nexus.estates.entity.PropertyPermission;
import com.nexus.estates.exception.PropertyNotFoundException;
import com.nexus.estates.repository.PermissionRepository;
import com.nexus.estates.repository.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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
    private final PropertyRepository propertyRepository;

    /**
     * Construtor do serviço.
     *
     * @param repository repositório responsável pelo acesso aos dados das permissões
     */
    public PermissionService(PermissionRepository repository, PropertyRepository propertyRepository) {
        this.repository = repository;
        this.propertyRepository = propertyRepository;
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

    /**
     * Lista permissões (ACL) de uma propriedade.
     *
     * @param propertyId ID da propriedade
     * @return permissões mapeadas para DTO
     */
    @Transactional(readOnly = true)
    public List<PropertyPermissionDTO> listByProperty(Long propertyId) {
        propertyRepository.findById(propertyId).orElseThrow(() -> new PropertyNotFoundException(propertyId));
        return repository.findByPropertyId(propertyId).stream()
                .map(p -> new PropertyPermissionDTO(p.getUserId(), p.getAccessLevel()))
                .toList();
    }

    /**
     * Substitui a lista de permissões de uma propriedade (PUT).
     *
     * <p>Regras de robustez:</p>
     * <ul>
     *   <li>Deve existir exatamente 1 {@link AccessLevel#PRIMARY_OWNER} após a operação.</li>
     *   <li>Não permite duplicados por {@code userId}.</li>
     * </ul>
     *
     * @param propertyId ID da propriedade
     * @param permissions lista final de permissões
     * @return lista persistida
     */
    @Transactional
    public List<PropertyPermissionDTO> replacePermissions(Long propertyId, List<PropertyPermissionDTO> permissions) {
        if (permissions == null) {
            throw new IllegalArgumentException("Lista de permissões inválida.");
        }

        propertyRepository.findByIdForUpdate(propertyId).orElseThrow(() -> new PropertyNotFoundException(propertyId));

        Map<Long, PropertyPermissionDTO> uniqueByUserId = permissions.stream()
                .peek(this::validatePermissionDto)
                .collect(Collectors.toMap(PropertyPermissionDTO::userId, Function.identity(), (a, b) -> {
                    throw new IllegalArgumentException("Existem permissões duplicadas para o mesmo utilizador.");
                }));

        long primaryOwnerCount = uniqueByUserId.values().stream().filter(p -> p.accessLevel() == AccessLevel.PRIMARY_OWNER).count();
        if (primaryOwnerCount != 1) {
            throw new IllegalArgumentException("A propriedade deve ter exatamente 1 PRIMARY_OWNER.");
        }

        repository.deleteByPropertyId(propertyId);

        uniqueByUserId.values().forEach(dto -> {
            PropertyPermission entity = new PropertyPermission();
            entity.setPropertyId(propertyId);
            entity.setUserId(dto.userId());
            entity.setAccessLevel(dto.accessLevel());
            repository.save(entity);
        });

        return listByProperty(propertyId);
    }

    /**
     * Atualiza o nível de acesso de um utilizador numa propriedade (PATCH).
     *
     * <p>Não permite eliminar o último {@link AccessLevel#PRIMARY_OWNER}.</p>
     *
     * @param propertyId ID da propriedade
     * @param userId ID do utilizador alvo
     * @param accessLevel novo nível
     * @return permissão atualizada
     */
    @Transactional
    public PropertyPermissionDTO patchPermission(Long propertyId, Long userId, AccessLevel accessLevel) {
        if (accessLevel == null) {
            throw new IllegalArgumentException("accessLevel é obrigatório.");
        }

        propertyRepository.findByIdForUpdate(propertyId).orElseThrow(() -> new PropertyNotFoundException(propertyId));

        PropertyPermission entity = repository.findFirstByPropertyIdAndUserId(propertyId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Permissão não encontrada."));

        if (entity.getAccessLevel() == AccessLevel.PRIMARY_OWNER && accessLevel != AccessLevel.PRIMARY_OWNER) {
            long owners = repository.findByPropertyId(propertyId).stream()
                    .filter(p -> p.getAccessLevel() == AccessLevel.PRIMARY_OWNER)
                    .count();
            if (owners <= 1) {
                throw new IllegalArgumentException("Não é possível remover o último PRIMARY_OWNER.");
            }
        }

        entity.setAccessLevel(accessLevel);
        PropertyPermission saved = repository.save(entity);
        return new PropertyPermissionDTO(saved.getUserId(), saved.getAccessLevel());
    }

    /**
     * Remove a permissão de um utilizador numa propriedade.
     *
     * <p>Não permite remover o último {@link AccessLevel#PRIMARY_OWNER}.</p>
     *
     * @param propertyId ID da propriedade
     * @param userId ID do utilizador a remover
     */
    @Transactional
    public void removePermission(Long propertyId, Long userId) {
        propertyRepository.findByIdForUpdate(propertyId).orElseThrow(() -> new PropertyNotFoundException(propertyId));

        PropertyPermission existing = repository.findFirstByPropertyIdAndUserId(propertyId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Permissão não encontrada."));

        if (existing.getAccessLevel() == AccessLevel.PRIMARY_OWNER) {
            long owners = repository.findByPropertyId(propertyId).stream()
                    .filter(p -> p.getAccessLevel() == AccessLevel.PRIMARY_OWNER)
                    .count();
            if (owners <= 1) {
                throw new IllegalArgumentException("Não é possível remover o último PRIMARY_OWNER.");
            }
        }

        repository.deleteByPropertyIdAndUserId(propertyId, userId);
    }

    private void validatePermissionDto(PropertyPermissionDTO dto) {
        if (dto == null || dto.userId() == null || dto.accessLevel() == null) {
            throw new IllegalArgumentException("Permissão inválida.");
        }
    }
}

package com.nexus.estates.service;

import com.nexus.estates.entity.AccessLevel;
import com.nexus.estates.entity.PropertyPermission;
import com.nexus.estates.repository.PermissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para a classe de serviço {@link PermissionService}.
 *
 * <p>Esta classe assegura a correta aplicação das regras de negócio relacionadas com o
 * controlo de acesso a propriedades. Utiliza o Mockito para isolar a camada de persistência,
 * garantindo que as permissões e níveis de acesso (AccessLevel) sejam geridos corretamente.</p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 * @since 2026-02-24
 */
@ExtendWith(MockitoExtension.class)
class PermissionServiceTest {

    /** Mock do repositório para evitar persistência real em base de dados durante os testes. */
    @Mock
    private PermissionRepository repository;

    /** Instância do serviço com mocks injetados para validar a lógica de permissões. */
    @InjectMocks
    private PermissionService service;

    private PropertyPermission permission;
    private Long permissionId;

    /**
     * Configuração base para cada cenário de teste.
     * <p>Instancia uma permissão padrão com nível PRIMARY_OWNER para validar operações de leitura e escrita.</p>
     */
    @BeforeEach
    void setUp() {
        permissionId = 7L;
        permission = new PropertyPermission();
        permission.setId(permissionId);
        permission.setAccessLevel(AccessLevel.PRIMARY_OWNER);
    }

    /**
     * Valida a criação de uma nova permissão de propriedade.
     * <p>Verifica se o objeto retornado contém o ID gerado e se o repositório foi invocado uma única vez.</p>
     */
    @Test
    @DisplayName("Deve persistir uma nova permissão com sucesso")
    void shouldCreatePermissionWithSuccess() {
        // Arrange
        when(repository.save(any(PropertyPermission.class))).thenReturn(permission);

        // Act
        PropertyPermission created = service.create(new PropertyPermission());

        // Assert
        assertNotNull(created, "A permissão criada não deve ser nula");
        assertEquals(permissionId, created.getId(), "O ID retornado deve corresponder ao ID persistido");
        verify(repository, times(1)).save(any(PropertyPermission.class));
    }

    /**
     * Testa a recuperação de todas as permissões registadas no sistema.
     * <p>Garante que o serviço lida corretamente com coleções e delega a chamada ao repositório.</p>
     */
    @Test
    @DisplayName("Deve listar todas as permissões existentes")
    void shouldFindAllPermissions() {
        // Arrange
        when(repository.findAll()).thenReturn(List.of(permission));

        // Act
        List<PropertyPermission> list = service.findAll();

        // Assert
        assertFalse(list.isEmpty(), "A lista não deve estar vazia");
        assertEquals(1, list.size(), "A lista deve conter exatamente uma permissão");
        verify(repository, times(1)).findAll();
    }

    /**
     * Valida a procura de uma permissão específica através do seu identificador único.
     */
    @Test
    @DisplayName("Deve encontrar uma permissão pelo ID")
    void shouldFindPermissionById() {
        // Arrange
        when(repository.findById(permissionId)).thenReturn(Optional.of(permission));

        // Act
        PropertyPermission found = service.findById(permissionId);

        // Assert
        assertNotNull(found, "A permissão deve ser encontrada");
        assertEquals(permissionId, found.getId(), "O ID da permissão encontrada deve coincidir com o solicitado");
    }

    /**
     * Testa o comportamento do sistema quando se procura uma permissão inexistente.
     * <p>Verifica se o serviço lança a exceção adequada com a mensagem de erro esperada.</p>
     */
    @Test
    @DisplayName("Deve lançar exceção ao procurar ID inexistente")
    void shouldThrowExceptionWhenPermissionNotFound() {
        // Arrange
        Long randomId = 1L;
        when(repository.findById(randomId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            service.findById(randomId);
        }, "Deve lançar RuntimeException quando a permissão não existe");

        assertEquals("Permission not found", exception.getMessage(), "A mensagem de erro deve ser 'Permission not found'");
    }

    /**
     * Valida a remoção de permissões do sistema.
     * <p>Garante que o comando de eliminação é enviado corretamente para a camada de dados.</p>
     */
    @Test
    @DisplayName("Deve remover uma permissão por ID com sucesso")
    void shouldDeletePermission() {
        // Arrange
        doNothing().when(repository).deleteById(permissionId);

        // Act
        service.delete(permissionId);

        // Assert
        verify(repository, times(1)).deleteById(permissionId);
    }
}
package com.nexus.estates.service;

import com.nexus.estates.entity.AccessLevel;
import com.nexus.estates.entity.PropertyPermission;
import com.nexus.estates.repository.PermissionRepository;
import org.junit.jupiter.api.BeforeEach;
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
 * Testes unitários para o {@link PermissionService}.
 * * Utiliza Mockito para simular a camada de persistência e validar
 * a lógica de negócio isoladamente.
 */
@ExtendWith(MockitoExtension.class)
class PermissionServiceTest {

    @Mock
    private PermissionRepository repository;

    @InjectMocks
    private PermissionService service;

    private PropertyPermission permission;
    private Long permissionId;

    @BeforeEach
    void setUp() {
        permissionId = 7L;
        permission = new PropertyPermission();
        permission.setId(permissionId);
        permission.setAccessLevel(AccessLevel.PRIMARY_OWNER);
    }

    @Test
    void shouldCreatePermissionWithSuccess() {
        // Arrange
        when(repository.save(any(PropertyPermission.class))).thenReturn(permission);

        // Act
        PropertyPermission created = service.create(new PropertyPermission());

        // Assert
        assertNotNull(created);
        assertEquals(permissionId, created.getId());
        verify(repository, times(1)).save(any(PropertyPermission.class));
    }

    @Test
    void shouldFindAllPermissions() {
        // Arrange
        when(repository.findAll()).thenReturn(List.of(permission));

        // Act
        List<PropertyPermission> list = service.findAll();

        // Assert
        assertFalse(list.isEmpty());
        assertEquals(1, list.size());
        verify(repository, times(1)).findAll();
    }

    @Test
    void shouldFindPermissionById() {
        // Arrange
        when(repository.findById(permissionId)).thenReturn(Optional.of(permission));

        // Act
        PropertyPermission found = service.findById(permissionId);

        // Assert
        assertNotNull(found);
        assertEquals(permissionId, found.getId());
    }

    @Test
    void shouldThrowExceptionWhenPermissionNotFound() {
        // Arrange
        Long randomId = 1L;
        when(repository.findById(randomId)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            service.findById(randomId);
        });

        assertEquals("Permission not found", exception.getMessage());
    }

    @Test
    void shouldDeletePermission() {
        // Arrange
        doNothing().when(repository).deleteById(permissionId);

        // Act
        service.delete(permissionId);

        // Assert
        verify(repository, times(1)).deleteById(permissionId);
    }
}
package com.nexus.estates.entity;

import org.junit.jupiter.api.Test;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para a entidade {@link PropertyPermission}.
 * * Verifica se os mecanismos de getter e setter estão a funcionar
 * corretamente para garantir a integridade dos dados da permissão.
 */
class PropertyPermissionTest {

    @Test
    void testPropertyPermissionData() {
        // Arrange (Preparação)
        PropertyPermission permission = new PropertyPermission();
        UUID id = UUID.randomUUID();
        UUID propertyId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        AccessLevel level = AccessLevel.PRIMARY_OWNER;

        // Act (Ação)
        permission.setId(id);
        permission.setPropertyId(propertyId);
        permission.setUserId(userId);
        permission.setAccessLevel(level);

        // Assert (Verificação)
        assertEquals(id, permission.getId(), "O ID da permissão deve corresponder ao valor definido.");
        assertEquals(propertyId, permission.getPropertyId(), "O ID da propriedade deve corresponder ao valor definido.");
        assertEquals(userId, permission.getUserId(), "O ID do utilizador deve corresponder ao valor definido.");
        assertEquals(level, permission.getAccessLevel(), "O nível de acesso deve corresponder ao valor definido.");
    }

    @Test
    void testConstructorAndNulls() {
        // Verifica o estado inicial ou manipulação de nulos se necessário
        PropertyPermission permission = new PropertyPermission();

        assertNull(permission.getId());
        assertNull(permission.getAccessLevel());
    }
}
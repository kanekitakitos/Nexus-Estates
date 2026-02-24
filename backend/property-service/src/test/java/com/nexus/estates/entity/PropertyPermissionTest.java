package com.nexus.estates.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para a entidade {@link PropertyPermission}.
 * * Verifica se os mecanismos de getter e setter estão a funcionar
 * corretamente para garantir a integridade dos dados da permissão.
 * * @author Nexus Estates Team
 * @version 1.1
 * @since 2026-02-12
 */
class PropertyPermissionTest {

    @Test
    void testPropertyPermissionData() {
        // Arrange (Preparação)
        PropertyPermission permission = new PropertyPermission();

        // Mudança de UUID para Long (usando o sufixo 'L')
        Long id = 1L;
        Long propertyId = 10L;
        Long userId = 100L;
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
        // Verifica o estado inicial da entidade antes de qualquer atribuição
        PropertyPermission permission = new PropertyPermission();

        assertNull(permission.getId(), "O ID inicial deve ser nulo.");
        assertNull(permission.getAccessLevel(), "O nível de acesso inicial deve ser nulo.");
        assertNull(permission.getPropertyId(), "O ID da propriedade inicial deve ser nulo.");
        assertNull(permission.getUserId(), "O ID do utilizador inicial deve ser nulo.");
    }
}
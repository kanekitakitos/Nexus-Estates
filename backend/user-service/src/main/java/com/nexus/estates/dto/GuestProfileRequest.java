package com.nexus.estates.dto;

import lombok.Data;
import java.util.List;

/**
 * DTO para a requição de criação ou atualização de um perfil de Hóspede
 * <p>
 *     Encapsula os dados submetidos pelos gestores ou administradores ao adicionar ou modificar
 *     as notas internas e as etiquetas de categorização associadas a um hóspede específico
 * </p>
 *
 * @auhtor Nexus Estates Team
 * @version 1.0
 */
@Data
public class GuestProfileRequest {
    private String internalNotes;
    private List<String> tags;
}

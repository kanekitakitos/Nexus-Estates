package com.nexus.estates.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Objeto de Transferência de Dados (DTO) para informações de Utilizador.
 * <p>
 * Utilizado para expor dados de utilizador entre microserviços e para o frontend
 * de forma segura, evitando a exposição direta de entidades de persistência.
 * </p>
 *
 * @author Nexus Estates Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    /** Identificador único do utilizador. */
    private UUID id;
    
    /** Endereço de email (identificador de login). */
    private String email;
    
    /** Primeiro nome do utilizador. */
    private String firstName;
    
    /** Apelido do utilizador. */
    private String lastName;
    
    /** Papel/Role do utilizador no sistema (ex: USER, ADMIN). */
    private String role;
}
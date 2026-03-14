package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Objeto de Transferência de Dados (DTO) para a resposta de autenticação.
 * <p>
 * Este objeto encapsula os dados necessários para que o cliente (Frontend/Mobile)
 * consiga manter a sessão ativa e gerir permissões de interface com base no papel do utilizador.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resposta contendo o token de autenticação e detalhes do utilizador")
public class AuthResponde {

    /**
     * Token de acesso no formato JSON Web Token (JWT).
     * <p>Deve ser incluído no cabeçalho 'Authorization' como 'Bearer [token]' em todos os pedidos protegidos.</p>
     */
    @Schema(description = "Token JWT para autenticação em pedidos subsequentes", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String token;

    /**
     * Identificador único da conta na base de dados (Primary Key).
     */
    @Schema(description = "Identificador único do utilizador", example = "1")
    private Long id;

    /**
     * Email principal do utilizador, utilizado como username no processo de login.
     */
    @Schema(description = "Endereço de email do utilizador", example = "user@example.com")
    private String email;

    /**
     * Nível de autorização atribuído ao utilizador (ex: GUEST, OWNER, ADMIN).
     * <p>Determina o acesso a endpoints protegidos por @PreAuthorize no backend.</p>
     */
    @Schema(description = "Papel (Role) do utilizador no sistema", example = "GUEST")
    private String role;
}
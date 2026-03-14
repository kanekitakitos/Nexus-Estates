package com.nexus.estates.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Objeto de Transferência de Dados (DTO) para a resposta de autenticação bem-sucedida.
 * <p>
 * Este objeto consolida o artefato de segurança (Token JWT) e o contexto do utilizador
 * necessário para a inicialização da sessão no lado do cliente. É utilizado tanto
 * no fluxo de Login como no de Registo de novas contas.
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
public class AuthResponse {

    /**
     * Token de acesso no formato JSON Web Token (JWT).
     * <p>Deve ser armazenado de forma segura pelo cliente (ex: localStorage ou Secure Cookie)
     * e enviado no header 'Authorization' prefixado por 'Bearer ' em todos os pedidos privados.</p>
     */
    @Schema(description = "Token JWT para autenticação em pedidos subsequentes", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String token;

    /**
     * Identificador primário do utilizador no sistema.
     * <p>Permite ao frontend realizar consultas de perfil ou associar ações específicas ao utilizador logado.</p>
     */
    @Schema(description = "Identificador único do utilizador", example = "1")
    private Long id;

    /**
     * Identificador de login do utilizador.
     * <p>Utilizado para exibição no interface e para confirmar a conta que está atualmente autenticada.</p>
     */
    @Schema(description = "Endereço de email do utilizador", example = "user@example.com")
    private String email;

    /**
     * Nível de autorização (Role) atual do utilizador.
     * <p>Essencial para a lógica de 'Conditional Rendering' no Frontend (ex: mostrar botão de Admin)
     * e deve coincidir com as permissões validadas no backend pelo Spring Security.</p>
     */
    @Schema(description = "Papel (Role) do utilizador no sistema", example = "GUEST")
    private String role;
}
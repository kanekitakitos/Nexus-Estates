package com.nexus.estates.controller;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.dto.AuthResponse;
import com.nexus.estates.dto.LoginRequest;
import com.nexus.estates.dto.RegisterRequest;
import com.nexus.estates.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador REST responsável pela gestão do ciclo de vida de autenticação.
 * <p>
 * Implementa os pontos de entrada para o sistema de identidade da Nexus Estates,
 * gerindo o registo de novos utilizadores e a emissão de tokens de acesso (JWT).
 * Todos os endpoints expostos nesta classe são, por definição, públicos na configuração de segurança.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 * @since 2026-02-13
 */
@RestController
@RequestMapping("/api/users/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints para login e registo de utilizadores")
public class AuthController {

    /**
     * Serviço que encapsula a lógica de negócio de autenticação e comunicação com o repositório de utilizadores.
     */
    private final AuthService authService;

    /**
     * Realiza o registo de um novo utilizador no ecossistema Nexus.
     * <p>
     * Este método valida a integridade dos dados através do {@link RegisterRequest},
     * persiste o novo utilizador com a password encriptada e gera automaticamente
     * o primeiro token de acesso.
     * </p>
     *
     * @param request DTO contendo nome, email, password e possivelmente o Role inicial.
     * @return {@link ResponseEntity} contendo o {@link AuthResponse} com o token JWT e dados básicos do perfil.
     * @see AuthService#register(RegisterRequest)
     */
    @Operation(summary = "Registar novo utilizador", description = "Cria uma nova conta de utilizador e retorna um token JWT.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Utilizador registado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dados de entrada inválidos (erro de validação)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email já registado no sistema",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
    })
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Utilizador registado com sucesso."));
    }

    /**
     * Autentica um utilizador existente através das suas credenciais.
     * <p>
     * O processo envolve a verificação do hash da password e, em caso de sucesso,
     * a geração de um token JWT que deverá ser enviado pelo cliente em todos os pedidos subsequentes
     * no cabeçalho 'Authorization: Bearer [token]'.
     * </p>
     *
     * @param request DTO contendo o email (identificador) e a password em texto simples.
     * @return {@link ResponseEntity} contendo o token de acesso e a validade se configurada.
     * @see AuthService#login(LoginRequest)
     */
    @Operation(summary = "Login de utilizador", description = "Autentica as credenciais e retorna um token JWT.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login efetuado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dados de entrada inválidos (erro de validação)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Credenciais inválidas ou password incorreta",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Utilizador não encontrado com o email fornecido",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login efetuado com sucesso."));
    }
}
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
 * Controlador REST para autenticação e registo de utilizadores.
 * <p>
 * Fornece endpoints públicos para criação de conta e login, retornando um {@link ApiResponse}
 * que encapsula o token JWT em caso de sucesso ou detalhes de erro em caso de falha.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 */
@RestController
@RequestMapping("/api/v1/users/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints para login e registo de utilizadores")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Registar novo utilizador", description = "Cria uma nova conta de utilizador e retorna um token JWT.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Utilizador registado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dados de entrada inválidos (erro de validação)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email já registado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
    })
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Utilizador registado com sucesso."));
    }

    @Operation(summary = "Login de utilizador", description = "Autentica as credenciais e retorna um token JWT.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login efetuado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dados de entrada inválidos (erro de validação)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Credenciais inválidas",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Utilizador não encontrado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login efetuado com sucesso."));
    }
}

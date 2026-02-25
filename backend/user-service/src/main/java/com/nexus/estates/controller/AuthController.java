package com.nexus.estates.controller;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.dto.LoginRequest;
import com.nexus.estates.dto.RegisterRequest;
import com.nexus.estates.dto.AuthResponse;
import com.nexus.estates.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwaggerApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST responsável pela autenticação e registo de utilizadores.
 * <p>
 *     Fornece endpoints públicos para criação de conta e login, retornando tokens JWT.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 * @since 2026-02-15
 */
@RestController
@RequestMapping("/api/v1/users/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Endpoints para login e registo de utilizadores")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Registar novo utilizador", description = "Cria uma nova conta de utilizador e retorna um token JWT.")
    @ApiResponses(value = {
            @SwaggerApiResponse(responseCode = "200", description = "Utilizador registado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @SwaggerApiResponse(responseCode = "409", description = "Email já registado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
    })
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Utilizador registado com sucesso."));
    }

    @Operation(summary = "Login de utilizador", description = "Autentica as credenciais e retorna um token JWT.")
    @ApiResponses(value = {
            @SwaggerApiResponse(responseCode = "200", description = "Login efetuado com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @SwaggerApiResponse(responseCode = "401", description = "Credenciais inválidas",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @SwaggerApiResponse(responseCode = "404", description = "Utilizador não encontrado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login efetuado com sucesso."));
    }
}

package com.nexus.estates.controller;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.dto.ForgotPasswordRequest;
import com.nexus.estates.dto.ResetPasswordRequest;
import com.nexus.estates.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST para gestão de recuperação de palavras-passe.
 * <p>
 *     Disponibiliza endpoints públicos para iniciar o processo de recuperação (envio de email)
 *     e para efetivar a alteração da password através de um token seguro.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 */
@RestController
@RequestMapping("/api/v1/users/password")
@RequiredArgsConstructor
@Tag(name = "Recuperação de Password", description = "Endpoints para reset de password (esqueci-me da senha)")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    /**
     * Inicia o processo de recuperação de password enviando um email com o token.
     *
     * @param request DTO contendo o email do utilizador.
     * @return Resposta de sucesso genérica (para evitar enumeração de utilizadores).
     */
    @Operation(summary = "Solicitar recuperação de password", description = "Envia um email com um link/token para redefinir a password.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Pedido aceite (email enviado se existir)",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Email inválido",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/forgot")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.initiatePasswordReset(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null, "Se o email existir, as instruções foram enviadas."));
    }

    /**
     * Redefine a password do utilizador utilizando um token válido.
     *
     * @param request DTO contendo o token e a nova password.
     * @return Resposta de sucesso.
     */
    @Operation(summary = "Redefinir password", description = "Altera a password do utilizador mediante apresentação de um token válido.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Password alterada com sucesso",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Token inválido ou expirado",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class)))
    })
    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success(null, "Password alterada com sucesso."));
    }
}

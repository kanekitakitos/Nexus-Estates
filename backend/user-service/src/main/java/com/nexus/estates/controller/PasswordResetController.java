package com.nexus.estates.controller;

import com.nexus.estates.dto.ForgotPasswordRequest;
import com.nexus.estates.dto.ResetPasswordRequest;
import com.nexus.estates.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador REST responsável pela recuperação de passwords.
 * <p>
 *     Fornece endpoints para iniciar o processo de recuperação e redefinir a password.
 * </p>
 */
@RestController
@RequestMapping("/api/v1/users/password")
@RequiredArgsConstructor
@Tag(name = "Recuperação de Password", description = "Endpoints para recuperação e redefinição de password")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    /**
     * Inicia o processo de recuperação de password.
     *
     * @param request DTO contendo o email do utilizador.
     * @return ResponseEntity com mensagem de sucesso (e token simulado).
     */
    @Operation(summary = "Iniciar recuperação de password", description = "Gera um token de recuperação e envia por email (simulado).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token gerado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Utilizador não encontrado")
    })
    @PostMapping("/forgot")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String token = passwordResetService.forgotPassword(request);
        return ResponseEntity.ok("Token gerado com sucesso: " + token);
    }

    /**
     * Redefine a password do utilizador.
     *
     * @param request DTO contendo o token e a nova password.
     * @return ResponseEntity com mensagem de sucesso.
     */
    @Operation(summary = "Redefinir password", description = "Redefine a password do utilizador usando um token válido.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password redefinida com sucesso"),
            @ApiResponse(responseCode = "400", description = "Token inválido ou expirado")
    })
    @PostMapping("/reset")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok("Password redefinida com sucesso.");
    }
}

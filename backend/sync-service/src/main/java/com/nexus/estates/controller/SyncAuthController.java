package com.nexus.estates.controller;

import com.nexus.estates.service.ChatPlatform;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller responsável por fornecer autenticação para serviços de sincronização em tempo real.
 */
@RestController
@RequestMapping("/api/sync/auth")
@RequiredArgsConstructor
public class SyncAuthController {

    private final ChatPlatform chatPlatform;

    /**
     * Gera e retorna um token de autenticação para um cliente se conectar a um canal de tempo real.
     * <p>
     * Este endpoint deve ser protegido por autenticação (ex: JWT) para garantir que apenas
     * usuários autorizados possam solicitar tokens.
     * </p>
     *
     * @param bookingId O ID da reserva, usado como base para o nome do canal.
     * @return Uma resposta contendo o token de acesso ou um erro.
     */
    @GetMapping("/realtime")
    public ResponseEntity<?> getRealtimeToken(@RequestParam String bookingId) {
        // TODO: Implementar a lógica de validação de segurança:
        // 1. Extrair o ID do usuário do token JWT (ex: via @AuthenticationPrincipal).
        // 2. Chamar um serviço de domínio (ex: BookingService) para verificar se o usuário
        //    autenticado tem permissão para acessar o chat da reserva com o `bookingId` fornecido.

        // Simulação: Usando um ID de usuário fixo para fins de desenvolvimento.
        String userId = "simulated-user-id-from-jwt";
        String channelId = "booking-chat:" + bookingId;

        Object token = chatPlatform.generateClientToken(userId, channelId);

        if (token != null) {
            return ResponseEntity.ok(token);
        } else {
            // Em produção, é melhor logar o erro e retornar uma resposta genérica.
            return ResponseEntity.status(500).body("Error generating authentication token.");
        }
    }
}

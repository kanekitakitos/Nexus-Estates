package com.nexus.estates.controller;

import com.nexus.estates.client.Proxy;
import com.nexus.estates.service.interfaces.ChatPlatform;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller responsável por fornecer autenticação para serviços de sincronização em tempo real.
 */
@Slf4j
@RestController
@RequestMapping("/api/sync/auth")
@RequiredArgsConstructor
public class SyncAuthController {

    private final Proxy proxy;
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
        Long authenticatedUserId = 1L;

        try {
            // Comunica com o user-service via Proxy para obter detalhes do usuário (ex: email).
            // Isso valida a existência do usuário e obtém sua identidade oficial para o chat.
            String userEmail = proxy.userClient().getUserEmail(authenticatedUserId);
            
            // Define o canal de chat específico para esta reserva
            String channelId = "booking-chat:" + bookingId;

            // Gera o token de acesso ao Ably com permissões restritas
            Object token = chatPlatform.generateClientToken(userEmail, channelId);

            if (token != null) {
                return ResponseEntity.ok(token);
            } else {
                log.error("Falha ao gerar token Ably para usuário {}", userEmail);
                return ResponseEntity.status(500).body("Error generating authentication token.");
            }
        } catch (Exception e) {
            log.error("Erro ao comunicar com user-service ou gerar token: {}", e.getMessage());
            return ResponseEntity.status(403).body("Access denied or user not found.");
        }
    }
}

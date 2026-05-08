package com.nexus.estates.controller;

import com.nexus.estates.client.Proxy;
import com.nexus.estates.service.chat.ChatPlatform;
import com.nexus.estates.service.chat.PropertyInquiryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
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
@Tag(name = "Sync Auth", description = "Autenticação para serviços de sincronização em tempo real.")
public class SyncAuthController {

    private final Proxy proxy;
    private final ChatPlatform chatPlatform;
    private final PropertyInquiryService inquiryService;

    /**
     * Gera e retorna um token de autenticação para um cliente se conectar a um canal de tempo real.
     * <p>
     * Este endpoint deve ser protegido por autenticação (ex: JWT) para garantir que apenas
     * usuários autorizados possam solicitar tokens.
     * </p>
     *
     * <p>O token é emitido com permissões restritas ao canal de destino e apenas após validação
     * de autorização no domínio respetivo:</p>
     * <ul>
     *   <li>BOOKING: participante da reserva (hóspede/proprietário)</li>
     *   <li>PROPERTY_INQUIRY: guest criador ou utilizador com permissões na propriedade</li>
     * </ul>
     *
     * @param bookingId O ID da reserva, usado como base para o nome do canal.
     * @param inquiryId O ID da inquiry, usado como base para o nome do canal.
     * @return Uma resposta contendo o token de acesso ou um erro.
     */
    @Operation(summary = "Token realtime", description = "Gera token de acesso ao canal de chat (booking ou inquiry).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Token gerado com sucesso", content = @Content),
            @ApiResponse(responseCode = "401", description = "Utilizador não autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acesso negado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content)
    })
    @GetMapping("/realtime")
    public ResponseEntity<?> getRealtimeToken(
            @Parameter(description = "ID da reserva", example = "123") @RequestParam(required = false) Long bookingId,
            @Parameter(description = "ID da inquiry (conversa por propriedade)", example = "456") @RequestParam(required = false) Long inquiryId,
            @Parameter(description = "ID do utilizador autenticado (injetado pelo API Gateway)")
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @Parameter(description = "Email do utilizador autenticado (injetado pelo API Gateway)")
            @RequestHeader(value = "X-User-Email", required = false) String userEmailHeader
    ) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            return ResponseEntity.status(401).body("Missing X-User-Id header.");
        }

        Long authenticatedUserId;
        try {
            authenticatedUserId = Long.parseLong(userIdHeader);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid X-User-Id header.");
        }

        try {
            String clientId = String.valueOf(authenticatedUserId);

            String channelId;
            if (bookingId != null) {
                var participants = proxy.bookingClient().getBookingParticipants(bookingId, authenticatedUserId);
                if (participants == null || !participants.contains(authenticatedUserId)) {
                    return ResponseEntity.status(403).body("Access denied.");
                }
                channelId = "booking-chat:" + bookingId;
            } else if (inquiryId != null) {
                if (!inquiryService.canAccess(inquiryId, authenticatedUserId)) {
                    return ResponseEntity.status(403).body("Access denied.");
                }
                channelId = "inquiry-chat:" + inquiryId;
            } else {
                return ResponseEntity.badRequest().body("Missing bookingId or inquiryId parameter.");
            }

            Object token = chatPlatform.generateClientToken(clientId, channelId);

            if (token != null) {
                return ResponseEntity.ok(token);
            } else {
                log.error("Falha ao gerar token Ably para o utilizador {}", authenticatedUserId);
                return ResponseEntity.status(500).body("Error generating authentication token.");
            }
        } catch (Exception e) {
            log.error("Erro ao gerar token realtime: {}", e.getMessage());
            return ResponseEntity.status(403).body("Access denied or user not found.");
        }
    }
}

package com.nexus.estates.controller;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.dto.WebhookSubscriptionDTO;
import com.nexus.estates.service.chat.WebhookSubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoint para gestão de subscrições de Webhooks externos.
 */
@Slf4j
@RestController
@RequestMapping("/api/sync/webhooks")
@RequiredArgsConstructor
@Tag(name = "Webhooks", description = "Gestão de subscrições para notificações externas (US-38).")
public class WebhookSubscriptionController {

    private final WebhookSubscriptionService service;

    @PostMapping
    @Operation(summary = "Criar Webhook", description = "Regista um novo URL para receber eventos do sistema.")
    public ResponseEntity<ApiResponse<WebhookSubscriptionDTO.CreatedResponse>> create(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody WebhookSubscriptionDTO.CreateRequest request) {

        var response = service.createSubscription(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Webhook criado com sucesso. Guarde o segredo com segurança."));
    }

    @GetMapping
    @Operation(summary = "Listar Webhooks", description = "Retorna todos os webhooks configurados pelo utilizador.")
    public ResponseEntity<ApiResponse<List<WebhookSubscriptionDTO.Response>>> list(
            @RequestHeader("X-User-Id") Long userId) {

        var list = service.getUserSubscriptions(userId);
        return ResponseEntity.ok(ApiResponse.success(list, "Lista de webhooks recuperada."));
    }

    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Ativar/Desativar Webhook", description = "Alterna o estado de envio de um webhook específico.")
    public ResponseEntity<ApiResponse<Void>> toggle(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {

        service.toggleSubscription(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Estado do webhook atualizado."));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover Webhook", description = "Elimina permanentemente uma subscrição.")
    public ResponseEntity<ApiResponse<Void>> delete(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {

        service.deleteSubscription(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Webhook removido com sucesso."));
    }
}
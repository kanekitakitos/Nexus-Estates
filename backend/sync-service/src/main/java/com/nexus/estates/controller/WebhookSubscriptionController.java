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
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/sync/webhooks")
@RequiredArgsConstructor
@Tag(name = "Webhooks", description = "Gestão de subscrições para notificações externas (US-38).")
public class WebhookSubscriptionController {

    private final WebhookSubscriptionService service;


    /**
     * Regista uma nova subscrição de webhook para o utilizador
     * <p>
     *     Gera automaticaemnte um segredo (secret) criptográfico que será usado para assinar as mensagens enviadas
     *     para o o URL forncedio, garantindo a autenticidade e a segurança da integração externa
     * </p>
     * @param userId O identificador do utilizador que está a criar o webhook
     * @param request O playload contendo o URL de destino e a lista de eventos subscritos
     * @return Uma resposta de sucesso contendo os detalhes do webhook criado e o segredo gerado
     */
    @PostMapping
    @Operation(summary = "Criar Webhook", description = "Regista um novo URL para receber eventos do sistema.")
    public ResponseEntity<ApiResponse<WebhookSubscriptionDTO.CreatedResponse>> create(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody WebhookSubscriptionDTO.CreateRequest request) {

        var response = service.createSubscription(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Webhook criado com sucesso. Guarde o segredo com segurança."));
    }


    /**
     * Recupera todas as subscrições de webhooks (ativas e inativas) do utilizador
     * @param userId O identificador do utilizador que fez o pedido
     * @return Uma resposta padronizada contendo a lista com os detalhes de cada subscrição
     */
    @GetMapping
    @Operation(summary = "Listar Webhooks", description = "Retorna todos os webhooks configurados pelo utilizador.")
    public ResponseEntity<ApiResponse<List<WebhookSubscriptionDTO.Response>>> list(
            @RequestHeader("X-User-Id") Long userId) {

        var list = service.getUserSubscriptions(userId);
        return ResponseEntity.ok(ApiResponse.success(list, "Lista de webhooks recuperada."));
    }


    /**
     * Alterna o estado (ativo/inativo) de uma subscrição de webhook existente
     * <p>
     *     Se o webhook estiver desativado, os eventos do sistema não serão enviados para o URL
     *     de destino até que este seja reativado pelo utilizador
     * </p>
     * @param userId O identificador do utilizador proprietário do webhook
     * @param id O identificador único do webhook a alterar
     * @return Uma resposta de sucesso vazia indicando que o estado foi atualizado
     */
    @PatchMapping("/{id}/toggle")
    @Operation(summary = "Ativar/Desativar Webhook", description = "Alterna o estado de envio de um webhook específico.")
    public ResponseEntity<ApiResponse<Void>> toggle(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {

        service.toggleSubscription(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Estado do webhook atualizado."));
    }


    /**
     * Remove permanetemente uma subscrição de webhook do sistema
     * @param userId O identificador do utilizador proprietário do webhook
     * @param id O identificador único do webhook a eliminar
     * @return Uma resposta de sucesso vazia confirmando a eliminação
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Remover Webhook", description = "Elimina permanentemente uma subscrição.")
    public ResponseEntity<ApiResponse<Void>> delete(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {

        service.deleteSubscription(userId, id);
        return ResponseEntity.ok(ApiResponse.success(null, "Webhook removido com sucesso."));
    }
}
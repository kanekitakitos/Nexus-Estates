package com.nexus.estates.controller;

import com.nexus.estates.service.StripeWebhookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controlador REST responsável por expor os endpoints de receção de webhooks
 * <p>
 *     Atua como o ouvinte público para integrações assíncronas de terceiros (ex: Stripe)
 *     Delega a validação de assinaturas e o processamento idempotente dos eventos para a camada de serviço
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/finance/webhooks")
@Tag(name = "Finance Webhooks", description = "Receção de webhooks de pagamentos.")
public class StripeWebhookController {

    private final StripeWebhookService stripeWebhookService;

    public StripeWebhookController(StripeWebhookService stripeWebhookService) {
        this.stripeWebhookService = stripeWebhookService;
    }

    /**
     * Recebe webhooks do Stripe, valida a assinatura e processa eventos de forma idempotente
     * @param payload O corpo do pedido HTTP enviado pelo stripe (em formato JSON bruto)
     * @param signatureHeader O cabeçalho 'Stripe-Signature' usado para garantir que o pedido é autêntico
     * @return {@link ResponseEntity} com um mapa de sucesso se o webhook for aceite e processado
     */
    @Operation(summary = "Webhook Stripe", description = "Valida a assinatura e processa eventos idempotentes.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Evento recebido", content = @Content),
            @ApiResponse(responseCode = "400", description = "Assinatura inválida", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content)
    })
    @PostMapping("/stripe")
    public ResponseEntity<Map<String, Object>> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signatureHeader
    ) {
        stripeWebhookService.handleStripeWebhook(payload, signatureHeader);
        return ResponseEntity.ok(Map.of("received", true));
    }
}

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

@RestController
@RequestMapping("/api/finance/webhooks")
@Tag(name = "Finance Webhooks", description = "Receção de webhooks de pagamentos.")
public class StripeWebhookController {

    private final StripeWebhookService stripeWebhookService;

    public StripeWebhookController(StripeWebhookService stripeWebhookService) {
        this.stripeWebhookService = stripeWebhookService;
    }

    /**
     * Recebe webhooks do Stripe, valida assinatura e processa eventos de forma idempotente.
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

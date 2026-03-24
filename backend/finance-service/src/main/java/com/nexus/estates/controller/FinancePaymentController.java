package com.nexus.estates.controller;

import com.nexus.estates.dto.payment.*;
import com.nexus.estates.service.FinancePaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/finance")
@Tag(name = "Finance Payments", description = "Operações de pagamentos (Stripe) e transações.")
public class FinancePaymentController {

    private final FinancePaymentService financePaymentService;

    public FinancePaymentController(FinancePaymentService financePaymentService) {
        this.financePaymentService = financePaymentService;
    }

    /**
     * Cria um PaymentIntent e persiste o registo local no finance-service.
     *
     * @param bookingId ID da reserva
     * @param request   dados de criação da intenção
     * @return resposta unificada do pagamento
     */
    @Operation(summary = "Cria intenção de pagamento", description = "Cria um PaymentIntent e persiste o registo local.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Intenção criada", content = @Content(schema = @Schema(implementation = PaymentResponse.Intent.class))),
            @ApiResponse(responseCode = "400", description = "Pedido inválido", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content)
    })
    @PostMapping("/bookings/{bookingId}/payments/intent")
    public ResponseEntity<PaymentResponse> createPaymentIntent(
            @Parameter(description = "ID da reserva") @PathVariable Long bookingId,
            @Valid @RequestBody CreatePaymentIntentRequest request
    ) {
        return ResponseEntity.ok(
                financePaymentService.createPaymentIntent(
                        bookingId,
                        request.amount(),
                        request.currency(),
                        request.paymentMethod(),
                        request.metadata()
                )
        );
    }

    /**
     * Confirma um PaymentIntent no provedor e, em sucesso, confirma a reserva.
     */
    @Operation(summary = "Confirma pagamento", description = "Confirma um PaymentIntent no provedor e, em sucesso, confirma a reserva.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pagamento confirmado", content = @Content(schema = @Schema(implementation = PaymentResponse.Success.class))),
            @ApiResponse(responseCode = "400", description = "Pedido inválido", content = @Content),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content)
    })
    @PostMapping("/bookings/{bookingId}/payments/confirm")
    public ResponseEntity<PaymentResponse> confirmPayment(
            @Parameter(description = "ID da reserva") @PathVariable Long bookingId,
            @Valid @RequestBody ConfirmPaymentRequest request
    ) {
        return ResponseEntity.ok(financePaymentService.confirmPayment(bookingId, request.paymentIntentId(), request.metadata()));
    }

    /**
     * Processa pagamento direto no provedor e, em sucesso, confirma a reserva.
     */
    @Operation(summary = "Pagamento direto", description = "Processa pagamento direto no provedor e, em sucesso, confirma a reserva.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pagamento concluído", content = @Content(schema = @Schema(implementation = PaymentResponse.Success.class))),
            @ApiResponse(responseCode = "400", description = "Pedido inválido", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content)
    })
    @PostMapping("/bookings/{bookingId}/payments/direct")
    public ResponseEntity<PaymentResponse> processDirectPayment(
            @Parameter(description = "ID da reserva") @PathVariable Long bookingId,
            @Valid @RequestBody DirectPaymentRequest request
    ) {
        return ResponseEntity.ok(
                financePaymentService.processDirectPayment(
                        bookingId,
                        request.amount(),
                        request.currency(),
                        request.paymentMethod(),
                        request.metadata()
                )
        );
    }

    /**
     * Processa reembolso de uma transação.
     */
    @Operation(summary = "Processa reembolso", description = "Cria um Refund no provedor.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reembolso processado", content = @Content(schema = @Schema(implementation = RefundResult.class))),
            @ApiResponse(responseCode = "400", description = "Pedido inválido", content = @Content),
            @ApiResponse(responseCode = "404", description = "Transação não encontrada", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content)
    })
    @PostMapping("/bookings/{bookingId}/payments/refund")
    public ResponseEntity<RefundResult> refund(
            @Parameter(description = "ID da reserva") @PathVariable Long bookingId,
            @Valid @RequestBody RefundRequest request
    ) {
        return ResponseEntity.ok(
                financePaymentService.processRefund(
                        request.transactionId(),
                        request.amount(),
                        request.currency(),
                        Optional.ofNullable(request.reason()),
                        request.metadata() != null ? request.metadata() : Map.of("bookingId", bookingId.toString())
                )
        );
    }

    /**
     * Obtém informações do provider de pagamentos ativo.
     */
    @Operation(summary = "Info do provedor", description = "Retorna detalhes sobre o gateway de pagamento configurado.")
    @GetMapping("/payments/provider")
    public ResponseEntity<ProviderInfo> getPaymentProviderInfo() {
        return ResponseEntity.ok(financePaymentService.getProviderInfo());
    }

    /**
     * Consulta detalhes de uma transação específica.
     */
    @Operation(summary = "Detalhes da transação", description = "Consulta informações de uma transação específica pelo ID.")
    @GetMapping("/payments/transactions/{transactionId}")
    public ResponseEntity<TransactionInfo> getTransactionDetails(@PathVariable String transactionId) {
        return ResponseEntity.ok(financePaymentService.getTransactionDetails(transactionId));
    }

    /**
     * Obtém o estado corrente de uma transação.
     */
    @Operation(summary = "Estado do pagamento", description = "Verifica o status atual de uma transação.")
    @GetMapping("/payments/transactions/{transactionId}/status")
    public ResponseEntity<PaymentStatus> getPaymentStatus(@PathVariable String transactionId) {
        return ResponseEntity.ok(financePaymentService.getPaymentStatus(transactionId));
    }

    /**
     * Verifica se um método de pagamento é suportado.
     */
    @Operation(summary = "Suporte a método de pagamento", description = "Verifica se o gateway suporta determinado método.")
    @GetMapping("/payments/methods/{paymentMethod}/supported")
    public ResponseEntity<Map<String, Object>> supportsPaymentMethod(@PathVariable PaymentMethod paymentMethod) {
        boolean supported = financePaymentService.supportsPaymentMethod(paymentMethod);
        return ResponseEntity.ok(Map.of("paymentMethod", paymentMethod.name(), "supported", supported));
    }

    /**
     * Request para criação de PaymentIntent.
     */
    public record CreatePaymentIntentRequest(
            @NotNull @Positive BigDecimal amount,
            @NotBlank String currency,
            @NotNull PaymentMethod paymentMethod,
            Map<String, Object> metadata
    ) {}

    /**
     * Request para confirmação de PaymentIntent.
     */
    public record ConfirmPaymentRequest(
            @NotBlank String paymentIntentId,
            Map<String, Object> metadata
    ) {}

    /**
     * Request para pagamento direto (confirm imediato).
     */
    public record DirectPaymentRequest(
            @NotNull @Positive BigDecimal amount,
            @NotBlank String currency,
            @NotNull PaymentMethod paymentMethod,
            Map<String, Object> metadata
    ) {}

    /**
     * Request para processamento de reembolso.
     */
    public record RefundRequest(
            @NotBlank String transactionId,
            BigDecimal amount,
            @NotBlank String currency,
            String reason,
            Map<String, Object> metadata
    ) {}
}

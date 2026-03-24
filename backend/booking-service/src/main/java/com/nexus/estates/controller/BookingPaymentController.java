package com.nexus.estates.controller;

import com.nexus.estates.dto.payment.*;
import com.nexus.estates.service.BookingPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Controlador REST dedicado às operações de pagamento de reservas.
 * <p>
 * Este controlador expõe endpoints de pagamentos no domínio de reservas, mas a execução
 * efetiva das operações financeiras é delegada ao finance-service via {@link BookingPaymentService}.
 * </p>
 *
 * <p>Nota: o endpoint {@code /payments/succeeded} é um callback interno (server-to-server)
 * usado pelo finance-service após pagamento concluído (confirm/direct ou webhook).</p>
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-10
 */
@RestController
@RequestMapping("/api/bookings")
@Tag(
        name = "Booking Payments",
        description = "Operações financeiras relacionadas a reservas (Pagamentos, Reembolsos, Transações)."
)
public class BookingPaymentController {

    private final BookingPaymentService bookingPaymentService;

    /**
     * Instancia o controlador de pagamentos.
     *
     * @param bookingPaymentService Serviço especializado em processamento de pagamentos.
     */
    public BookingPaymentController(BookingPaymentService bookingPaymentService) {
        this.bookingPaymentService = bookingPaymentService;
    }

    /**
     * Cria uma intenção de pagamento para uma reserva.
     * <p>
     * Inicia o fluxo de pagamento, retornando os dados necessários para que o cliente
     * finalize a transação (ex: client secret).
     * </p>
     *
     * @param bookingId ID da reserva.
     * @param request Dados para criação da intenção (método de pagamento).
     * @return {@link PaymentResponse} com os detalhes da intenção criada.
     */
    @Operation(
            summary = "Cria intenção de pagamento",
            description = "Delegado ao finance-service: cria um PaymentIntent para ser finalizado pelo cliente."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Intenção criada com sucesso", content = @Content(schema = @Schema(implementation = PaymentResponse.Intent.class))),
            @ApiResponse(responseCode = "404", description = "Reserva não encontrada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou estado da reserva incompatível")
    })
    @PostMapping("/{bookingId}/payments/intent")
    public ResponseEntity<PaymentResponse> createPaymentIntent(
            @Parameter(description = "ID da reserva") @PathVariable Long bookingId,
            @Valid @RequestBody PaymentIntentRequest request
    ) {
        return ResponseEntity.ok(bookingPaymentService.createPaymentIntent(bookingId, request.paymentMethod()));
    }

    /**
     * Confirma um pagamento previamente iniciado.
     * <p>
     * Finaliza o processo de pagamento associando a transação à reserva e atualizando o seu estado.
     * </p>
     *
     * @param bookingId ID da reserva.
     * @param request Dados da confirmação (ID da intenção).
     * @return {@link PaymentResponse} com o resultado da confirmação.
     */
    @Operation(
            summary = "Confirma pagamento",
            description = "Delegado ao finance-service: confirma a transação e, em sucesso, confirma a reserva."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pagamento confirmado", content = @Content(schema = @Schema(implementation = PaymentResponse.Success.class))),
            @ApiResponse(responseCode = "400", description = "Pedido inválido ou falha no provider"),
            @ApiResponse(responseCode = "500", description = "Erro no processamento do pagamento")
    })
    @PostMapping("/{bookingId}/payments/confirm")
    public ResponseEntity<PaymentResponse> confirmPayment(
            @Parameter(description = "ID da reserva") @PathVariable Long bookingId,
            @Valid @RequestBody ConfirmPaymentRequest request
    ) {
        return ResponseEntity.ok(bookingPaymentService.confirmPayment(bookingId, request.paymentIntentId()));
    }

    /**
     * Processa um pagamento direto (sem intenção prévia).
     *
     * @param bookingId ID da reserva.
     * @param request Dados do pagamento direto.
     * @return {@link PaymentResponse} com o resultado do processamento.
     */
    @Operation(
            summary = "Pagamento direto",
            description = "Delegado ao finance-service: processa um pagamento em passo único."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pagamento concluído", content = @Content(schema = @Schema(implementation = PaymentResponse.Success.class))),
            @ApiResponse(responseCode = "400", description = "Pedido inválido ou falha no provider"),
            @ApiResponse(responseCode = "500", description = "Erro interno")
    })
    @PostMapping("/{bookingId}/payments/direct")
    public ResponseEntity<PaymentResponse> processDirectPayment(
            @Parameter(description = "ID da reserva") @PathVariable Long bookingId,
            @Valid @RequestBody DirectPaymentRequest request
    ) {
        return ResponseEntity.ok(bookingPaymentService.processDirectPayment(bookingId, request.paymentMethod()));
    }

    /**
     * Solicita o reembolso de uma reserva.
     *
     * @param bookingId ID da reserva.
     * @param request Dados do reembolso (valor e motivo).
     * @return {@link RefundResult} com o status do reembolso.
     */
    @Operation(
            summary = "Processa reembolso",
            description = "Delegado ao finance-service: inicia o processo de devolução de valores pagos."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reembolso processado", content = @Content(schema = @Schema(implementation = RefundResult.class))),
            @ApiResponse(responseCode = "400", description = "Pedido inválido"),
            @ApiResponse(responseCode = "404", description = "Reserva ou transação não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno")
    })
    @PostMapping("/{bookingId}/payments/refund")
    public ResponseEntity<RefundResult> refund(
            @Parameter(description = "ID da reserva") @PathVariable Long bookingId,
            @RequestBody(required = false) RefundRequest request
    ) {
        BigDecimal amount = request != null ? request.amount() : null;
        String reason = request != null ? request.reason() : null;
        return ResponseEntity.ok(bookingPaymentService.processRefund(bookingId, amount, reason));
    }

    /**
     * Obtém informações sobre o provedor de pagamentos ativo.
     *
     * @return {@link ProviderInfo} com detalhes do gateway.
     */
    @Operation(summary = "Info do provedor", description = "Retorna detalhes sobre o gateway de pagamento configurado.")
    @GetMapping("/payments/provider")
    public ResponseEntity<ProviderInfo> getPaymentProviderInfo() {
        return ResponseEntity.ok(bookingPaymentService.getProviderInfo());
    }

    /**
     * Consulta detalhes de uma transação específica.
     *
     * @param transactionId ID da transação no gateway.
     * @return {@link TransactionInfo} com os dados da transação.
     */
    @Operation(summary = "Detalhes da transação", description = "Consulta informações de uma transação específica pelo ID.")
    @GetMapping("/payments/transactions/{transactionId}")
    public ResponseEntity<TransactionInfo> getTransactionDetails(@PathVariable String transactionId) {
        return ResponseEntity.ok(bookingPaymentService.getTransactionDetails(transactionId));
    }

    /**
     * Verifica o estado atual de um pagamento.
     *
     * @param transactionId ID da transação.
     * @return {@link PaymentStatus} atual.
     */
    @Operation(summary = "Estado do pagamento", description = "Verifica o status atual de uma transação.")
    @GetMapping("/payments/transactions/{transactionId}/status")
    public ResponseEntity<PaymentStatus> getPaymentStatus(@PathVariable String transactionId) {
        return ResponseEntity.ok(bookingPaymentService.getPaymentStatus(transactionId));
    }

    /**
     * Verifica se um método de pagamento é suportado.
     *
     * @param paymentMethod Método a verificar.
     * @return Mapa indicando suporte (true/false).
     */
    @Operation(summary = "Suporte a método de pagamento", description = "Verifica se o gateway suporta determinado método.")
    @GetMapping("/payments/methods/{paymentMethod}/supported")
    public ResponseEntity<Map<String, Object>> supportsPaymentMethod(@PathVariable PaymentMethod paymentMethod) {
        boolean supported = bookingPaymentService.supportsPaymentMethod(paymentMethod);
        return ResponseEntity.ok(Map.of("paymentMethod", paymentMethod.name(), "supported", supported));
    }

    /**
     * Callback interno chamado pelo finance-service quando um pagamento é confirmado.
     *
     * <p>Este endpoint não é destinado a consumo pelo frontend.</p>
     */
    @Operation(
            summary = "Callback interno: pagamento concluído",
            description = "Endpoint server-to-server usado pelo finance-service para confirmar a reserva após pagamento."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reserva confirmada"),
            @ApiResponse(responseCode = "400", description = "Pedido inválido"),
            @ApiResponse(responseCode = "404", description = "Reserva não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno")
    })
    @PostMapping("/{bookingId}/payments/succeeded")
    public ResponseEntity<Map<String, Object>> markPaymentSucceeded(
            @Parameter(description = "ID da reserva") @PathVariable Long bookingId,
            @Valid @RequestBody PaymentSucceededRequest request
    ) {
        bookingPaymentService.markPaymentSucceeded(bookingId, request.transactionId());
        return ResponseEntity.ok(Map.of("bookingId", bookingId, "status", "CONFIRMED"));
    }

    // DTOs internos (Records) para requisições
    public record PaymentIntentRequest(PaymentMethod paymentMethod) {}
    public record ConfirmPaymentRequest(String paymentIntentId) {}
    public record DirectPaymentRequest(PaymentMethod paymentMethod) {}
    public record RefundRequest(BigDecimal amount, String reason) {}
    public record PaymentSucceededRequest(String transactionId, String providerTransactionId) {}
}

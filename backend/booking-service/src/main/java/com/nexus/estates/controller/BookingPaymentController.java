package com.nexus.estates.controller;

import com.nexus.estates.dto.payment.*;
import com.nexus.estates.service.BookingPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Controlador REST dedicado às operações de pagamento de reservas.
 * <p>
 * Este controlador isola a lógica de pagamentos, interagindo diretamente com o
 * {@link BookingPaymentService} para processar transações, reembolsos e consultas
 * de estado de pagamento.
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
            description = "Gera uma intenção de pagamento para ser finalizada pelo cliente."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Intenção criada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Reserva não encontrada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou estado da reserva incompatível")
    })
    @PostMapping("/{bookingId}/payments/intent")
    public ResponseEntity<PaymentResponse> createPaymentIntent(
            @PathVariable Long bookingId,
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
            description = "Valida e confirma uma transação de pagamento, atualizando a reserva."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pagamento confirmado"),
            @ApiResponse(responseCode = "500", description = "Erro no processamento do pagamento")
    })
    @PostMapping("/{bookingId}/payments/confirm")
    public ResponseEntity<PaymentResponse> confirmPayment(
            @PathVariable Long bookingId,
            @Valid @RequestBody ConfirmPaymentRequest request
    ) {
        Map<String, Object> metadata = Map.of(
                "bookingId", bookingId.toString(),
                "confirmedAt", LocalDateTime.now().toString()
        );
        return ResponseEntity.ok(bookingPaymentService.confirmPayment(request.paymentIntentId(), metadata));
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
            description = "Processa um pagamento em passo único (ex: cartão salvo)."
    )
    @PostMapping("/{bookingId}/payments/direct")
    public ResponseEntity<PaymentResponse> processDirectPayment(
            @PathVariable Long bookingId,
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
            description = "Inicia o processo de devolução de valores pagos."
    )
    @PostMapping("/{bookingId}/payments/refund")
    public ResponseEntity<RefundResult> refund(
            @PathVariable Long bookingId,
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

    // DTOs internos (Records) para requisições
    public record PaymentIntentRequest(PaymentMethod paymentMethod) {}
    public record ConfirmPaymentRequest(String paymentIntentId) {}
    public record DirectPaymentRequest(PaymentMethod paymentMethod) {}
    public record RefundRequest(BigDecimal amount, String reason) {}
}

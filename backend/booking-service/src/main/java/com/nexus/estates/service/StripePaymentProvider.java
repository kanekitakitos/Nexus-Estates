package com.nexus.estates.service;

import com.nexus.estates.dto.payment.*;
import com.nexus.estates.exception.PaymentProcessingException;
import com.nexus.estates.exception.PaymentNotFoundException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementação do provedor de pagamentos Stripe.
 * <p>
 * Esta classe adapta a API oficial do Stripe para a interface genérica {@link PaymentGatewayProvider},
 * permitindo que o sistema processe pagamentos, reembolsos e consultas de transações usando a infraestrutura do Stripe.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @see PaymentGatewayProvider
 */
@Service
public class StripePaymentProvider implements PaymentGatewayProvider {

    /**
     * Cria uma intenção de pagamento (PaymentIntent) na API do Stripe.
     * <p>
     * Converte os valores monetários para centavos (menor unidade da moeda) conforme exigido pelo Stripe
     * e configura os metadados e métodos de pagamento automáticos.
     * </p>
     *
     * @param amount Valor do pagamento.
     * @param currency Moeda do pagamento (ex: "EUR").
     * @param referenceId ID de referência interno (ex: ID da reserva).
     * @param metadata Metadados adicionais para rastreamento.
     * @return O objeto {@link com.nexus.estates.dto.payment.PaymentIntent} mapeado da resposta do Stripe.
     * @throws PaymentProcessingException Se ocorrer um erro na comunicação com a API do Stripe.
     */
    @Override
    public com.nexus.estates.dto.payment.PaymentIntent createPaymentIntent(BigDecimal amount, String currency, String referenceId, Map<String, Object> metadata) {
        try {
            long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
            
            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(currency.toLowerCase())
                    .setDescription("Booking payment for reference: " + referenceId)
                    .putAllMetadata(convertMetadata(metadata))
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    );
            
            PaymentIntent stripeIntent = PaymentIntent.create(paramsBuilder.build());
            
            return new com.nexus.estates.dto.payment.PaymentIntent(
                    stripeIntent.getId(),
                    "Stripe",
                    BigDecimal.valueOf(stripeIntent.getAmount()).divide(BigDecimal.valueOf(100)),
                    stripeIntent.getCurrency(),
                    referenceId,
                    mapStripeStatusToDto(stripeIntent.getStatus()),
                    stripeIntent.getClientSecret(),
                    LocalDateTime.now(),
                    null,
                    metadata,
                    null,
                    "requires_action".equals(stripeIntent.getStatus()),
                    stripeIntent.getNextAction() != null ? stripeIntent.getNextAction().getType() : null
            );
            
        } catch (StripeException e) {
            throw new PaymentProcessingException("Failed to create Stripe payment intent: " + e.getMessage(), e);
        }
    }

    /**
     * Confirma uma intenção de pagamento existente no Stripe.
     *
     * @param paymentIntentId O ID da intenção de pagamento no Stripe.
     * @param metadata Metadados adicionais (não utilizados diretamente na confirmação do Stripe, mas passados para o DTO).
     * @return A confirmação do pagamento mapeada para {@link PaymentConfirmation}.
     * @throws PaymentProcessingException Se a confirmação falhar na API do Stripe.
     */
    @Override
    public PaymentConfirmation confirmPaymentIntent(String paymentIntentId, Map<String, Object> metadata) {
        try {
            PaymentIntent stripeIntent = PaymentIntent.retrieve(paymentIntentId);
            PaymentIntent confirmedIntent = stripeIntent.confirm();
            
            return new PaymentConfirmation(
                    confirmedIntent.getId(),
                    confirmedIntent.getId(),
                    mapStripeStatusToDto(confirmedIntent.getStatus()),
                    LocalDateTime.now(),
                    null,
                    null,
                    metadata,
                    BigDecimal.ZERO,
                    "card",
                    null,
                    null,
                    false
            );
            
        } catch (StripeException e) {
            throw new PaymentProcessingException("Failed to confirm Stripe payment: " + e.getMessage(), e);
        }
    }

    /**
     * Processa um pagamento direto criando e confirmando um PaymentIntent em uma única operação.
     *
     * @param amount Valor do pagamento.
     * @param currency Moeda do pagamento.
     * @param referenceId ID de referência interno.
     * @param paymentMethod Método de pagamento (atualmente assume cartão/automático).
     * @param metadata Metadados adicionais.
     * @return O resultado do pagamento mapeado para {@link PaymentResult}.
     * @throws PaymentProcessingException Se o processamento falhar na API do Stripe.
     */
    @Override
    public PaymentResult processDirectPayment(BigDecimal amount, String currency, String referenceId, PaymentMethod paymentMethod, Map<String, Object> metadata) {
        try {
            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(amount.multiply(BigDecimal.valueOf(100)).longValue())
                    .setCurrency(currency.toLowerCase())
                    .setDescription("Direct payment for reference: " + referenceId)
                    .putAllMetadata(convertMetadata(metadata))
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    );
            
            PaymentIntent stripeIntent = PaymentIntent.create(paramsBuilder.build());
            PaymentIntent confirmedIntent = stripeIntent.confirm();
            
            return new PaymentResult(
                    confirmedIntent.getId(),
                    confirmedIntent.getId(),
                    BigDecimal.valueOf(confirmedIntent.getAmount()).divide(BigDecimal.valueOf(100)),
                    confirmedIntent.getCurrency(),
                    mapStripeStatusToDto(confirmedIntent.getStatus()),
                    LocalDateTime.now(),
                    null,
                    null,
                    metadata,
                    null,
                    null,
                    BigDecimal.ZERO,
                    "card",
                    "requires_action".equals(confirmedIntent.getStatus()),
                    confirmedIntent.getNextAction() != null ? confirmedIntent.getNextAction().getType() : null
            );
            
        } catch (StripeException e) {
            throw new PaymentProcessingException("Failed to process direct payment: " + e.getMessage(), e);
        }
    }

    /**
     * Processa um reembolso total ou parcial de uma transação.
     *
     * @param transactionId O ID da transação original (PaymentIntent ID).
     * @param amount O valor a ser reembolsado.
     * @param currency A moeda do reembolso.
     * @param reason O motivo do reembolso (opcional).
     * @param metadata Metadados adicionais.
     * @return O resultado do reembolso mapeado para {@link RefundResult}.
     * @throws PaymentProcessingException Se o reembolso falhar na API do Stripe.
     */
    @Override
    public RefundResult processRefund(String transactionId, BigDecimal amount, String currency, Optional<String> reason, Map<String, Object> metadata) {
        try {
            long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
            
            RefundCreateParams.Builder paramsBuilder = RefundCreateParams.builder()
                    .setPaymentIntent(transactionId)
                    .setAmount(amountInCents)
                    .setReason(mapRefundReason(reason.orElse(null)));
            
            Refund stripeRefund = Refund.create(paramsBuilder.build());
            
            return new RefundResult(
                    stripeRefund.getId(),
                    stripeRefund.getId(),
                    transactionId,
                    BigDecimal.valueOf(stripeRefund.getAmount()).divide(BigDecimal.valueOf(100)),
                    stripeRefund.getCurrency(),
                    mapStripeRefundStatusToDto(stripeRefund.getStatus()),
                    LocalDateTime.now(),
                    reason.orElse("requested_by_customer"),
                    metadata,
                    stripeRefund.getFailureReason(),
                    BigDecimal.ZERO
            );
            
        } catch (StripeException e) {
            throw new PaymentProcessingException("Failed to process Stripe refund: " + e.getMessage(), e);
        }
    }

    /**
     * Recupera os detalhes de uma transação (PaymentIntent) do Stripe.
     *
     * @param transactionId O ID da transação.
     * @return Os detalhes da transação mapeados para {@link TransactionDetails}.
     * @throws PaymentNotFoundException Se a transação não for encontrada no Stripe.
     */
    @Override
    public TransactionDetails getTransactionDetails(String transactionId) {
        try {
            PaymentIntent stripeIntent = PaymentIntent.retrieve(transactionId);
            
            return new TransactionDetails(
                    stripeIntent.getId(),
                    stripeIntent.getId(),
                    BigDecimal.valueOf(stripeIntent.getAmount()).divide(BigDecimal.valueOf(100)),
                    stripeIntent.getCurrency(),
                    mapStripeStatusToDto(stripeIntent.getStatus()),
                    LocalDateTime.ofInstant(java.time.Instant.ofEpochSecond(stripeIntent.getCreated()), ZoneId.systemDefault()),
                    LocalDateTime.now(),
                    stripeIntent.getMetadata().getOrDefault("reference_id", "unknown"),
                    stripeIntent.getCustomer(),
                    null,
                    null,
                    PaymentMethod.CREDIT_CARD,
                    "Card payment",
                    null,
                    null,
                    null,
                    null,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    null,
                    null,
                    stripeIntent.getMetadata().entrySet().stream().collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue)),
                    true,
                    BigDecimal.valueOf(stripeIntent.getAmount()).divide(BigDecimal.valueOf(100))
            );
            
        } catch (StripeException e) {
            throw new PaymentNotFoundException("Transaction not found: " + transactionId);
        }
    }

    /**
     * Obtém o status atual de uma transação no Stripe.
     *
     * @param transactionId O ID da transação.
     * @return O status mapeado para {@link PaymentStatus}.
     * @throws PaymentNotFoundException Se a transação não for encontrada.
     */
    @Override
    public PaymentStatus getPaymentStatus(String transactionId) {
        try {
            PaymentIntent stripeIntent = PaymentIntent.retrieve(transactionId);
            return mapStripeStatusToDto(stripeIntent.getStatus());
        } catch (StripeException e) {
            throw new PaymentNotFoundException("Transaction not found: " + transactionId);
        }
    }

    /**
     * Busca transações por referência interna.
     * <p>
     * Nota: Atualmente retorna uma lista vazia pois o Stripe não suporta busca direta eficiente por metadados
     * sem configuração adicional de índices ou uso da API de busca (Search API).
     * </p>
     *
     * @param referenceId O ID de referência interno.
     * @return Lista vazia (implementação futura pendente).
     */
    @Override
    public java.util.List<TransactionSummary> getTransactionsByReference(String referenceId) {
        return Collections.emptyList();
    }

    /**
     * Verifica se o método de pagamento é suportado por esta implementação do Stripe.
     *
     * @param paymentMethod O método de pagamento.
     * @return {@code true} para Cartão de Crédito, Débito e Transferência Bancária.
     */
    @Override
    public boolean supportsPaymentMethod(PaymentMethod paymentMethod) {
        return paymentMethod == PaymentMethod.CREDIT_CARD || 
               paymentMethod == PaymentMethod.DEBIT_CARD ||
               paymentMethod == PaymentMethod.BANK_TRANSFER;
    }

    /**
     * Retorna informações sobre esta implementação do provedor Stripe.
     *
     * @return Metadados do provedor, incluindo versão da API e capacidades.
     */
    @Override
    public ProviderInfo getProviderInfo() {
        return new ProviderInfo(
                "Stripe",
                "0.1.0",
                "Payment processing via Stripe API",
                java.util.List.of(PaymentMethod.CREDIT_CARD, PaymentMethod.DEBIT_CARD, PaymentMethod.BANK_TRANSFER),
                java.util.List.of("EUR", "USD", "GBP"),
                Map.of("3ds", true, "automatic_tax", true),
                true,
                true,
                true,
                null,
                "2026-02-26",
                "production"
        );
    }

    /**
     * Converte o mapa de metadados para o formato de string exigido pelo Stripe.
     *
     * @param metadata Mapa de objetos.
     * @return Mapa de strings.
     */
    private Map<String, String> convertMetadata(Map<String, Object> metadata) {
        if (metadata == null) return new HashMap<>();
        return metadata.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().toString()
                ));
    }
    
    /**
     * Mapeia o status do Stripe para o enum {@link PaymentStatus}.
     *
     * @param stripeStatus Status retornado pela API do Stripe.
     * @return Status correspondente no domínio da aplicação.
     */
    private PaymentStatus mapStripeStatusToDto(String stripeStatus) {
        if (stripeStatus == null) return PaymentStatus.UNKNOWN;
        return switch (stripeStatus) {
            case "requires_payment_method" -> PaymentStatus.PENDING;
            case "requires_confirmation" -> PaymentStatus.PENDING;
            case "requires_action" -> PaymentStatus.REQUIRES_ACTION;
            case "processing" -> PaymentStatus.PROCESSING;
            case "requires_capture" -> PaymentStatus.REQUIRES_CAPTURE;
            case "succeeded" -> PaymentStatus.SUCCEEDED;
            case "canceled" -> PaymentStatus.CANCELLED;
            default -> PaymentStatus.UNKNOWN;
        };
    }
    
    /**
     * Mapeia o status de reembolso do Stripe para o enum {@link RefundStatus}.
     *
     * @param stripeStatus Status de reembolso do Stripe.
     * @return Status correspondente no domínio da aplicação.
     */
    private RefundStatus mapStripeRefundStatusToDto(String stripeStatus) {
        if (stripeStatus == null) return RefundStatus.UNKNOWN;
        return switch (stripeStatus) {
            case "pending" -> RefundStatus.PENDING;
            case "succeeded" -> RefundStatus.SUCCEEDED;
            case "failed" -> RefundStatus.FAILED;
            case "canceled" -> RefundStatus.CANCELLED;
            default -> RefundStatus.UNKNOWN;
        };
    }
    
    /**
     * Mapeia o motivo do reembolso para o enum do Stripe.
     *
     * @param reason Motivo textual.
     * @return Enum {@link RefundCreateParams.Reason} correspondente.
     */
    private RefundCreateParams.Reason mapRefundReason(String reason) {
        if (reason == null || reason.isEmpty()) {
            return RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER;
        }
        
        String lowerReason = reason.toLowerCase();
        if (lowerReason.contains("fraud")) {
            return RefundCreateParams.Reason.FRAUDULENT;
        } else if (lowerReason.contains("duplicate")) {
            return RefundCreateParams.Reason.DUPLICATE;
        } else {
            return RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER;
        }
    }
}
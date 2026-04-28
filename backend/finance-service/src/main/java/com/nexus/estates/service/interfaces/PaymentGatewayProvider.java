package com.nexus.estates.service.interfaces;

import com.nexus.estates.dto.payment.*;
import com.nexus.estates.exception.InvalidRefundException;
import com.nexus.estates.exception.PaymentNotFoundException;
import com.nexus.estates.exception.PaymentProcessingException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Strategy para providers de pagamento (ex: Stripe).
 *
 * <p>Fornece operações de criação, confirmação, consulta e reembolso
 * com contrato unificado para o finance-service.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 */
public interface PaymentGatewayProvider {
    String providerKey();

    PaymentResponse createPaymentIntent(BigDecimal amount, String currency, String referenceId, Map<String, Object> metadata);

    PaymentResponse confirmPaymentIntent(String paymentIntentId, Map<String, Object> metadata);

    PaymentResponse processDirectPayment(BigDecimal amount, String currency, String referenceId, PaymentMethod paymentMethod, Map<String, Object> metadata);

    RefundResult processRefund(String transactionId, BigDecimal amount, String currency, Optional<String> reason, Map<String, Object> metadata);

    TransactionInfo getTransactionDetails(String transactionId);

    PaymentStatus getPaymentStatus(String transactionId);

    List<TransactionInfo> getTransactionsByReference(String referenceId);

    boolean supportsPaymentMethod(PaymentMethod paymentMethod);

    ProviderInfo getProviderInfo();
}

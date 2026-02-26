package com.nexus.estates.service;

import com.nexus.estates.exception.InvalidRefundException;
import com.nexus.estates.exception.PaymentNotFoundException;
import com.nexus.estates.exception.PaymentProcessingException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class PaymentExceptionsTest {

    @Test
    @DisplayName("Should create PaymentProcessingException with message")
    void shouldCreatePaymentProcessingExceptionWithMessage() {
        String message = "Erro ao processar pagamento";
        
        PaymentProcessingException exception = new PaymentProcessingException(message);
        
        assertThat(exception).isNotNull();
        assertThat(exception.getMessage()).isEqualTo(message);
        assertThat(exception.getCause()).isNull();
    }

    @Test
    @DisplayName("Should create PaymentProcessingException with message and cause")
    void shouldCreatePaymentProcessingExceptionWithMessageAndCause() {
        String message = "Erro ao processar pagamento";
        Exception cause = new RuntimeException("Erro interno");
        
        PaymentProcessingException exception = new PaymentProcessingException(message, cause);
        
        assertThat(exception).isNotNull();
        assertThat(exception.getMessage()).isEqualTo(message);
        assertThat(exception.getCause()).isEqualTo(cause);
    }

    @Test
    @DisplayName("Should create PaymentNotFoundException with message")
    void shouldCreatePaymentNotFoundExceptionWithMessage() {
        String paymentId = "pi_123456";
        String message = "Pagamento não encontrado: " + paymentId;
        
        PaymentNotFoundException exception = new PaymentNotFoundException(message);
        
        assertThat(exception).isNotNull();
        assertThat(exception.getMessage()).isEqualTo(message);
        assertThat(exception.getCause()).isNull();
    }

    @Test
    @DisplayName("Should create PaymentNotFoundException with message and cause")
    void shouldCreatePaymentNotFoundExceptionWithMessageAndCause() {
        String message = "Pagamento não encontrado";
        Exception cause = new RuntimeException("Erro de conexão");
        
        PaymentNotFoundException exception = new PaymentNotFoundException(message, cause);
        
        assertThat(exception).isNotNull();
        assertThat(exception.getMessage()).isEqualTo(message);
        assertThat(exception.getCause()).isEqualTo(cause);
    }

    @Test
    @DisplayName("Should create InvalidRefundException with message")
    void shouldCreateInvalidRefundExceptionWithMessage() {
        String message = "Reembolso inválido: valor maior que o pagamento";
        
        InvalidRefundException exception = new InvalidRefundException(message);
        
        assertThat(exception).isNotNull();
        assertThat(exception.getMessage()).isEqualTo(message);
        assertThat(exception.getCause()).isNull();
    }

    @Test
    @DisplayName("Should create InvalidRefundException with message and cause")
    void shouldCreateInvalidRefundExceptionWithMessageAndCause() {
        String message = "Reembolso inválido";
        Exception cause = new RuntimeException("Erro de validação");
        
        InvalidRefundException exception = new InvalidRefundException(message, cause);
        
        assertThat(exception).isNotNull();
        assertThat(exception.getMessage()).isEqualTo(message);
        assertThat(exception.getCause()).isEqualTo(cause);
    }

    @Test
    @DisplayName("Should create InvalidRefundException with amount and reason")
    void shouldCreateInvalidRefundExceptionWithAmountAndReason() {
        BigDecimal requestedAmount = new BigDecimal("500.00");
        BigDecimal availableAmount = new BigDecimal("300.00");
        String reason = "Valor do reembolso excede o valor disponível";
        String transactionId = "txn_123";
        
        InvalidRefundException exception = new InvalidRefundException(
            "Invalid refund amount",
            transactionId,
            requestedAmount, 
            availableAmount, 
            reason
        );
        
        assertThat(exception).isNotNull();
        assertThat(exception.getMessage()).isEqualTo("Invalid refund amount");
        assertThat(exception.getTransactionId()).isEqualTo(transactionId);
        assertThat(exception.getRequestedAmount()).isEqualTo(requestedAmount);
        assertThat(exception.getAvailableAmount()).isEqualTo(availableAmount);
        assertThat(exception.getRefundReason()).isEqualTo(reason);
        assertThat(exception.getCause()).isNull();
    }

    @Test
    @DisplayName("Should verify exception inheritance")
    void shouldVerifyExceptionInheritance() {
        PaymentProcessingException processingException = new PaymentProcessingException("Erro");
        PaymentNotFoundException notFoundException = new PaymentNotFoundException("Não encontrado");
        InvalidRefundException refundException = new InvalidRefundException("Reembolso inválido");
        
        assertThat(processingException).isInstanceOf(RuntimeException.class);
        assertThat(notFoundException).isInstanceOf(RuntimeException.class);
        assertThat(refundException).isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("Should verify exception stack trace")
    void shouldVerifyExceptionStackTrace() {
        PaymentProcessingException exception = new PaymentProcessingException("Erro de teste");
        
        StackTraceElement[] stackTrace = exception.getStackTrace();
        
        assertThat(stackTrace).isNotNull();
        assertThat(stackTrace.length).isGreaterThan(0);
        assertThat(stackTrace[0].getClassName()).contains("PaymentExceptionsTest");
    }
}
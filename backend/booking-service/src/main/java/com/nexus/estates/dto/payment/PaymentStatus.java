package com.nexus.estates.dto.payment;

/**
 * Enum que representa os possíveis status de um pagamento.
 * 
 * Os status cobrem todo o ciclo de vida de um pagamento,
 * desde a criação até a conclusão ou falha.
 */
public enum PaymentStatus {
    /**
     * Pagamento criado mas aguardando confirmação ou ação do utilizador.
     */
    PENDING,
    
    /**
     * Pagamento está sendo processado pelo provedor.
     */
    PROCESSING,
    
    /**
     * Pagamento foi bem sucedido e está completo.
     */
    SUCCEEDED,
    
    /**
     * Pagamento falhou por algum motivo.
     */
    FAILED,
    
    /**
     * Pagamento foi cancelado antes da conclusão.
     */
    CANCELLED,
    
    /**
     * Pagamento requer ação adicional do utilizador (ex: 3D Secure).
     */
    REQUIRES_ACTION,
    
    /**
     * Pagamento foi autorizado mas aguardando captura.
     */
    REQUIRES_CAPTURE,
    
    /**
     * Pagamento foi parcialmente reembolsado.
     */
    PARTIALLY_REFUNDED,
    
    /**
     * Pagamento foi totalmente reembolsado.
     */
    FULLY_REFUNDED,
    
    /**
     * Status desconhecido ou não mapeado.
     */
    UNKNOWN
}
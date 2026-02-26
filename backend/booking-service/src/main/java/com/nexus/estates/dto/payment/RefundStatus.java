package com.nexus.estates.dto.payment;

/**
 * Enum que representa os possíveis status de um reembolso.
 * 
 * Os status cobrem todo o ciclo de vida de um reembolso,
 * desde o pedido até a conclusão ou falha.
 */
public enum RefundStatus {
    /**
     * Reembolso foi solicitado mas ainda não processado.
     */
    PENDING,
    
    /**
     * Reembolso está sendo processado pelo provedor.
     */
    PROCESSING,
    
    /**
     * Reembolso foi bem sucedido e está completo.
     */
    SUCCEEDED,
    
    /**
     * Reembolso falhou por algum motivo.
     */
    FAILED,
    
    /**
     * Reembolso foi cancelado antes da conclusão.
     */
    CANCELLED,
    
    /**
     * Status desconhecido ou não mapeado.
     */
    UNKNOWN
}
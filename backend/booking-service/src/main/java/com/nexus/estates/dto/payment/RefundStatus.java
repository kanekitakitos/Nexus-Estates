package com.nexus.estates.dto.payment;

/**
 * Enum que representa os possíveis estados do ciclo de vida de um reembolso.
 * <p>
 * Utilizado para rastrear o progresso de estornos financeiros.
 * </p>
 * 
 * @author Nexus Estates Team
 * @version 1.0
 */
public enum RefundStatus {
    /**
     * O reembolso foi solicitado e está na fila para processamento.
     */
    PENDING,
    
    /**
     * O reembolso está sendo processado pelo provedor.
     */
    PROCESSING,
    
    /**
     * O reembolso foi concluído com sucesso e o valor devolvido.
     */
    SUCCEEDED,
    
    /**
     * O reembolso falhou devido a erro, recusa ou expiração.
     */
    FAILED,
    
    /**
     * O reembolso foi cancelado antes de ser concluído.
     */
    CANCELLED,
    
    /**
     * O estado do reembolso é desconhecido ou não mapeado.
     */
    UNKNOWN
}
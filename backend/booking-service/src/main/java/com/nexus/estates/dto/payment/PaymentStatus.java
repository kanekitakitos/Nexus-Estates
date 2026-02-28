package com.nexus.estates.dto.payment;

/**
 * Enum que representa os possíveis estados do ciclo de vida de um pagamento.
 * <p>
 * Utilizado para rastrear o progresso de transações financeiras desde a iniciação
 * até a conclusão, falha ou reembolso.
 * </p>
 * 
 * @author Nexus Estates Team
 * @version 1.0
 */
public enum PaymentStatus {
    /**
     * O pagamento foi criado mas aguarda ação do usuário ou confirmação inicial.
     */
    PENDING,
    
    /**
     * O pagamento está sendo processado pelo provedor (estado transitório).
     */
    PROCESSING,
    
    /**
     * O pagamento foi autorizado e capturado com sucesso.
     */
    SUCCEEDED,
    
    /**
     * O pagamento falhou devido a erro, recusa ou expiração.
     */
    FAILED,
    
    /**
     * O pagamento foi cancelado antes de ser concluído.
     */
    CANCELLED,
    
    /**
     * O pagamento requer uma ação adicional do usuário (ex: autenticação 3D Secure).
     */
    REQUIRES_ACTION,
    
    /**
     * O pagamento foi autorizado mas aguarda captura manual ou automática.
     */
    REQUIRES_CAPTURE,
    
    /**
     * O pagamento foi parcialmente reembolsado.
     */
    PARTIALLY_REFUNDED,
    
    /**
     * O pagamento foi totalmente reembolsado.
     */
    FULLY_REFUNDED,
    
    /**
     * O estado do pagamento é desconhecido ou não mapeado.
     */
    UNKNOWN
}
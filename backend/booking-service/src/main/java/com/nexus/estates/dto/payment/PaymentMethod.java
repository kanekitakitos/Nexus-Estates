package com.nexus.estates.dto.payment;

/**
 * Enum que representa os diferentes métodos de pagamento suportados.
 * 
 * Cada provedor pode suportar diferentes métodos, e este enum
 * fornece uma abstração comum para todos eles.
 */
public enum PaymentMethod {
    /**
     * Cartão de crédito.
     */
    CREDIT_CARD,
    
    /**
     * Cartão de débito.
     */
    DEBIT_CARD,
    
    /**
     * Transferência bancária (SEPA, ACH, etc.).
     */
    BANK_TRANSFER,
    
    /**
     * Boleto bancário (Brasil).
     */
    BOLETO,
    
    /**
     * Multibanco (Portugal).
     */
    MULTIBANCO,
    
    /**
     * PayPal.
     */
    PAYPAL,
    
    /**
     * Apple Pay.
     */
    APPLE_PAY,
    
    /**
     * Google Pay.
     */
    GOOGLE_PAY,
    
    /**
     * MB Way (Portugal).
     */
    MB_WAY,
    
    /**
     * Cartão de crédito/débito pré-pago.
     */
    PREPAID_CARD,
    
    /**
     * Criptomoeda.
     */
    CRYPTOCURRENCY,
    
    /**
     * Método desconhecido ou não mapeado.
     */
    UNKNOWN
}
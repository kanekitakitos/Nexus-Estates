package com.nexus.estates.dto.payment;

/**
 * Enum que representa os diferentes métodos de pagamento suportados pelo sistema.
 * <p>
 * Fornece uma abstração comum para normalizar os métodos de pagamento entre diferentes
 * provedores (Stripe, PayPal, etc.), facilitando a lógica de negócio e a persistência.
 * </p>
 * 
 * @author Nexus Estates Team
 * @version 1.0
 */
public enum PaymentMethod {
    /**
     * Cartão de crédito (Visa, Mastercard, Amex, etc.).
     */
    CREDIT_CARD,
    
    /**
     * Cartão de débito.
     */
    DEBIT_CARD,
    
    /**
     * Transferência bancária direta (SEPA, ACH, Wire).
     */
    BANK_TRANSFER,
    
    /**
     * Boleto bancário (método comum no Brasil).
     */
    BOLETO,
    
    /**
     * Multibanco (método comum em Portugal).
     */
    MULTIBANCO,
    
    /**
     * PayPal (carteira digital).
     */
    PAYPAL,
    
    /**
     * Apple Pay (carteira digital).
     */
    APPLE_PAY,
    
    /**
     * Google Pay (carteira digital).
     */
    GOOGLE_PAY,
    
    /**
     * MB Way (pagamento móvel em Portugal).
     */
    MB_WAY,
    
    /**
     * Cartão pré-pago.
     */
    PREPAID_CARD,
    
    /**
     * Criptomoedas (Bitcoin, Ethereum, etc.).
     */
    CRYPTOCURRENCY,
    
    /**
     * Método de pagamento não reconhecido ou não mapeado especificamente.
     */
    UNKNOWN
}
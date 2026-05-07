package com.nexus.estates.entity;

/**
 * Enum que descreve o tipo de contexto (thread) ao qual uma mensagem pertence.
 *
 * <p>Motivação:</p>
 * <ul>
 *   <li>Evita duplicação de tabelas (ex.: direct_messages vs booking_messages).</li>
 *   <li>Permite escalar o chat para múltiplos domínios com o mesmo contrato de persistência.</li>
 * </ul>
 */
public enum MessageContextType {
    BOOKING,
    PROPERTY_INQUIRY
}

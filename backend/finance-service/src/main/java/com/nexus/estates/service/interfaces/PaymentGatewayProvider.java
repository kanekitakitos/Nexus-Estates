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
 *<p>
 *     Fornce operações de criação, confirmação, consulta e reembolso
 *     com contrato unificado para o finance-service. Qualquqer nova integtraç~~ao
 *     de pagamento deve implementar estritamente este contrato
 *</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 */
public interface PaymentGatewayProvider {

    /**
     * Devolve a chave única que identifica este provedor no sistema
     * @return String contendo o identificador do provedor em letras maiúsculas
     */
    String providerKey();

    /**
     * Cria uma intenção de pagamentos assíncrona
     * Ideal apra fluxos onde o utilizador precisa de validar o pagamento no frontend
     * @param amount O valor monetário a cobrar
     * @param currency A moeda da transação
     * @param referenceId O ID da reservanoi entidade associada
     * @param metadata Dados extra a guardar na transação do provedor
     * @return {@link PaymentResponse} contendo o client secret e o ID da transação
     * @throws PaymentProcessingException Se houver erro de comunicação com o provedor
     */
    PaymentResponse createPaymentIntent(BigDecimal amount, String currency, String referenceId, Map<String, Object> metadata);

    /**
     * Confirma uma intenção de pagamento que foi previamente iniciada e autorizada pelo utilizador
     * @param paymentIntentId Ddaos adicionais a anexar na confirmação
     * @param metadata Dados adicionais a anexar na confirmação
     * @return {@link PaymentResponse} com o estado final
     * @throws PaymentProcessingException Se a confirmação for recusada
     * @throws PaymentNotFoundException Se o paymentIntentId não for encontrado no provedor
     */
    PaymentResponse confirmPaymentIntent(String paymentIntentId, Map<String, Object> metadata);

    /**
     * Processa um pagamento direto (síncrono), fazendo a cobrança imediata
     * @param amount Valor a cobrar
     * @param currency Moeda
     * @param referenceId Referência interna da reserva
     * @param paymentMethod O método de pagamento a utilizar
     * @param metadata Dados extra
     * @return {@link PaymentResponse} com o estado final da cobrança
     * @throws PaymentProcessingException Se o cartão for recusado ou falhar a rede
     */
    PaymentResponse processDirectPayment(BigDecimal amount, String currency, String referenceId, PaymentMethod paymentMethod, Map<String, Object> metadata);

    /**
     * Pede o reembolso total ou parcial de uam transação
     * @param transactionId O ID transação original
     * @param amount O valor a reembolsar. Se for null, reembolsa o total
     * @param currency A moeda do reembolso
     * @param reason O motivo do cancelamente (opcional)
     * @param metadata Dados extra de auditoria
     * @return {@link RefundResult} detalhando o sucesso ou falha
     * @throws InvalidRefundException Se as regras de reemboolso do provedor forem violadas
     */

    RefundResult processRefund(String transactionId, BigDecimal amount, String currency, Optional<String> reason, Map<String, Object> metadata);

    /**
     * Consulta todos os detalhes financeiros e de cliente de uma transação específica
     * @param transactionId ID da transação no provedor
     * @return Objeto {@link TransactionInfo} com o resumo completo
     * @throws PaymentNotFoundException Se a transação não existir
     */
    TransactionInfo getTransactionDetails(String transactionId);

    /**
     * Consulta rápida apenas para obter o estado atual da um pagamento
     * @param transactionId ID da transação no porvedor
     * @return O enum {@link PaymentStatus} correspondente
     * @throws PaymentNotFoundException Se a transação não existir
     */
    PaymentStatus getPaymentStatus(String transactionId);

    /**
     * Devolve a lista de transações (pagamentos, falhas, reembolsos) associadas a uma referência
     * @param referenceId Referência interna do Nexus Estates
     * @return Lista de {@link TransactionInfo} Devolve lista vazia se não houver dados
     */
    List<TransactionInfo> getTransactionsByReference(String referenceId);

    /**
     * Verifica se este provedor tem capacidade para processar um determinado método de pagamento
     * @param paymentMethod O tipo de pagamento (ex: MBWAY)
     * @return true se o provedor suportar o método, false caso contrário
     */
    boolean supportsPaymentMethod(PaymentMethod paymentMethod);

    /**
     * Exclui os metadados do provedor e as suas funcionalidades
     * @return {@link ProviderInfo} detalhando as capacidades ativas desta integração
     */
    ProviderInfo getProviderInfo();
}

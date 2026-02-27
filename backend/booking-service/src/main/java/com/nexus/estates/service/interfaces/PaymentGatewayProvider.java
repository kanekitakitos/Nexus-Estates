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
 * Interface genérica e flexível para desacoplar a lógica de negócio de reservas
 * dos provedores de pagamento específicos.
 * <p>
 * Esta interface define o contrato padrão que qualquer integração de pagamento (Stripe, PayPal, Adyen, etc.)
 * deve implementar para ser utilizada pelo sistema Nexus Estates. O objetivo é permitir a troca ou
 * adição de novos provedores sem alterar a lógica central do serviço de reservas.
 * </p>
 * <p>
 * Utiliza {@link PaymentResponse} (Sealed Interface) para garantir tratamento exaustivo e seguro
 * das respostas de pagamento, permitindo o uso de <i>Pattern Matching</i> no Java 17+.
 * </p>
 * 
 * <h2>Fluxos Suportados:</h2>
 * <ul>
 *   <li><b>Pagamento em Duas Etapas (Intent + Confirm):</b> Criação de intenção de pagamento seguida de confirmação (ex: 3D Secure).</li>
 *   <li><b>Pagamento Direto:</b> Processamento imediato em uma única chamada (ex: cartões salvos, carteiras digitais).</li>
 *   <li><b>Reembolsos:</b> Processamento de estornos totais ou parciais.</li>
 *   <li><b>Consultas:</b> Recuperação de detalhes e status de transações.</li>
 * </ul>
 * 
 * @author Nexus Estates Team
 * @version 1.0
 * @see PaymentResponse
 * @see TransactionInfo
 * @see RefundResult
 */
public interface PaymentGatewayProvider {

    /**
     * Cria uma intenção de pagamento que pode ser confirmada posteriormente.
     * <p>
     * Este método é o primeiro passo de um fluxo de pagamento assíncrono ou que requer ação do usuário.
     * Ele reserva a transação no provedor e retorna os dados necessários para o frontend finalizar o processo.
     * </p>
     * 
     * @param amount Valor monetário do pagamento.
     * @param currency Código ISO 4217 da moeda (ex: "EUR", "USD").
     * @param referenceId ID de referência interno do sistema (ex: ID da reserva) para conciliação.
     * @param metadata Dados adicionais flexíveis para serem armazenados no provedor (ex: ID do usuário, tipo de serviço).
     * @return {@link PaymentResponse} (geralmente do tipo {@link PaymentResponse.Intent}) contendo o ID da intenção e segredos.
     * @throws PaymentProcessingException se houver erro de comunicação ou validação no provedor.
     */
    PaymentResponse createPaymentIntent(BigDecimal amount, String currency, String referenceId, Map<String, Object> metadata);

    /**
     * Confirma uma intenção de pagamento previamente criada.
     * <p>
     * Deve ser chamado após o cliente completar a ação de pagamento no frontend ou quando o provedor
     * notificar que a transação está pronta para captura.
     * </p>
     * 
     * @param paymentIntentId ID da intenção de pagamento gerado no passo de criação.
     * @param metadata Dados adicionais para confirmação, se necessário.
     * @return {@link PaymentResponse} que pode ser:
     *         <ul>
     *           <li>{@link PaymentResponse.Success}: Se o pagamento foi concluído.</li>
     *           <li>{@link PaymentResponse.Failure}: Se o pagamento foi recusado.</li>
     *           <li>{@link PaymentResponse.RequiresAction}: Se for necessária mais interação (ex: 3D Secure).</li>
     *         </ul>
     * @throws PaymentProcessingException se a confirmação falhar devido a erro técnico.
     */
    PaymentResponse confirmPaymentIntent(String paymentIntentId, Map<String, Object> metadata);

    /**
     * Processa um pagamento direto em uma única etapa.
     * <p>
     * Útil para pagamentos imediatos onde não há interação do usuário (ex: cobrança em cartão salvo)
     * ou métodos que suportam captura síncrona.
     * </p>
     * 
     * @param amount Valor do pagamento.
     * @param currency Código ISO 4217 da moeda.
     * @param referenceId ID de referência interno.
     * @param paymentMethod Método de pagamento escolhido (ex: CREDIT_CARD).
     * @param metadata Dados adicionais.
     * @return {@link PaymentResponse} com o resultado da operação (Sucesso ou Falha).
     * @throws PaymentProcessingException se o pagamento for recusado ou houver erro.
     */
    PaymentResponse processDirectPayment(BigDecimal amount, String currency, String referenceId, PaymentMethod paymentMethod, Map<String, Object> metadata);

    /**
     * Processa o reembolso de uma transação existente.
     * <p>
     * Permite estornar valores totais ou parciais para o método de pagamento original.
     * Mantém o retorno de {@link RefundResult} pois é um fluxo distinto do pagamento.
     * </p>
     * 
     * @param transactionId ID da transação original no provedor (ex: payment_intent_id).
     * @param amount Valor a ser reembolsado.
     * @param currency Código ISO 4217 da moeda.
     * @param reason Motivo opcional do reembolso (ex: "requested_by_customer", "fraudulent").
     * @param metadata Dados adicionais para registro do reembolso.
     * @return Objeto {@link RefundResult} com os detalhes do reembolso processado.
     * @throws InvalidRefundException se o valor for inválido ou a transação não permitir reembolso.
     * @throws PaymentProcessingException se houver erro no processamento do estorno.
     */
    RefundResult processRefund(String transactionId, BigDecimal amount, String currency, Optional<String> reason, Map<String, Object> metadata);

    /**
     * Obtém os detalhes completos de uma transação específica.
     * <p>
     * Utilizado para consultar o histórico, taxas aplicadas, método utilizado e outros detalhes
     * diretamente da fonte (provedor).
     * </p>
     * 
     * @param transactionId ID da transação no provedor.
     * @return Objeto {@link TransactionInfo} com todas as informações da transação.
     * @throws PaymentNotFoundException se a transação não for encontrada no provedor.
     */
    TransactionInfo getTransactionDetails(String transactionId);

    /**
     * Verifica o status atual de uma transação.
     * <p>
     * Versão simplificada da consulta, retornando apenas o estado (ex: PENDING, SUCCEEDED, FAILED).
     * Útil para polling ou verificações rápidas.
     * </p>
     * 
     * @param transactionId ID da transação.
     * @return Enum {@link PaymentStatus} representando o estado atual.
     * @throws PaymentNotFoundException se a transação não for encontrada.
     */
    PaymentStatus getPaymentStatus(String transactionId);

    /**
     * Lista as transações associadas a uma referência interna.
     * <p>
     * Permite encontrar todas as tentativas de pagamento ou transações vinculadas a uma reserva específica
     * (bookingId), facilitando a auditoria e o suporte.
     * </p>
     * 
     * @param referenceId ID de referência interno (ex: bookingId).
     * @return Lista de {@link TransactionInfo} com os detalhes das transações encontradas.
     */
    List<TransactionInfo> getTransactionsByReference(String referenceId);

    /**
     * Valida se um método de pagamento é suportado pela implementação atual do provedor.
     * <p>
     * Útil para o frontend decidir quais opções exibir ao usuário.
     * </p>
     * 
     * @param paymentMethod Enum {@link PaymentMethod} a verificar.
     * @return true se o método for suportado, false caso contrário.
     */
    boolean supportsPaymentMethod(PaymentMethod paymentMethod);

    /**
     * Obtém metadados sobre a implementação do provedor.
     * <p>
     * Retorna informações como nome do provedor (ex: "Stripe"), versão da API utilizada
     * e capacidades suportadas (ex: se suporta reembolsos parciais).
     * </p>
     * 
     * @return Objeto {@link ProviderInfo} com os dados do provedor.
     */
    ProviderInfo getProviderInfo();
}
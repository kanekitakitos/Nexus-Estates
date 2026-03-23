package com.nexus.estates.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Representa a resposta unificada de uma operação de pagamento no sistema.
 * <p>
 * Esta interface utiliza o recurso de <b>Sealed Interfaces</b> (Java 17+) para definir uma hierarquia
 * fechada e exaustiva de possíveis resultados de pagamento. Isso permite que os consumidores da API
 * utilizem <i>Pattern Matching</i> para tratar cada cenário de forma segura e completa.
 * </p>
 * 
 * <h2>Cenários de Uso:</h2>
 * <ul>
 *   <li>{@link PaymentResponse.Intent}: Retornado ao iniciar um fluxo de pagamento assíncrono.</li>
 *   <li>{@link PaymentResponse.Success}: Retornado quando o pagamento é confirmado imediatamente.</li>
 *   <li>{@link PaymentResponse.Failure}: Retornado em caso de erro ou recusa do pagamento.</li>
 *   <li>{@link PaymentResponse.RequiresAction}: Retornado quando o provedor exige interação do usuário (ex: 3D Secure).</li>
 * </ul>
 * 
 * @author Nexus Estates Team
 * @version 1.0
 * @see com.nexus.estates.service.interfaces.PaymentGatewayProvider
 * @see com.nexus.estates.service.StripePaymentProvider
 * @see PaymentStatus
 * @see PaymentMethod
 */
public sealed interface PaymentResponse permits 
    PaymentResponse.Intent, 
    PaymentResponse.Success, 
    PaymentResponse.Failure, 
    PaymentResponse.RequiresAction {

    /**
     * Obtém o identificador único da transação no sistema.
     * @return ID da transação.
     */
    String transactionId();

    /**
     * Obtém o status atual do pagamento.
     * @return Enum {@link PaymentStatus} representando o estado.
     */
    PaymentStatus status();

    /**
     * Representa uma intenção de pagamento criada e aguardando processamento inicial.
     * <p>
     * Geralmente utilizada em fluxos onde o pagamento é iniciado no backend mas finalizado
     * no frontend (ex: Stripe Elements).
     * </p>
     * 
     * @param transactionId ID interno da transação.
     * @param clientSecret Segredo do cliente para autenticação no frontend (específico do provedor).
     * @param amount Valor a ser pago.
     * @param currency Moeda da transação.
     * @param status Status inicial (geralmente {@link PaymentStatus#PENDING}).
     * @param metadata Metadados adicionais.
     */
    record Intent(
        String transactionId,
        String clientSecret,
        BigDecimal amount,
        String currency,
        PaymentStatus status,
        Map<String, Object> metadata
    ) implements PaymentResponse {}

    /**
     * Representa um pagamento processado e confirmado com sucesso.
     * <p>
     * Contém todos os detalhes da transação finalizada, incluindo recibos e códigos de autorização.
     * </p>
     * 
     * @param transactionId ID interno da transação.
     * @param providerTransactionId ID da transação no provedor de pagamento.
     * @param amount Valor pago.
     * @param currency Moeda do pagamento.
     * @param status Status final (sempre {@link PaymentStatus#SUCCEEDED}).
     * @param confirmedAt Data e hora da confirmação.
     * @param receiptUrl URL para o recibo digital (se disponível).
     * @param authorizationCode Código de autorização da operadora do cartão.
     * @param fees Taxas de processamento aplicadas.
     * @param paymentMethod Detalhes do método de pagamento utilizado.
     * @param metadata Metadados adicionais.
     */
    record Success(
        String transactionId,
        String providerTransactionId,
        BigDecimal amount,
        String currency,
        PaymentStatus status,
        LocalDateTime confirmedAt,
        String receiptUrl,
        String authorizationCode,
        BigDecimal fees,
        PaymentMethodDetails paymentMethod,
        Map<String, Object> metadata
    ) implements PaymentResponse {}

    /**
     * Representa uma falha no processamento do pagamento.
     * <p>
     * Utilizado para comunicar recusas, erros de validação ou falhas de comunicação com o provedor.
     * </p>
     * 
     * @param transactionId ID interno da transação (se gerado).
     * @param status Status da falha (ex: {@link PaymentStatus#FAILED}, {@link PaymentStatus#CANCELLED}).
     * @param errorCode Código de erro retornado pelo provedor.
     * @param errorMessage Mensagem descritiva do erro.
     * @param failedAt Data e hora da falha.
     * @param metadata Metadados adicionais.
     */
    record Failure(
        String transactionId,
        PaymentStatus status,
        String errorCode,
        String errorMessage,
        LocalDateTime failedAt,
        Map<String, Object> metadata
    ) implements PaymentResponse {}

    /**
     * Indica que uma ação adicional é requerida para completar o pagamento.
     * <p>
     * Comum em fluxos que exigem autenticação forte (SCA/3D Secure) ou redirecionamento
     * para páginas de terceiros (ex: PayPal, Multibanco).
     * </p>
     * 
     * @param transactionId ID interno da transação.
     * @param status Status atual (ex: {@link PaymentStatus#REQUIRES_ACTION}).
     * @param clientSecret Segredo para continuar o fluxo no frontend.
     * @param actionType Tipo de ação requerida (ex: "redirect", "3ds").
     * @param redirectUrl URL para redirecionamento do usuário (se aplicável).
     * @param metadata Metadados adicionais.
     */
    record RequiresAction(
        String transactionId,
        PaymentStatus status,
        String clientSecret,
        String actionType,
        String redirectUrl,
        Map<String, Object> metadata
    ) implements PaymentResponse {}

    /**
     * Encapsula os detalhes do método de pagamento utilizado na transação.
     * 
     * @param type Tipo do método (ex: "credit_card", "debit_card").
     * @param lastFourDigits Últimos 4 dígitos do cartão (para exibição segura).
     * @param brand Bandeira do cartão ou nome do provedor (ex: "Visa", "MasterCard").
     */
    record PaymentMethodDetails(
        String type,
        String lastFourDigits,
        String brand
    ) {}
}

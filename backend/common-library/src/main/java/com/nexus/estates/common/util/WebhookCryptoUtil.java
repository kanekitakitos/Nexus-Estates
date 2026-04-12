package com.nexus.estates.common.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utilitário centralizado para todas as operações criptográficas relacionadas com Webhooks.
 * <p>
 * Inclui métodos para a geração de segredos seguros, assinatura de payloads e
 * validação de assinaturas em requisições HTTP (prevenindo ataques). O HmacSHA256
 * é utilizado de forma consistente para assegurar a autenticidade dos dados.
 * </p>
 * <p>
 * Partilhado de forma transparente entre os microserviços {@code finance-service} e
 * {@code sync-service} através do módulo {@code common-library}, promovendo reutilização.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 * @since 2023-10-15
 */
public final class WebhookCryptoUtil {

    /** Algoritmo criptográfico aprovado e padrão para assinatura de webhooks em todo o Nexus. */
    private static final String HMAC_ALGORITHM = "HmacSHA256";

    /** Gerador aleatório seguro de elevada entropia. */
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Construtor privado para impedir a instanciação desta classe utilitária.
     *
     * @throws UnsupportedOperationException se tentarem instanciar via reflexão.
     */
    private WebhookCryptoUtil() {
        throw new UnsupportedOperationException("Classe utilitária não instanciável");
    }

    /**
     * Gera um segredo criptográfico aleatório, seguro e forte com 32 bytes (256 bits).
     * O segredo gerado destina-se a ser partilhado uma única vez com o cliente aquando
     * da criação de uma nova subscrição de webhook, servindo posteriormente para que
     * esse cliente valide as assinaturas dos pedidos que o Nexus lhe envia.
     *
     * @return Uma representação codificada do segredo gerado, em formato Base64 URL-Safe
     *         sem padding, pronta a ser apresentada na interface do utilizador e
     *         usada nos cabeçalhos HTTP.
     */
    public static String generateSecret() {
        byte[] key = new byte[32];
        SECURE_RANDOM.nextBytes(key);
        // Utilização de Base64 URL-Safe sem padding resulta numa string visualmente limpa para UIs e seguras para URLs/Headers.
        return Base64.getUrlEncoder().withoutPadding().encodeToString(key);
    }

    /**
     * Calcula e devolve a assinatura criptográfica HMAC-SHA256 de um payload.
     *
     * @param payload O conteúdo que se deseja assinar (tipicamente o corpo bruto de um pedido em JSON).
     * @param secret O segredo secreto único, previamente partilhado entre as duas partes envolvidas.
     * @return Uma string contendo o prefixo do algoritmo e a hash gerada em Base64 (Ex.: {@code "sha256=abcdef..."}).
     * @throws IllegalArgumentException Caso o {@code payload} ou o {@code secret} sejam fornecidos como nulos.
     * @throws IllegalStateException Caso ocorra um erro severo durante a inicialização criptográfica
     *                               (algoritmo inexistente ou chave não suportada), o que não deve ocorrer
     *                               no ambiente da JVM atual.
     */
    public static String signPayload(String payload, String secret) {
        if (payload == null || secret == null) {
            throw new IllegalArgumentException("Payload e Secret não podem ser nulos para assinatura.");
        }

        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            mac.init(secretKey);

            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return "sha256=" + Base64.getEncoder().encodeToString(hash);

        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Erro crítico de configuração criptográfica no sistema", e);
        }
    }

    /**
     * Valida de forma robusta e segura se a assinatura recebida num webhook corresponde
     * à combinação do corpo da mensagem com o segredo esperado.
     * <p>
     * Utiliza internamente o {@link java.security.MessageDigest#isEqual(byte[], byte[])} para
     * comparar os bytes resultantes de forma a prevenir de ataques de tempo (timing attacks).
     * Útil para validar webhooks que chegam ao Nexus (por ex. de serviços externos).
     * </p>
     *
     * @param payload O conteúdo da mensagem em texto.
     * @param expectedSignature A assinatura declarada no pedido HTTP (geralmente enviada num cabeçalho personalizado).
     * @param secret O segredo conhecido pelo sistema, que se assume estar associado à fonte da mensagem.
     * @return {@code true} se as assinaturas coincidirem (comprovando a integridade e autenticidade do payload),
     *         ou {@code false} caso a assinatura enviada seja vazia, nula ou incorreta.
     */
    public static boolean isValidSignature(String payload, String expectedSignature, String secret) {
        if (expectedSignature == null || expectedSignature.isBlank()) return false;

        String generatedSignature = signPayload(payload, secret);

        // A utilização de MessageDigest.isEqual mitiga vulnerabilidades relativas a ataques baseados
        // no tempo de execução das comparações de strings (timing attacks).
        return java.security.MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                generatedSignature.getBytes(StandardCharsets.UTF_8)
        );
    }
}
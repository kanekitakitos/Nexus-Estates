package com.nexus.estates.common.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utilitário centralizado para operações criptográficas de Webhooks.
 * Partilhado entre todos os microserviços via common-library.
 */
public final class WebhookCryptoUtil {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private WebhookCryptoUtil() {
        throw new UnsupportedOperationException("Classe utilitária não instanciável");
    }

    /**
     * Gera um segredo criptográfico forte de 32 bytes (256 bits).
     * Ideal para ser gerado no momento da criação de uma nova subscrição de webhook.
     *
     * @return Segredo codificado em Base64 URL-Safe.
     */
    public static String generateSecret() {
        byte[] key = new byte[32];
        SECURE_RANDOM.nextBytes(key);
        // Base64 URL-Safe sem padding fica mais limpo para mostrar na UI e usar em URLs/Headers
        return Base64.getUrlEncoder().withoutPadding().encodeToString(key);
    }

    /**
     * Gera a assinatura HMAC-SHA256 de um payload.
     *
     * @param payload O corpo da mensagem JSON (e opcionalmente o timestamp concatenado).
     * @param secret O segredo único partilhado com o cliente.
     * @return A assinatura em formato "sha256=..."
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
     * Valida se uma assinatura recebida corresponde ao payload e segredo.
     * Útil para o finance-service ou sync-service validarem webhooks de entrada.
     */
    public static boolean isValidSignature(String payload, String expectedSignature, String secret) {
        if (expectedSignature == null || expectedSignature.isBlank()) return false;

        String generatedSignature = signPayload(payload, secret);
        // MessageDigest.isEqual previne ataques de timing (timing attacks)
        return java.security.MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                generatedSignature.getBytes(StandardCharsets.UTF_8)
        );
    }
}
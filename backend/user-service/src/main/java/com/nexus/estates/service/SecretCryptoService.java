package com.nexus.estates.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

@Service
/**
 * Serviço de criptografia para segredos sensíveis (API Keys) usando AES-256-GCM.
 * <p>
 * A chave mestre (MASTER_KEY) é injetada via configuração e validada rigorosamente.
 * Este serviço fornece encriptação e desencriptação com integridade autenticada.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 */
public class SecretCryptoService {

    private static SecretCryptoService INSTANCE;

    private final byte[] keyBytes;
    private final SecureRandom secureRandom = new SecureRandom();

    public SecretCryptoService(@Value("${master.key}") String masterKey) {
        if (masterKey == null || masterKey.isBlank()) {
            throw new IllegalStateException("master.key não configurada. Defina a variável de ambiente MASTER_KEY (ou a propriedade master.key) com a chave AES-256 em Base64.");
        }
        byte[] decoded = Base64.getDecoder().decode(masterKey);
        if (decoded.length != 32) {
            throw new IllegalStateException("master.key inválida. Deve ser uma chave AES-256 (32 bytes) em Base64.");
        }
        this.keyBytes = decoded;
        INSTANCE = this;
    }

    public static SecretCryptoService getInstance() {
        if (INSTANCE == null) {
            throw new IllegalStateException("SecretCryptoService não inicializado. Verifique configuração de master.key/MASTER_KEY.");
        }
        return INSTANCE;
    }

    /**
     * Encripta texto sensível usando AES-256 no modo GCM (autenticado).
     * <p>
     * O resultado é codificado em Base64 contendo IV (12 bytes) seguido dos bytes cifrados e tag.
     * </p>
     *
     * @param plainText valor em texto limpo
     * @return representação Base64 de IV+cifra+tag
     * @throws IllegalStateException em caso de erro criptográfico
     */
    public String encrypt(String plainText) {
        if (plainText == null) return null;
        try {
            byte[] iv = new byte[12];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), spec);
            byte[] cipherBytes = cipher.doFinal(plainText.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            byte[] combined = new byte[iv.length + cipherBytes.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(cipherBytes, 0, combined, iv.length, cipherBytes.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new IllegalStateException("Falha a encriptar valor sensível.", e);
        }
    }

    /**
     * Desencripta a representação Base64 produzida por {@link #encrypt(String)}.
     * <p>
     * Valida integridade via GCM; adulterações originam exceção.
     * </p>
     *
     * @param encoded Base64 contendo IV+cifra+tag
     * @return texto original
     * @throws IllegalStateException em caso de adulteração ou erro criptográfico
     */
    public String decrypt(String encoded) {
        if (encoded == null) return null;
        try {
            byte[] combined = Base64.getDecoder().decode(encoded);
            byte[] iv = new byte[12];
            byte[] cipherBytes = new byte[combined.length - iv.length];
            System.arraycopy(combined, 0, iv, 0, iv.length);
            System.arraycopy(combined, iv.length, cipherBytes, 0, cipherBytes.length);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(keyBytes, "AES"), spec);
            byte[] plainBytes = cipher.doFinal(cipherBytes);
            return new String(plainBytes, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("Falha a desencriptar valor sensível.", e);
        }
    }
}

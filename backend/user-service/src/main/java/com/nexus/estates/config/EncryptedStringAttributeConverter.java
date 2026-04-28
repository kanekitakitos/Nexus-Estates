package com.nexus.estates.config;

import com.nexus.estates.service.SecretCryptoService;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Base64;

/**
 * Converter JPA para encriptação transparente de campos String.
 * <p>
 * Aplica AES-256-GCM ao persistir e reverte ao carregar entidades.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 */
@Converter
public class EncryptedStringAttributeConverter implements AttributeConverter<String, String> {

    /**
     * Converte o valor de entidade para coluna encriptada (AES-256-GCM).
     *
     * @param attribute valor em texto limpo
     * @return Base64 IV+cifra+tag
     */
    @Override
    public String convertToDatabaseColumn(String attribute) {
        return SecretCryptoService.getInstance().encrypt(attribute);
    }

    /**
     * Converte o valor da coluna encriptada para o valor original da entidade.
     *
     * @param dbData Base64 IV+cifra+tag
     * @return texto limpo
     */
    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return dbData;
        try {
            byte[] decoded = Base64.getDecoder().decode(dbData);
            if (decoded.length <= 12) return dbData;
        } catch (IllegalArgumentException ignored) {
            return dbData;
        }

        try {
            return SecretCryptoService.getInstance().decrypt(dbData);
        } catch (IllegalStateException ignored) {
            return dbData;
        }
    }
}

package com.nexus.estates.config;

import com.nexus.estates.service.SecretCryptoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Testes de Unidade: EncryptedStringAttributeConverter")
class EncryptedStringAttributeConverterTest {

    @BeforeEach
    void init() {
        new SecretCryptoService("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
    }

    @Test
    @DisplayName("Deve converter para coluna encriptada e recuperar o valor original")
    void shouldConvertAndRecover() {
        EncryptedStringAttributeConverter converter = new EncryptedStringAttributeConverter();
        String plain = "api_key_value";
        String db = converter.convertToDatabaseColumn(plain);
        assertNotNull(db);
        assertNotEquals(plain, db);
        String entity = converter.convertToEntityAttribute(db);
        assertEquals(plain, entity);
    }
}

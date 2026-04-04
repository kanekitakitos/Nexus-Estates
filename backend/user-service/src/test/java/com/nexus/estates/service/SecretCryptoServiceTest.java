package com.nexus.estates.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Testes de Unidade: SecretCryptoService (AES-256-GCM)")
class SecretCryptoServiceTest {

    private final String BASE64_KEY_32B = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

    @Test
    @DisplayName("Deve encriptar e desencriptar mantendo integridade (round-trip)")
    void shouldEncryptAndDecryptRoundTrip() {
        SecretCryptoService service = new SecretCryptoService(BASE64_KEY_32B);
        String plain = "sk_live_1234567890";
        String enc = service.encrypt(plain);
        assertNotNull(enc);
        assertNotEquals(plain, enc);
        String dec = service.decrypt(enc);
        assertEquals(plain, dec);
    }

    @Test
    @DisplayName("Deve falhar desencriptação quando o conteúdo foi adulterado")
    void shouldFailDecryptOnTampering() {
        SecretCryptoService service = new SecretCryptoService(BASE64_KEY_32B);
        String plain = "secret";
        String enc = service.encrypt(plain);
        byte[] bytes = Base64.getDecoder().decode(enc);
        bytes[bytes.length - 1] ^= 0x01;
        String tampered = Base64.getEncoder().encodeToString(bytes);
        assertThrows(IllegalStateException.class, () -> service.decrypt(tampered));
    }
}

package com.nexus.estates.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes unitários para o {@link CloudinaryService}.
 *
 * <p>Esta classe valida a lógica de geração de parâmetros de upload seguro (signed uploads).
 * Garante que as assinaturas, os timestamps e as configurações de pasta para o Cloudinary
 * sejam gerados corretamente antes de serem enviados para o cliente (Frontend).</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-24
 */
class CloudinaryServiceTest {

    /** Instância do serviço a ser testado. */
    private ImageStorageService imageStorageService;

    /**
     * Configuração inicial executada antes de cada teste.
     * <p>Instancia o serviço com credenciais fictícias de teste para validar
     * a lógica interna sem efetuar chamadas reais à API externa.</p>
     */
    @BeforeEach
    void setUp() {
        // Usamos valores fictícios para validar apenas a lógica de geração de Map
        imageStorageService = new CloudinaryService("test_cloud", "test_key", "test_secret", "nexus_estates/properties");
    }

    /**
     * Valida se todos os parâmetros obrigatórios para o SDK do Cloudinary estão presentes.
     * <p>Este teste garante que o Frontend receberá todas as chaves necessárias (signature, timestamp, api_key)
     * para realizar o upload direto, reduzindo a carga no servidor backend.</p>
     */
    @Test
    @DisplayName("Deve gerar todos os parâmetros de upload obrigatórios")
    void shouldGenerateRequiredParameters() {
        // Act: Solicita a geração do mapa de parâmetros
        Map<String, Object> params = imageStorageService.getUploadParameters();

        // Assert: Valida a presença e consistência das chaves de segurança
        assertNotNull(params, "O mapa de parâmetros não deve ser nulo");
        assertTrue(params.containsKey("signature"), "A assinatura digital deve estar presente para uploads seguros");
        assertTrue(params.containsKey("timestamp"), "O timestamp é obrigatório para evitar ataques de replay");
        assertTrue(params.containsKey("api_key"), "A API Key deve ser enviada para identificação da conta");

        // Valida as configurações de destino
        assertEquals("test_cloud", params.get("cloud_name"), "O cloud_name deve corresponder ao configurado");
        assertEquals("nexus_estates/properties", params.get("folder"), "A pasta de destino deve ser nexus_estates/properties");
    }

    /**
     * Valida a lógica de expiração da assinatura de upload.
     * <p>Garante que a política de segurança de 15 minutos (900 segundos) está a ser aplicada
     * corretamente, limitando a janela de tempo em que uma assinatura pode ser utilizada.</p>
     */
    @Test
    @DisplayName("Deve definir o tempo de expiração para exatamente 15 minutos")
    void shouldSetCorrectExpiration() {
        // Act
        Map<String, Object> params = imageStorageService.getUploadParameters();

        long timestamp = (long) params.get("timestamp");
        long expiresAt = (long) params.get("expires_at");

        // Assert
        // A diferença deve ser exatamente 900 segundos (15 min * 60 seg)
        assertEquals(900, expiresAt - timestamp, "A janela de expiração deve ser de exatamente 900 segundos");
    }
}
package com.nexus.estates.service;

import com.nexus.estates.entity.User;
import com.nexus.estates.entity.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Suite de testes unitários para o {@link JwtService}.
 * <p>
 * Valida a integridade da geração, extração e expiração de tokens JWT.
 * Utiliza {@link ReflectionTestUtils} para injetar propriedades de configuração
 * que normalmente viriam do ficheiro {@code application.properties}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@DisplayName("Testes de Unidade: JWT Service")
class JwtServiceTest {

    private JwtService jwtService;

    /**
     * Chave secreta de teste em Base64 (256 bits).
     * Em ambiente real, esta chave deve ser mantida fora do código fonte.
     */
    private final String SECRET = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Injeta manualmente as dependências de @Value do Spring
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET);
        // Configura uma expiração padrão de 30 minutos para os testes
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 1000L * 60 * 30);
    }

    /**
     * Valida se as informações do utilizador (ID, Email, Role) são corretamente
     * codificadas nas Claims do token.
     * <p>
     * <b>Expectativa:</b> O token deve ser gerado e permitir a extração fiel
     * dos dados originais.
     * </p>
     */
    @Test
    @DisplayName("Deve gerar token contendo as Claims personalizadas (ID e Role)")
    void shouldGenerateTokenWithClaims() {
        var user = User.builder()
                .id(123L)
                .email("user@example.com")
                .password("x")
                .role(UserRole.GUEST)
                .build();

        String token = jwtService.generateToken(user);

        // Validação do Subject (identificador principal)
        String subject = jwtService.extractUsername(token);
        assertEquals("user@example.com", subject);

        // Validação das Claims de autorização e identificação
        Object role = jwtService.extractClaim(token, claims -> claims.get("role"));
        Object userId = jwtService.extractClaim(token, claims -> claims.get("userId"));

        assertEquals(UserRole.GUEST.toString(), String.valueOf(role));
        assertEquals(user.getId().toString(), String.valueOf(userId));
    }

    /**
     * Valida o mecanismo de verificação de integridade do token.
     */
    @Test
    @DisplayName("Deve validar o token positivamente para o email correto")
    void shouldValidateTokenForCorrectEmail() {
        var user = User.builder()
                .id(1L)
                .email("valid@example.com")
                .password("x")
                .role(UserRole.GUEST)
                .build();
        String token = jwtService.generateToken(user);
        assertTrue(jwtService.isTokenValid(token, "valid@example.com"));
    }

    /**
     * Testa a proteção contra tokens apresentados por utilizadores errados.
     */
    @Test
    @DisplayName("Deve invalidar o token se o email extraído for diferente do fornecido")
    void shouldFailValidationForWrongEmail() {
        var user = User.builder()
                .id(2L)
                .email("valid@example.com")
                .password("x")
                .role(UserRole.GUEST)
                .build();
        String token = jwtService.generateToken(user);
        assertFalse(jwtService.isTokenValid(token, "other@example.com"));
    }

    /**
     * Valida o comportamento de segurança perante tokens que ultrapassaram o TTL.
     * <p>
     * <b>Cenário:</b> Expiração configurada com valor negativo para forçar falha imediata.
     * </p>
     */
    @Test
    @DisplayName("Deve invalidar tokens cuja data de expiração já passou")
    void shouldFailValidationForExpiredToken() {
        var user = User.builder()
                .id(3L)
                .email("exp@example.com")
                .password("x")
                .role(UserRole.GUEST)
                .build();

        // Simula um token já nascido morto (expirado)
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L);

        String token = jwtService.generateToken(user);
        assertFalse(jwtService.isTokenValid(token, "exp@example.com"));
    }
}
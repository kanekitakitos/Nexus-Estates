package com.nexus.estates.service;

import com.nexus.estates.entity.User;
import com.nexus.estates.entity.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    // Chave secreta de exemplo (Base64)
    private final String SECRET = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8=";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET);
        // Expiração de 30 minutos
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 1000 * 60 * 30);
    }

    @Test
    void shouldGenerateTokenWithClaims() {
        var user = User.builder()
                .id(123L) // ID Long
                .email("user@example.com")
                .password("x")
                .role(UserRole.GUEST)
                .build();

        String token = jwtService.generateToken(user);
        
        // Verifica Subject
        String subject = jwtService.extractUsername(token);
        assertEquals("user@example.com", subject);
        
        // Verifica Claims personalizadas
        Object role = jwtService.extractClaim(token, claims -> claims.get("role"));
        Object userId = jwtService.extractClaim(token, claims -> claims.get("userId"));
        
        assertEquals(UserRole.GUEST.toString(), String.valueOf(role));
        assertEquals(user.getId().toString(), String.valueOf(userId));
    }

    @Test
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

    @Test
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

    @Test
    void shouldFailValidationForExpiredToken() {
        var user = User.builder()
                .id(3L)
                .email("exp@example.com")
                .password("x")
                .role(UserRole.GUEST)
                .build();
        
        // Define expiração negativa para simular token expirado
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L);

        String token = jwtService.generateToken(user);
        assertFalse(jwtService.isTokenValid(token, "exp@example.com"));
    }
}

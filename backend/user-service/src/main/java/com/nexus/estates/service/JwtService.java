package com.nexus.estates.service;

import com.nexus.estates.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Serviço utilitário para gestão de JSON Web Tokens (JWT).
 * <p>
 *     Responsável pela criação, assinatura, extração de dados (claims) e validação de tokens.
 *     Utiliza a biblioteca {@code io.jsonwebtoken}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 */
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * Extrai o nome de utilizador (subject) do token.
     *
     * @param token Token JWT.
     * @return O email/username contido no token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrai uma claim específica do token utilizando um resolver.
     *
     * @param token Token JWT.
     * @param claimsResolver Função para extrair o tipo desejado das Claims.
     * @param <T> Tipo do dado a extrair.
     * @return O valor da claim extraída.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Valida se o token pertence ao utilizador fornecido e se não expirou.
     *
     * @param token Token JWT.
     * @param email Email do utilizador para comparação.
     * @return {@code true} se o token for válido, {@code false} caso contrário.
     */
    public boolean isTokenValid(String token, String email) {
        try {
            final String username = extractUsername(token);
            return (username.equals(email)) && !isTokenExpired(token);
        } catch (Exception ex) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    /**
     * Gera um novo token JWT para um utilizador.
     * <p>
     *     Inclui claims personalizadas como 'role' e 'userId'.
     * </p>
     *
     * @param user Entidade do utilizador.
     * @return String contendo o token JWT assinado.
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole());
        claims.put("userId", user.getId());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

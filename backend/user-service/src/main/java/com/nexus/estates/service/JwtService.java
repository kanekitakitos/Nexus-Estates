package com.nexus.estates.service;

import com.nexus.estates.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
 * Responsável pela criação, assinatura, extração de dados (claims) e validação de tokens.
 * Inclui logging detalhado para falhas de validação.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 */
@Service
public class JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtService.class);

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

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
     * Valida um token JWT, verificando a sua assinatura, expiração e correspondência de utilizador.
     * <p>
     * Em caso de falha, regista um log com o nível e a causa apropriados (WARN para expiração,
     * ERROR para problemas de formato ou assinatura) antes de retornar {@code false}.
     * </p>
     *
     * @param token O token JWT a ser validado.
     * @param email O email do utilizador que se espera que o token represente.
     * @return {@code true} se o token for válido e corresponder ao utilizador, {@code false} caso contrário.
     */
    public boolean isTokenValid(String token, String email) {
        try {
            final String username = extractUsername(token);
            if (!username.equals(email)) {
                logger.warn("Validação de token falhou: O email do token ({}) não corresponde ao email esperado ({}).", username, email);
                return false;
            }
            // A chamada a extractAllClaims já valida a assinatura e o formato.
            // A verificação de expiração é feita implicitamente, mas uma falha lança ExpiredJwtException.
            return !isTokenExpired(token);
        } catch (SignatureException e) {
            logger.error("Validação de token falhou: Assinatura JWT inválida.", e);
        } catch (MalformedJwtException e) {
            logger.error("Validação de token falhou: Token JWT malformado.", e);
        } catch (ExpiredJwtException e) {
            logger.warn("Validação de token falhou: O token para o utilizador '{}' expirou em {}.", e.getClaims().getSubject(), e.getClaims().getExpiration());
        } catch (UnsupportedJwtException e) {
            logger.error("Validação de token falhou: Token JWT não suportado.", e);
        } catch (IllegalArgumentException e) {
            logger.error("Validação de token falhou: A string de claims do JWT está vazia ou nula.", e);
        }
        return false;
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    /**
     * Gera um novo token JWT para um utilizador.
     *
     * @param user A entidade do utilizador para quem o token será gerado.
     * @return Uma string contendo o token JWT assinado.
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

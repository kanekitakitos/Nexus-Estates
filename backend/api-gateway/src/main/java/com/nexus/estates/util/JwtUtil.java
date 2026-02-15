package com.nexus.estates.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;

/**
 * Utilitário para operações relacionadas com JSON Web Tokens (JWT).
 * <p>
 * Responsável pela validação, parsing e extração de metadados dos tokens de autenticação
 * recebidos no gateway. Utiliza a biblioteca <code>jjwt</code> para operações criptográficas.
 * </p>
 *
 * @author Nexus Estates Team
 */
@Component
public class JwtUtil {

    /** Chave secreta usada para assinar e validar os tokens (configurada via application.properties). */
    @Value("${jwt.secret}")
    private String secret;

    /**
     * Valida a integridade e a assinatura de um token JWT.
     * <p>
     * Tenta fazer o parse do token utilizando a chave secreta configurada.
     * Se o token for inválido, expirado ou adulterado, será lançada uma exceção.
     * </p>
     *
     * @param token A string do token JWT (sem prefixo "Bearer ").
     * @throws io.jsonwebtoken.JwtException Se o token for inválido.
     */
    public void validateToken(final String token) {
        Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token);
    }

    /**
     * Extrai todas as "Claims" (reivindicações) contidas no corpo do token.
     * <p>
     * Útil para obter informações como user_id, roles, expiração, etc.
     * </p>
     *
     * @param token O token JWT a ser analisado.
     * @return Objeto {@link Claims} contendo os dados do payload.
     */
    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token).getBody();
    }

    /**
     * Gera a chave criptográfica HMAC-SHA a partir da string secreta configurada.
     *
     * @return A chave {@link Key} pronta para uso nas operações de assinatura/verificação.
     */
    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
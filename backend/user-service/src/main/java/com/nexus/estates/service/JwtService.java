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

    /**
     * Chave secreta usada para assinar e validar tokens JWT.
     * Obtida da configuração da aplicação ({@code jwt.secret}) e
     * decodificada em {@link #getSignInKey()}.
     */
    @Value("${jwt.secret}")
    private String secretKey;

    /**
     * Duração de validade dos tokens JWT em milissegundos.
     * Definida pela propriedade {@code jwt.expiration}.
     */
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    /**
     * Extrai o identificador principal (subject) de um token JWT.
     * <p>
     * No contexto da aplicação, o subject corresponde ao email do utilizador.
     * </p>
     *
     * @param token o token JWT de origem
     * @return o subject contido no token (normalmente o email do utilizador)
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrai um claim arbitrário de um token JWT, aplicando uma função de resolução.
     *
     * @param token          o token JWT de origem
     * @param claimsResolver função que recebe o {@link Claims} e devolve o valor desejado
     * @param <T>            tipo do valor retornado
     * @return o valor do claim resolvido pela função fornecida
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Faz o parsing completo do token JWT e devolve o conjunto de claims.
     * <p>
     * Esta operação valida a assinatura do token utilizando a chave
     * configurada em {@link #getSignInKey()}.
     * </p>
     *
     * @param token o token JWT a ser analisado
     * @return o objeto {@link Claims} extraído do token
     * @throws io.jsonwebtoken.JwtException se o token for inválido ou não puder ser analisado
     */
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
            return true;
        } catch (ExpiredJwtException e) {
            logger.warn("Validação de token falhou: O token para o utilizador '{}' expirou em {}.", e.getClaims().getSubject(), e.getClaims().getExpiration());
        } catch (JwtException | IllegalArgumentException e) {
            logger.error("Validação de token falhou: Token inválido ou erro de processamento.", e);
        }
        return false;
    }

    /**
     * Verifica se um token JWT já expirou.
     *
     * @param token o token JWT a ser verificado
     * @return {@code true} se a data de expiração for anterior à data atual, {@code false} caso contrário
     */
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

    /**
     * Decodifica a chave secreta configurada e gera a chave criptográfica para assinatura.
     *
     * @return a chave {@link Key} usada para assinar e verificar os tokens (HMAC-SHA)
     */
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}

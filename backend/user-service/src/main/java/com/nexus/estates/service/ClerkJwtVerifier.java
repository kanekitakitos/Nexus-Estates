package com.nexus.estates.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.estates.entity.User;
import com.nexus.estates.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.SecurityException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementação da estratégia de identidade (SSO) para o provedor Clerk
 * <p>
 *     Esta classe é responsável por validar e extrair dados de tokens JWT emitidos pelo Clerk
 *     Para garantir a máxima segurança, efetua o download assíncrono das chaves públicas (JWKS)
 *     diretamente do endpoit oficial da API do Clerk, utilizando um mecanismo de cache interno
 *     para otimizar a performance em requisições consecutivas
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Service
public class ClerkJwtVerifier implements ExternalIdentityProviderStrategy {

    @Value("${clerk.jwks.url:}")
    private String jwksUrl;

    @Value("${clerk.issuer:}")
    private String issuer;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final Map<String, CachedKey> keyCache = new ConcurrentHashMap<>();

    /**
     * Construtor da estrtégia de validação do Clerk
     * @param objectMapper O manipulador (injetado) responsável por fazer o parsing seguro dos payloads JSON e das chaves JWKS
     */
    public ClerkJwtVerifier(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    }


    /**
     * Identificador único da estratégia de atenticação
     * @return A constante "clerk"
     */
    @Override
    public String key() {
        return "clerk";
    }


    /**
     * Valida criptograficamente um token do Clerk e extrai a identidade do utilizador
     * <p>
     *     O processo inclui a resolução da chave pública baseada no ID da chave (kid)
     *     presente no cabeçalho do token e a validação do emissor (iss)
     * </p>
     * @param token O token JWT enviado pelo cliente
     * @return Um objeto {@link com.nexus.estates.service.ExternalIdentityProviderStrategy.ExternalIdentity}
     * @throws SecurityException Se o token estiver malformado, expirado ou com assinatura inválida
     */
    @Override
    public ExternalIdentity verify(String token) {
        if (jwksUrl == null || jwksUrl.isBlank()) {
            throw new IllegalStateException("clerk.jwks.url is not configured");
        }

        String kid = extractKid(token);
        PublicKey publicKey = resolvePublicKey(kid);

        var parser = Jwts.parserBuilder().setSigningKey(publicKey);
        if (issuer != null && !issuer.isBlank()) {
            parser.requireIssuer(issuer);
        }

        Claims claims;
        try {
            claims = parser.build().parseClaimsJws(token).getBody();
        } catch (SecurityException e) {
            throw new IllegalArgumentException("Invalid Clerk token signature", e);
        }

        String subject = claims.getSubject();
        String email = readStringClaim(claims, "email");
        if (email == null || email.isBlank()) {
            email = readStringClaim(claims, "email_address");
        }
        String name = readStringClaim(claims, "name");

        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("Clerk token missing subject");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Clerk token missing email claim (configure a JWT template with email)");
        }

        return new ExternalIdentity(subject, email, name);
    }


    /**
     * Localiza um utilizador interno que possua o ID externo do Clerk já mapeado
     * @param userRepository Repositório de acesso á base de dados
     * @param identity Identidade extraída por token
     * @return Option com o utilizador caso exista
     */
    @Override
    public Optional<User> findExistingUser(
            UserRepository userRepository,
            ExternalIdentity identity
    ) {
        return userRepository.findByClerkUserId(identity.providerUserId())
                .or(() -> userRepository.findByEmail(identity.email()));
    }


    /**
     * Vincula o ID do Clerk á entidade de utilizador da plataforma Nexus Estates
     * @param user Utilziador a atualizar
     * @param identity Os dados da identidade fornecida pelo sistema externo
     */
    @Override
    public void applyIdentity(User user, ExternalIdentity identity) {
        if (user.getClerkUserId() == null || user.getClerkUserId().isBlank()) {
            user.setClerkUserId(identity.providerUserId());
        }
    }


    /**
     * Extrai de forma segura o valor de uma <i>Claim</i> (atributo) do payload do token
     * <p>
     *     Encapsula a lógica de leitura para evitar exceções indesejadas (como {@code NullPointerException}
     *     ou {@code ClassCastException}) caso o provedor de identidade omita um campo não obrigatório
     * </p>
     * @param claims O conjunto de claims validadas e extraídas do token
     * @param key A chave exata do atributo a procurar (ex: "email", "name")
     * @return O valor do atributo em formato de texto, ou {@code null} caso não esteja presente no payload
     */
    private static String readStringClaim(Claims claims, String key) {
        Object v = claims.get(key);
        return v instanceof String ? (String) v : null;
    }


    /**
     * Extrai o identificador da chave (Key ID - 'kid') a partir do cabeçalho do token JWT
     * @param token O token JWT codificado em Base64 recebido do cliente
     * @return O identificador da chave (kid) em formato de texto
     * @throws io.jsonwebtoken.JwtException Se o token estiver corrompido estruturalmente
     */
    private String extractKid(String token) {
        try {
            String headerJson = new String(Base64.getUrlDecoder().decode(token.split("\\.")[0]));
            JsonNode header = objectMapper.readTree(headerJson);
            JsonNode kidNode = header.get("kid");
            if (kidNode == null || kidNode.asText().isBlank()) {
                throw new IllegalArgumentException("Clerk token missing kid header");
            }
            return kidNode.asText();
        } catch (Exception e) {
            throw new IllegalArgumentException("Unable to decode Clerk token header", e);
        }
    }


    /**
     * Resolve e recupera a chave pública RSA associada a um Key ID (kid) específico do Clerk
     * <p>
     *     Implementa um mecanismo de cache em memória, se a chave já existir e for válida, retorna-a imediatamente
     *     Caso contrário, efetua um pedido HTTP ao endpoint JWKS do Clerk, processa a chave e guarda-a em cache por 6 horas
     * </p>
     * @param kid O identificador único da chave (Key ID) extraído do cabeçalho do JWT
     * @return O objeto {@link PublicKey} correspondente para verificação da assinatura
     * @throws IllegalStateException Se não for possível comunicar com a API do Clerk ou se a chave não for encontrada
     */
    private PublicKey resolvePublicKey(String kid) {
        CachedKey cached = keyCache.get(kid);
        if (cached != null && !cached.isExpired()) {
            return cached.key();
        }

        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(jwksUrl))
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();
            HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() < 200 || res.statusCode() >= 300) {
                throw new IllegalStateException("Failed to fetch Clerk JWKS: HTTP " + res.statusCode());
            }
            JsonNode json = objectMapper.readTree(res.body());
            JsonNode keys = json.get("keys");
            if (keys == null || !keys.isArray()) {
                throw new IllegalStateException("Invalid JWKS payload");
            }
            for (JsonNode k : keys) {
                if (kid.equals(k.path("kid").asText())) {
                    PublicKey key = jwkToRsaPublicKey(k);
                    keyCache.put(kid, new CachedKey(key, Instant.now().plus(Duration.ofHours(6))));
                    return key;
                }
            }
            throw new IllegalStateException("No matching Clerk JWKS key for kid=" + kid);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to resolve Clerk public key", e);
        }
    }

    /**
     * Converte uma chave pública do formato JWK para um objeto {@link PublicKey} RSA nativo de Java
     * <p>
     *     Extrai o módulo matemático ({@code n}) e o expoente ({@code e}) codificados em Base64-URL
     *     a partir da resposta JSON do Clerk e utiliza a {@link KeyFactory} para reconstruir a chave
     * </p>
     * @param jwk O nó JSON contendo os parâmetros originais da chave pública
     * @return A chave pública isntanciada e pronta a ser usada para validar a assinatura do JWT
     * @throws IllegalStateException Caso o tipo de chave (kty) não seja suportado
     */
    private PublicKey jwkToRsaPublicKey(JsonNode jwk) throws Exception {
        String kty = jwk.path("kty").asText();
        if (!"RSA".equalsIgnoreCase(kty)) {
            throw new IllegalStateException("Unsupported JWK kty=" + kty);
        }
        String n = jwk.path("n").asText();
        String e = jwk.path("e").asText();
        if (n.isBlank() || e.isBlank()) {
            throw new IllegalStateException("Invalid RSA JWK");
        }
        BigInteger modulus = new BigInteger(1, Base64.getUrlDecoder().decode(n));
        BigInteger exponent = new BigInteger(1, Base64.getUrlDecoder().decode(e));
        RSAPublicKeySpec spec = new RSAPublicKeySpec(modulus, exponent);
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    }

    /**
     * Registo auxilair interno para gerir o ciclo de vida de uma chave pública no cache em memória
     * @param key A chave pública instanciada
     * @param expiresAt O momento exato (Instant) em que o cache desta chave deixa de ser válido
     */
    private record CachedKey(PublicKey key, Instant expiresAt) {
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }
}

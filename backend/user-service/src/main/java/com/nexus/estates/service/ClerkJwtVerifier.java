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

@Service
public class ClerkJwtVerifier implements ExternalIdentityProviderStrategy {

    @Value("${clerk.jwks.url:}")
    private String jwksUrl;

    @Value("${clerk.issuer:}")
    private String issuer;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final Map<String, CachedKey> keyCache = new ConcurrentHashMap<>();

    public ClerkJwtVerifier(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    }

    @Override
    public String key() {
        return "clerk";
    }

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

    @Override
    public Optional<User> findExistingUser(
            UserRepository userRepository,
            ExternalIdentity identity
    ) {
        return userRepository.findByClerkUserId(identity.providerUserId())
                .or(() -> userRepository.findByEmail(identity.email()));
    }

    @Override
    public void applyIdentity(User user, ExternalIdentity identity) {
        if (user.getClerkUserId() == null || user.getClerkUserId().isBlank()) {
            user.setClerkUserId(identity.providerUserId());
        }
    }

    private static String readStringClaim(Claims claims, String key) {
        Object v = claims.get(key);
        return v instanceof String ? (String) v : null;
    }

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

    private record CachedKey(PublicKey key, Instant expiresAt) {
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }
}

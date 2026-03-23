package com.nexus.estates.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração do SDK Stripe.
 *
 * <p>Inicializa a {@code Stripe.apiKey} com a chave secreta configurada
 * via propriedades, garantindo que os providers Stripe funcionem corretamente.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 */
@Configuration
public class StripeConfig {
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }
}

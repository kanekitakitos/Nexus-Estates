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

    /**
     * Cahve secreta de autentucação da API do Stripe (Secret Key)
     * <p>
     *     ~Injetada a partir do ficheiro de propriedades ou variáveis de ambiente
     * </p>
     */
    @Value("${stripe.secret.key}")
    private String stripeSecretKey;


    /**
     * Inicializa o SDK do Stripe imediatamente após a injeção de dependências do Spring
     * <p>
     *     Associa a chave secreta global à biblioteca estática do Stripe, dispensando a necessidade
     *     de passar a chave explicitamente em cada requisição à API
     * </p>
     */
    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }
}

package com.nexus.estates;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Aplicação Spring Boot para o módulo Finance Service.
 *
 * <p>Responsável por:
 * - Processamento de pagamentos (Stripe) via Strategy Pattern.
 * - Receção segura de webhooks e idempotência.
 * - Emissão de documentos de faturação (Strategy: Moloni/Vendus/Mock).
 * - Exposição de endpoints REST documentados via OpenAPI/Swagger.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 */
@SpringBootApplication
public class FinanceServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(FinanceServiceApplication.class, args);
    }
}

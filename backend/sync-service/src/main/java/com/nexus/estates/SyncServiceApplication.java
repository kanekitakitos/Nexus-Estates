package com.nexus.estates;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de entrada da aplicação Sync Service.
 * <p>
 * Responsável por iniciar o contexto Spring Boot e carregar os componentes de
 * integração assíncrona com o RabbitMQ, consumindo eventos de reservas
 * criadas e publicando atualizações de estado de forma desacoplada.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@OpenAPIDefinition(
        info = @Info(
                title = "Nexus Estates - Sync Service API",
                version = "v1",
                description = "API administrativa e de suporte responsável pelo processamento assíncrono de reservas "
                        + "e integração com sistemas externos, incluindo infraestrutura de Dead Letter Queues."
        )
)
@SpringBootApplication
public class SyncServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(SyncServiceApplication.class, args);
    }
}

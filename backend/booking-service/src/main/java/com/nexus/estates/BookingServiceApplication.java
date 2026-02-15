package com.nexus.estates;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Ponto de entrada da aplicação Booking Service.
 * <p>
 * Inicializa o contexto do Spring Boot, configura os componentes automáticos
 * e expõe a documentação OpenAPI através do springdoc-openapi.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@OpenAPIDefinition(
        info = @Info(
                title = "Nexus Estates - Booking Service API",
                version = "v1",
                description = "API responsável pela gestão do ciclo de vida de reservas na plataforma Nexus Estates."
        )
)
@SpringBootApplication
public class BookingServiceApplication
{
    public static void main(String[] args)
    {
        SpringApplication.run(BookingServiceApplication.class, args);
    }
}

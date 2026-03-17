package com.nexus.estates.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuração comum para o OpenAPI/Swagger em todos os microserviços.
 * Define o servidor padrão como o API Gateway para garantir que o "Try it out"
 * funcione corretamente sem erros de CORS.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("API Gateway (Nexus Estates)")
                ));
    }
}

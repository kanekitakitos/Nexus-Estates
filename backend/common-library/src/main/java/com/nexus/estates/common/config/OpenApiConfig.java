package com.nexus.estates.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info().title("Nexus Estates API").version("1.0"))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("API Gateway (Nexus Estates)")
                ))
                // 1. Adiciona o cadeado (Authorize) no topo do Swagger
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT"))
                        // 2. Define o Header X-Actor-UserId como global (opcional, mas ajuda muito)
                        .addParameters("X-Actor-UserId", new Parameter()
                                .in("header")
                                .name("X-Actor-UserId")
                                .description("ID do utilizador que realiza a ação (Auditoria)")
                                .required(false)));
    }
}
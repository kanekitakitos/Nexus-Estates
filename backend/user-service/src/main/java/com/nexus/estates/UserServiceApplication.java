package com.nexus.estates;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


/**
 * Classe principal (Entry Point) do microsserviço de Gestão de Utilizadores (User Service)
 * <p>
 *     Responsável por inicializar o contexto do Spring Boot e carregar todas as configurações, controladores e serviços
 *     associados à gestão de identidades, perfis e segurança da plataforma Nexus Estates
 * </p>
 * <p>
 *     Inclui também a configuração global do esquema de segurança (JWT Bearer)
 *     para a documentação interativa da API através do Swagger/OpenAPI
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@SpringBootApplication
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer",
        description = "Insira o token JWT para aceder aos endpoints protegidos."
)
public class UserServiceApplication {

    /**
     * Método de arranque da aplicação Spring Boot
     * @param args Argumentos de linha de comandos passados na inicialização do processo
     */
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
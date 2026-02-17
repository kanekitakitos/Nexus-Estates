package com.nexus.estates;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


/**
 * Ponto de entrada da aplicação API Gateway.
 * <p>
 * Este componente atua como a "porta de entrada" unificada para todo o ecossistema de microserviços
 * da Nexus Estates. É responsável por:
 * <ul>
 *   <li>Roteamento dinâmico de pedidos para os serviços competentes.</li>
 *   <li>Autenticação e Autorização centralizadas (via {@link com.nexus.estates.filter.AuthenticationFilter}).</li>
 *   <li>Balanceamento de carga (client-side via Spring Cloud LoadBalancer).</li>
 *   <li>Cross-cutting concerns como logging, rate limiting e segurança.</li>
 * </ul>
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-10
 */
@SpringBootApplication

public class ApiGatewayApplication
{

    /**
     * Método principal que inicializa o contexto do Spring Boot.
     *
     * @param args Argumentos de linha de comando.
     */
    public static void main(String[] args)
    {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
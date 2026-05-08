package com.nexus.estates;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principal (Entry Point) do microserviço Property Service
 * <p>
 *     Responsável por inicializar o contexto do Spring Boot, auto-configurar as dependências e iniciar o servidor web embutido
 *     Este serviço atua como o motor central para a gestão do catálogo de imóveis, comodidades, regras de reserva
 *     e cálculo de preços dinâmicos (sazonalidade) da Nexus Estates
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@SpringBootApplication
public class PropertyServiceApplication {

    /**
     * Método principal que arranca a aplicação Spring Boot
     * @param args Argumentos de linha de comandos passados durante o arranque da aplicação (opcional)
     */
    public static void main(String[] args) {
        SpringApplication.run(PropertyServiceApplication.class, args);
    }
}

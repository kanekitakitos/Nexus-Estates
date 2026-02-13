package com.nexus.estates;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;



/**
 * Ponto de entrada da aplicação Booking Service.
 * <p>
 * Inicializa o contexto do Spring Boot e configura os componentes automáticos.
 * </p>
 *
 * @author Nexus Estates Team
 */
@SpringBootApplication
public class BookingServiceApplication
{
    public static void main(String[] args)
    {
        SpringApplication.run(BookingServiceApplication.class, args);
    }
}
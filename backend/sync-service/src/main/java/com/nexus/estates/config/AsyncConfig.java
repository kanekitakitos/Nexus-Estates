package com.nexus.estates.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Configuração global para execução de tarefas assíncronas.
 * Habilita o uso da anotação @Async em beans geridos pelo Spring.
 * * @author Equipa Nexus Estates
 * @version 1.0
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    /* * Por padrão, o Spring utiliza um SimpleAsyncTaskExecutor.
     * Para cenários de alta carga, esta classe pode ser estendida para
     * configurar um ThreadPoolTaskExecutor personalizado.
     */
}
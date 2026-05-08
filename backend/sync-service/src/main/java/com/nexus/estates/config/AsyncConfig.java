package com.nexus.estates.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuração global para execução de tarefas assíncronas.
 * Habilita o uso da anotação @Async em beans geridos pelo Spring.
 * Define um pool de threads gerenciado para evitar sobrecarga do sistema.
 * @author Equipa Nexus Estates
 * @version 1.0
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    /* * Por padrão, o Spring utiliza um SimpleAsyncTaskExecutor.
     * Para cenários de alta carga, esta classe pode ser estendida para
     * configurar um ThreadPoolTaskExecutor personalizado.
     */

    // Threads mínimas sempre ativas
    private int minThreads = 5;
    // Limite máximo de threads sob carga
    private int maxThreads = 50;
    // Capacidade da fila antes de criar novas threads até ao máximo
    private int queueSize = 100;


    @Bean(name = "taskExecutor")
    public Executor taskExecutor()
    {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        executor.setCorePoolSize(minThreads);

        executor.setMaxPoolSize(maxThreads);

        executor.setQueueCapacity(queueSize);
        executor.setThreadNamePrefix("NexusAsync-");
        executor.initialize();
        return executor;
    }
}
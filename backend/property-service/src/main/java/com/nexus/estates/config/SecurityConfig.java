package com.nexus.estates.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuração de segurança para o Property Service.
 * Permite acesso aos endpoints de documentação e delega a autenticação para o
 * API Gateway.
 * @author Nexus Estates Team
 * @version 1.0
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    /**
     * Configura a cadeia de filtros de segurança (Security Filter Chain) do Spring
     * @param http O objeto de configuração de segurança HTTP
     * @param gatewayHeaderAuthenticationFilter O filtro que processa os cabeçalhos vindos do Gateway
     * @return A cadeia de filtros configurada e pronta a ser utilizada pelo Spring
     * @throws Exception Caso ocorra um erro durante a configuração
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, GatewayHeaderAuthenticationFilter gatewayHeaderAuthenticationFilter) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .addFilterBefore(gatewayHeaderAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        // Endpoints de documentação são públicos
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        // Pesquisa de propriedades é pública
                        .requestMatchers("/api/properties/search/**").permitAll()
                        // Todos os restantes requerem autenticação (que será validada pelo Gateway)
                        // Por agora, permitimos tudo para não quebrar a comunicação entre serviços
                        // mas no futuro deve-se validar os headers X-User-*
                        .anyRequest().permitAll())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}

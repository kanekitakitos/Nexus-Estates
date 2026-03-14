package com.nexus.estates.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Configuração central de segurança da aplicação baseada em Spring Security.
 * * <p>Esta classe define as políticas de autenticação, autorização, gestão de sessões
 * e criptografia de passwords. Implementa uma arquitetura Stateless utilizando tokens JWT.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    /**
     * Filtro personalizado para intercetar e validar tokens JWT em cada requisição.
     */
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Define o algoritmo de hashing para as passwords dos utilizadores.
     * * @return uma instância de {@link BCryptPasswordEncoder} utilizando o padrão da indústria.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configura a cadeia de filtros de segurança (Security Filter Chain).
     * * <p>As principais responsabilidades deste método incluem:
     * <ul>
     * <li>Desativar a proteção CSRF (necessário para APIs Stateless).</li>
     * <li>Configurar as regras de acesso (Endpoints públicos vs protegidos).</li>
     * <li>Definir a política de sessão como STATELESS.</li>
     * <li>Injetar o filtro JWT na cadeia de execução.</p></li>
     * </ul>
     *
     * @param http objeto de configuração de segurança HTTP
     * @return a instância configurada do {@link SecurityFilterChain}
     * @throws Exception caso ocorra algum erro na configuração dos filtros
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth

                        // Endpoints de autenticação (Login/Registo) são públicos
                        .requestMatchers("/api/users/auth/**").permitAll()

                        // Endpoints de suporte (Recuperação de password) são públicos
                        .requestMatchers("/api/users/auth/password/**").permitAll()

                        // Todos os restantes pedidos (Properties, Amenities, etc.) requerem autenticação
                        .anyRequest().authenticated()
                )
                // Configuração Stateless: O servidor não mantém estado de sessão entre pedidos
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Regista o filtro JWT antes do filtro padrão de Username/Password para validar o Token primeiro
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
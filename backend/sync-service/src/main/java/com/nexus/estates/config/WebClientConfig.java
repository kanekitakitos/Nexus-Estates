package com.nexus.estates.config;

import com.nexus.estates.client.NexusClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

/**
 * Classe de configuração responsável pela criação e injeção dos clientes HTTP declarativos.
 *
 * @author Nexus Estates Team
 * @version 1.1
 */
@Configuration
public class WebClientConfig {

    @Value("${user.service.url:http://localhost:8083}")
    private String userServiceUrl;

    @Value("${booking.service.url:http://localhost:8081}")
    private String bookingServiceUrl;

    @Bean
    public NexusClients.UserClient userClient(RestClient.Builder builder) {
        return createClient(NexusClients.UserClient.class, builder, userServiceUrl);
    }

    @Bean
    public NexusClients.BookingClient bookingClient(RestClient.Builder builder) {
        return createClient(NexusClients.BookingClient.class, builder, bookingServiceUrl);
    }

    private <T> T createClient(Class<T> clientClass, RestClient.Builder builder, String baseUrl) {
        RestClient restClient = builder.baseUrl(baseUrl).build();
        RestClientAdapter adapter = RestClientAdapter.create(restClient);
        HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();
        return factory.createClient(clientClass);
    }
}

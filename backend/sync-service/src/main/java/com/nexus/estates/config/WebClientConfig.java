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
 * <p>
 *     Utiliza o novo {@link RestClient} do Spring para criar proxies das interfaces definidas em {@link NexusClients},
 *     permitindo a comunicação com o User Service e o Booking Service
 * </p>
 * @author Nexus Estates Team
 * @version 1.1
 */
@Configuration
public class WebClientConfig {

    //URL base para o microserviço de gestão de utilizadores
    @Value("${user.service.url:http://localhost:8083}")
    private String userServiceUrl;

    //URL base par o microserviço de gestão de reservas
    @Value("${booking.service.url:http://localhost:8081}")
    private String bookingServiceUrl;

    /**
     * Cria o cliente para comunicação com o User Service
     * @param builder Builder injetado do Spring para criar o {@link RestClient}
     * @return Proxy implementado da interface {@link NexusClients.UserClient}
     */
    @Value("${property.service.url:http://localhost:8082}")
    private String propertyServiceUrl;

    @Bean
    public NexusClients.UserClient userClient(RestClient.Builder builder) {
        return createClient(NexusClients.UserClient.class, builder, userServiceUrl);
    }

    /**
     * Cria o cliente para comunicação com o Booking Service
     * @param builder Builder injetado do Spring para criar o {@link RestClient}
     * @return Proxy implementado da interface {@link NexusClients.BookingClient}
     */
    @Bean
    public NexusClients.BookingClient bookingClient(RestClient.Builder builder) {
        return createClient(NexusClients.BookingClient.class, builder, bookingServiceUrl);
    }

    /**
     * Método genérico auxiliar para cirar clientes HTTP baseados em interface (proxies)
     * @param clientClass A interface do cliente a ser instanciada
     * @param builder O builder para o cliente REST
     * @param baseUrl A URL base do serviço remoto
     * @param <T> O tipo da interface do cliente
     * @return Uma instância concreta da interface do cliente
     */
    private <T> T createClient(Class<T> clientClass, RestClient.Builder builder, String baseUrl) {
        RestClient restClient = builder.baseUrl(baseUrl).build();
        RestClientAdapter adapter = RestClientAdapter.create(restClient);
        HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();
        return factory.createClient(clientClass);
    }
}

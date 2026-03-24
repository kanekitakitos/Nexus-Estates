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
 * Esta configuração utiliza o <b>Proxy Pattern</b> (Padrão de Projeto Proxy) através da
 * {@link HttpServiceProxyFactory} do Spring Framework para gerar, em tempo de execução,
 * as implementações concretas das interfaces definidas em {@link NexusClients}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Configuration
public class WebClientConfig {

    // Lê o URL do application.properties (fallback para localhost:8082)
    @Value("${property.service.url:http://localhost:8082}")
    private String propertyServiceUrl;

    // Lê o URL do application.properties (fallback para localhost:8083)
    @Value("${user.service.url:http://localhost:8083}")
    private String userServiceUrl;

    @Value("${finance.service.url:http://localhost:8085}")
    private String financeServiceUrl;

    /**
     * Cria e configura o bean do cliente de Propriedades.
     *
     * @param builder O construtor do RestClient injetado pelo Spring.
     * @return Uma instância proxy de {@link NexusClients.PropertyClient} pronta para uso.
     */
    @Bean
    public NexusClients.PropertyClient propertyClient(RestClient.Builder builder)
    {
        // Cria o RestClient apontando para o microserviço de propriedades
        RestClient restClient = builder.baseUrl(propertyServiceUrl).build();
        RestClientAdapter adapter = RestClientAdapter.create(restClient);

        // Gera a implementação da interface dinamicamente
        HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();
        return factory.createClient(NexusClients.PropertyClient.class);
    }


    /**
     * Cria e configura o bean do cliente de Utilizadores.
     *
     * @param builder O construtor do RestClient injetado pelo Spring.
     * @return Uma instância proxy de {@link NexusClients.UserClient} pronta para uso.
     */
    @Bean
    public NexusClients.UserClient UserClient(RestClient.Builder builder)
    {
        // Cria o RestClient apontando para o microserviço de utilizadores
        RestClient restClient = builder.baseUrl(userServiceUrl).build();
        RestClientAdapter adapter = RestClientAdapter.create(restClient);

        // Gera a implementação da interface dinamicamente
        HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();
        return factory.createClient(NexusClients.UserClient.class);
    }

    /**
     * Cria e configura o bean do cliente de Finance.
     *
     * <p>Este client é usado para delegar operações de pagamento ao finance-service,
     * mantendo o booking-service desacoplado da implementação do provider (Stripe/Moloni/etc).</p>
     *
     * @param builder O construtor do RestClient injetado pelo Spring.
     * @return Uma instância proxy de {@link NexusClients.FinanceClient} pronta para uso.
     */
    @Bean
    public NexusClients.FinanceClient financeClient(RestClient.Builder builder) {
        RestClient restClient = builder.baseUrl(financeServiceUrl).build();
        RestClientAdapter adapter = RestClientAdapter.create(restClient);
        HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();
        return factory.createClient(NexusClients.FinanceClient.class);
    }
}

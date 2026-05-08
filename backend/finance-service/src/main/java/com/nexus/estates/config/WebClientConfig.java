package com.nexus.estates.config;

import com.nexus.estates.client.NexusClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

/**
 * Configuração de clientes HTTP declarativos (Spring) usados pelo finance-service.
 *
 * <p>Cria um {@link NexusClients.BookingClient} apontado para o booking-service,
 * permitindo callbacks internos para confirmação de reservas após pagamento.</p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 1.0
 */
@Configuration
public class WebClientConfig {

    /**
     * URL base do microsserviço de reservas (booking-service)
     * <p>
     *     Injetado através da propriedade {@code booking.service.url}, com um valor de fallback por omissão (localhost)
     * </p>
     */
    @Value("${booking.service.url:http://localhost:8081}")
    private String bookingServiceUrl;


    /**
     * Cria e configura o cliente HTTP declarativo para comunicação com o Booking Service
     * <p>
     *     Utiliza o {@link RestClient} para construir as chamadas REST baseadas nas anotações da interface
     *     {@link NexusClients.BookingClient}, delegando à fábrica do Spring a criação do proxy dinâmico
     * </p>
     * @param builder O construtor do {@link RestClient} injetado automaticamente pelo Spring Boot
     * @return O proxy instanciado e pronto a usar da interface {@link NexusClients.BookingClient}
     */
    @Bean
    public NexusClients.BookingClient bookingClient(RestClient.Builder builder) {
        RestClient restClient = builder.baseUrl(bookingServiceUrl).build();
        RestClientAdapter adapter = RestClientAdapter.create(restClient);
        HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();
        return factory.createClient(NexusClients.BookingClient.class);
    }
}

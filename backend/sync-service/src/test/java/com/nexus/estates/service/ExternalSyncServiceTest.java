package com.nexus.estates.service;

import com.nexus.estates.dto.ExternalApiConfig;
import com.nexus.estates.service.external.ExternalAuthService;
import com.nexus.estates.service.external.ExternalSyncService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExternalSyncServiceTest {

    @Mock
    private WebClient externalApiWebClient;

    @Mock
    private ExternalAuthService authService;

    @Mock
    private WebClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersSpec requestHeadersSpec;

    @Mock
    private ClientResponse clientResponse;

    private ExternalSyncService externalSyncService;

    @BeforeEach
    void setup() {
        externalSyncService = new ExternalSyncService(externalApiWebClient, authService);
        ReflectionTestUtils.setField(externalSyncService, "requestTimeout", Duration.ofSeconds(5));
    }

    @Test
    @DisplayName("Deve retornar Optional com resposta quando API externa responder com sucesso")
    void shouldReturnOptionalWithResponseOnSuccess() {
        ExternalApiConfig config = ExternalApiConfig.builder()
                .baseUrl("https://api.com")
                .endpoint("/test")
                .build();
        
        String payload = "data";
        String expectedResponse = "success";

        when(externalApiWebClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri("https://api.com/test")).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.contentType(any())).thenReturn(requestBodyUriSpec);
        
        doAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            Consumer<HttpHeaders> headersConsumer = invocation.getArgument(0);
            headersConsumer.accept(new HttpHeaders());
            return requestBodyUriSpec;
        }).when(requestBodyUriSpec).headers(any());

        when(requestBodyUriSpec.bodyValue(payload)).thenReturn(requestHeadersSpec);
        when(clientResponse.statusCode()).thenReturn(HttpStatus.OK);
        when(clientResponse.bodyToMono(String.class)).thenReturn(Mono.just(expectedResponse));
        when(requestHeadersSpec.exchangeToMono(any())).thenAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            Function<ClientResponse, Mono<String>> fn = invocation.getArgument(0);
            return fn.apply(clientResponse);
        });

        Optional<String> result = externalSyncService.post(config, payload, String.class);

        assertThat(result).isPresent().contains(expectedResponse);
        verify(authService).applyAuthentication(any(), eq(config));
    }

    @Test
    @DisplayName("Deve retornar true em postWithoutResponse quando API responder com sucesso")
    void shouldReturnTrueOnPostWithoutResponseSuccess() {
        ExternalApiConfig config = ExternalApiConfig.builder()
                .baseUrl("https://api.com")
                .endpoint("/test")
                .build();
        
        String payload = "payload";

        when(externalApiWebClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri("https://api.com/test")).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.contentType(any())).thenReturn(requestBodyUriSpec);
        
        doAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            Consumer<HttpHeaders> headersConsumer = invocation.getArgument(0);
            headersConsumer.accept(new HttpHeaders());
            return requestBodyUriSpec;
        }).when(requestBodyUriSpec).headers(any());

        when(requestBodyUriSpec.bodyValue(payload)).thenReturn(requestHeadersSpec);
        when(clientResponse.statusCode()).thenReturn(HttpStatus.NO_CONTENT);
        when(requestHeadersSpec.exchangeToMono(any())).thenAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            Function<ClientResponse, Mono<Boolean>> fn = invocation.getArgument(0);
            return fn.apply(clientResponse);
        });

        boolean result = externalSyncService.postWithoutResponse(config, payload);

        assertThat(result).isTrue();
        verify(authService).applyAuthentication(any(), eq(config));
    }
}

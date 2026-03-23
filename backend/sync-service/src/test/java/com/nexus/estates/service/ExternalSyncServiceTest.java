package com.nexus.estates.service;

import com.nexus.estates.dto.ExternalApiConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClient;

import java.util.Optional;
import java.util.function.Consumer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExternalSyncServiceTest {

    @Mock
    private RestClient externalApiRestClient;

    @Mock
    private ExternalAuthService authService;

    @Mock
    private RestClient.RequestBodyUriSpec requestBodyUriSpec;

    @Mock
    private RestClient.RequestBodySpec requestBodySpec;

    @Mock
    private RestClient.ResponseSpec responseSpec;

    @InjectMocks
    private ExternalSyncService externalSyncService;

    @Test
    @DisplayName("Deve retornar Optional com resposta quando API externa responder com sucesso")
    void shouldReturnOptionalWithResponseOnSuccess() {
        ExternalApiConfig config = ExternalApiConfig.builder()
                .baseUrl("https://api.com")
                .endpoint("/test")
                .build();
        
        String payload = "data";
        String expectedResponse = "success";

        when(externalApiRestClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri("https://api.com/test")).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        
        doAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            Consumer<HttpHeaders> headersConsumer = invocation.getArgument(0);
            headersConsumer.accept(new HttpHeaders());
            return requestBodySpec;
        }).when(requestBodySpec).headers(any());

        when(requestBodySpec.body(payload)).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.body(String.class)).thenReturn(expectedResponse);

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

        when(externalApiRestClient.post()).thenReturn(requestBodyUriSpec);
        when(requestBodyUriSpec.uri("https://api.com/test")).thenReturn(requestBodySpec);
        when(requestBodySpec.contentType(any())).thenReturn(requestBodySpec);
        
        doAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            Consumer<HttpHeaders> headersConsumer = invocation.getArgument(0);
            headersConsumer.accept(new HttpHeaders());
            return requestBodySpec;
        }).when(requestBodySpec).headers(any());

        when(requestBodySpec.body(payload)).thenReturn(requestBodySpec);
        when(requestBodySpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.toBodilessEntity()).thenReturn(ResponseEntity.noContent().build());

        boolean result = externalSyncService.postWithoutResponse(config, payload);

        assertThat(result).isTrue();
        verify(authService).applyAuthentication(any(), eq(config));
    }
}

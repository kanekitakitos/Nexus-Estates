package com.nexus.estates.service.chat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.common.util.WebhookCryptoUtil;
import com.nexus.estates.dto.ExternalApiConfig;
import com.nexus.estates.entity.WebhookSubscription;
import com.nexus.estates.repository.WebhookSubscriptionRepository;
import com.nexus.estates.service.external.ExternalSyncService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebhookDispatcherServiceTest {

    @Mock
    private WebhookSubscriptionRepository repository;

    @Mock
    private ExternalSyncService externalSyncService;

    // Usamos um Spy no ObjectMapper para termos comportamento real de serialização JSON
    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private WebhookDispatcherService dispatcherService;

    @Test
    void dispatch_ShouldSerializeSignAndSendPayload_WhenSubscriptionExists() {
        // Arrange
        String event = "booking.created";
        String secret = WebhookCryptoUtil.generateSecret();
        String targetUrl = "https://webhook.site/teste-nexus";

        WebhookSubscription sub = WebhookSubscription.builder()
                .id(1L)
                .userId(100L)
                .targetUrl(targetUrl)
                .secret(secret)
                .isActive(true)
                .subscribedEvents(event)
                .build();

        // Quando o dispatcher procurar por webhooks ativos para 'booking.created', devolve a nossa subscrição mockada
        when(repository.findBySubscribedEventsContainingAndIsActiveTrue(event)).thenReturn(List.of(sub));

        // Um evento fictício (Record criado de forma simulada)
        BookingCreatedMessage payload = new BookingCreatedMessage(500L, 500L,500L, BookingStatus.PENDING_PAYMENT);

        // Act
        dispatcherService.dispatch(event, payload);

        // Assert
        // Capturar os argumentos que foram passados para o serviço de envio HTTP (ExternalSyncService)
        ArgumentCaptor<ExternalApiConfig> configCaptor = ArgumentCaptor.forClass(ExternalApiConfig.class);
        ArgumentCaptor<String> jsonCaptor = ArgumentCaptor.forClass(String.class);

        verify(externalSyncService, times(1)).postWithoutResponse(configCaptor.capture(), jsonCaptor.capture());

        ExternalApiConfig capturedConfig = configCaptor.getValue();
        String capturedJson = jsonCaptor.getValue();

        // 1. Validar que o URL de destino está correto
        assertEquals(targetUrl, capturedConfig.baseUrl());

        // 2. Validar que os Headers foram adicionados
        assertTrue(capturedConfig.customHeaders().containsKey("X-Nexus-Signature"));
        assertTrue(capturedConfig.customHeaders().containsKey("X-Nexus-Event"));
        assertTrue(capturedConfig.customHeaders().containsKey("X-Nexus-Delivery-Id"));

        assertEquals(event, capturedConfig.customHeaders().get("X-Nexus-Event"));

        // 3. A Prova dos 9 (HMAC-SHA256)
        String generatedSignature = capturedConfig.customHeaders().get("X-Nexus-Signature");

        // Vamos usar o nosso próprio utilitário para validar se a assinatura recebida
        // corresponde ao JSON capturado + o segredo que demos à subscrição.
        boolean isValid = WebhookCryptoUtil.isValidSignature(capturedJson, generatedSignature, secret);

        assertTrue(isValid, "A assinatura HMAC-SHA256 gerada é inválida ou não corresponde ao JSON enviado!");
    }

    @Test
    void dispatch_ShouldNotSendAnything_WhenNoActiveSubscriptionsExist() {
        // Arrange
        String event = "booking.updated";
        when(repository.findBySubscribedEventsContainingAndIsActiveTrue(event)).thenReturn(List.of());

        // Act
        dispatcherService.dispatch(event, new Object());

        // Assert
        verify(externalSyncService, never()).postWithoutResponse(any(), any());
    }
}
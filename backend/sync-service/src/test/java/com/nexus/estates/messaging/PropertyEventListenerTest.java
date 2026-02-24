package com.nexus.estates.messaging; // Confirma se este é o teu pacote de mensagens

import com.nexus.estates.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

/**
 * Teste para garantir que o Listener do RabbitMQ no Sync Service
 * dispara o EmailService corretamente.
 */
@ExtendWith(MockitoExtension.class)
class PropertyEventListenerTest {

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PropertyEventListener listener;

    @Test
    @DisplayName("Deve chamar o EmailService quando receber uma mensagem do RabbitMQ")
    void shouldCallEmailServiceOnMessage() {
        // Arrange (Simulamos a mensagem que vem do RabbitMQ)
        Map<String, Object> message = new HashMap<>();
        message.put("ownerEmail", "test@test.com");
        message.put("propertyName", "Vivenda Luxo");

        // Act (Simulamos o Listener a receber a mensagem)
        listener.handlePropertyCreated(message);

        // Assert (Verificamos se o EmailService foi acionado com os dados certos)
        verify(emailService, times(1)).sendEmailFromTemplate(
                eq("test@test.com"),
                anyString(),
                eq("propriedade-criada"),
                anyMap()
        );
    }
}
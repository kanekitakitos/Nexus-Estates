package com.nexus.estates.messaging;

import com.nexus.estates.service.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PropertyEventListener {

    private final EmailService emailService;

    @RabbitListener(queues = "property.created.email.queue")
    public void handlePropertyCreated(Map<String, Object> message) {
        log.info("Evento de propriedade recebido para email: {}", message);

        String ownerEmail = (String) message.get("ownerEmail");
        String propertyName = (String) message.get("propertyName");

        if (ownerEmail == null) {
            log.warn("Mensagem ignorada de forma irreversível: ownerEmail nulo.");
            // Um return normal dá ACK e apaga a mensagem (correto para dados inválidos)
            return;
        }

        // Se o emailService falhar (ex: SMTP down), a exceção sobe.
        // O Spring apanha a exceção, envia NACK ao broker e a mensagem
        // vai para a tua DLQ (se a configurares para esta fila).
        emailService.sendEmailFromTemplate(
                ownerEmail,
                "Confirmação: Propriedade Listada com Sucesso!",
                "propriedade-criada",
                message
        );
    }
}

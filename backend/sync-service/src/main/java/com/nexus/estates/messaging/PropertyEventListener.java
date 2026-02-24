package com.nexus.estates.messaging;

import com.nexus.estates.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import java.util.Map;

/**
 * Listener de mensagens do RabbitMQ responsável por processar eventos
 * relacionados com propriedades e encaminhá-los para serviços de notificação.
 * * @author Equipa Nexus Estates
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PropertyEventListener {

    private final EmailService emailService;

    /**
     * Consome mensagens da fila de criação de propriedades.
     * Extrai os metadados necessários e invoca o serviço de email.
     * * @param message Mapa contendo os dados do evento:
     * - ownerEmail: Email do destinatário
     * - propertyName: Nome da propriedade criada
     * - (outras variáveis para o template)
     */
    @RabbitListener(queues = "property.created.email.queue")
    public void handlePropertyCreated(Map<String, Object> message) {
        log.info("Evento de propriedade recebido para email: {}", message);

        try {
            // Extração de dados do payload da mensagem
            String ownerEmail = (String) message.get("ownerEmail");
            String propertyName = (String) message.get("propertyName");

            // Validação simples de segurança
            if (ownerEmail == null) {
                log.warn("Mensagem ignorada: ownerEmail não encontrado no payload.");
                return;
            }

            // Execução do envio de e-mail através do template Thymeleaf
            emailService.sendEmailFromTemplate(
                    ownerEmail,
                    "Confirmação: Propriedade Listada com Sucesso!",
                    "propriedade-criada",
                    message
            );

        } catch (Exception e) {
            log.error("Erro ao processar mensagem do RabbitMQ: {}", e.getMessage());
            // O erro não interrompe o broker, permitindo retry se configurado
        }
    }
}
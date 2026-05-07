package com.nexus.estates.messaging;

import com.nexus.estates.service.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import java.util.Map;

/**
 * Componente ouvinte (Listener) do RabbitMQ dedicado aos eventos do domínio de Propriedades
 * <p>
 *     Atua como um consumidor assíncrono, desvinculando o serviço de catálogo de propriedades da infraestrutura de envio de emails
 *     Garante que as notificações transacionais sejam enviadas em background sem penalizar o tempo de resposta da API principal
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PropertyEventListener {

    private final EmailService emailService;

    /**
     * Consome e processa o evento de criação de uma nova propriedade
     * <p>
     *     <b>
     *         Flusxo de Processamento:
     *     </b>
     *     <ol>
     *         <li>
     *             Extrai o email do proprietário e os dados do imóvel do payload
     *         </li>
     *         <li>
     *             Se os dados forem inváliods, a mensagem é descartada com segurança (ACK)
     *         </li>
     *         <li>
     *             Aciona a renderização do template "propriedade-criada" e envia o email
     *         </li>
     *         <li>
     *             Em caso de falha de infraestrutura, a exceção é propagada, fazendo com que o
     *             Spring envie um NACK ao broker e ecaminhe a mensagem para a Dead Letter Queue (DLQ)
     *         </li>
     *     </ol>
     * </p>
     * @param message o payload do evento recebido da fila {@code property.created.email.queue},
     *                tipicamente um dicionário JSON convertido para Map
     */
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

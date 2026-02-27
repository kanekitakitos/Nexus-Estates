package com.nexus.estates.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

/**
 * Serviço especializado no processamento e envio de comunicações eletrónicas.
 * Utiliza o JavaMailSender para o protocolo SMTP e Thymeleaf para renderização de HTML.
 * @author Equipa Nexus Estates
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    /**
     * Envia um e-mail baseado num template HTML de forma assíncrona.
     * O método utiliza o executor do Spring para não bloquear a thread principal
     * de consumo de mensagens do RabbitMQ.
     * @param to           Endereço de e-mail do destinatário.
     * @param subject      Assunto da mensagem.
     * @param templateName Nome do ficheiro HTML em src/main/resources/templates/emails/.
     * @param variables    Mapa de objetos para preenchimento dos campos dinâmicos no Thymeleaf.
     */
    @Async
    public void sendEmailFromTemplate(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            // 1. Preparação do Contexto do Thymeleaf (Mapeamento de variáveis)
            Context context = new Context();
            context.setVariables(variables);

            // 2. Renderização do HTML a partir do template
            String htmlContent = templateEngine.process("emails/" + templateName, context);

            // 3. Configuração da mensagem MIME (Suporta HTML e UTF-8)
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // 'true' indica que o conteúdo é HTML
            helper.setFrom("no-reply@nexusestates.com");

            // 4. Disparo do e-mail via servidor SMTP configurado
            mailSender.send(message);
            log.info("Email '{}' enviado com sucesso para {}", subject, to);

        } catch (Exception e) {
            /**
             * CRITÉRIO DE ACEITAÇÃO: Tolerância a Falhas.
             * O erro é logado mas não interrompe o fluxo de negócio,
             * garantindo que a falha no e-mail não cause rollback em outras operações.
             */
            log.error("FALHA AO ENVIAR EMAIL: {}. A transação continuará normalmente.", e.getMessage());
        }
    }
}
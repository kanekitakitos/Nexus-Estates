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

@Service
@RequiredArgsConstructor // Cria o construtor automaticamente para os campos final
@Slf4j // Cria o 'logger' automaticamente
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    /**
     * @param to Destinatário
     * @param subject Assunto
     * @param templateName Nome do ficheiro em templates/emails/ (sem .html)
     * @param variables Dados dinâmicos (ex: nome, links)
     */
    @Async
    public void sendEmailFromTemplate(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            Context context = new Context();
            context.setVariables(variables);

            String htmlContent = templateEngine.process("emails/" + templateName, context);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            // No Mailtrap, o 'From' pode ser qualquer um, mas para o Outlook real
            // deveria ser o mesmo que o username autenticado.
            helper.setFrom("no-reply@nexusestates.com");

            mailSender.send(message);
            log.info("Email '{}' enviado com sucesso para {}", subject, to);

        } catch (Exception e) {
            // CRITÉRIO DE ACEITAÇÃO 4: O erro é logado mas não quebra a criação da propriedade
            log.error("FALHA AO ENVIAR EMAIL: {}. A transação continuará normalmente.", e.getMessage());
        }
    }
}

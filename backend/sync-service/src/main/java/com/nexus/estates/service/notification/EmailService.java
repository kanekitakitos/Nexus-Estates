package com.nexus.estates.service.notification;

import com.nexus.estates.entity.EmailLog;
import com.nexus.estates.entity.EmailLog.EmailStatus;
import com.nexus.estates.repository.EmailLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Serviço responsável por envio de emails transacionais e auditoria de entregas.
 * <p>
 * Envia emails HTML a partir de templates Thymeleaf e regista o resultado em {@link EmailLog}
 * para auditoria e troubleshooting operacional.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 * @see EmailLogRepository
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailLogRepository emailLogRepository;

    @Async
    /**
     * Envia email a partir de template Thymeleaf e regista auditoria.
     *
     * @param to destinatário
     * @param subject assunto
     * @param templateName template em resources/templates/emails/
     * @param variables variáveis para renderização
     */
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
            helper.setFrom("no-reply@nexusestates.com");

            mailSender.send(message);
            log.info("Email '{}' enviado com sucesso para {}", subject, to);

            saveLog(to, subject, EmailStatus.SUCCESS, null);

        } catch (Exception e) {
            log.error("FALHA AO ENVIAR EMAIL: {}. A transação continuará normalmente.", e.getMessage());
            saveLog(to, subject, EmailStatus.FAILED, e.getMessage());
        }
    }

    /**
     * Regista o resultado do envio no repositório de logs.
     *
     * @param recipient destinatário
     * @param subject assunto
     * @param status status final (SUCCESS/FAILED)
     * @param errorMessage mensagem de erro (se aplicável)
     */
    private void saveLog(String recipient, String subject, EmailStatus status, String errorMessage) {
        try {
            EmailLog logEntry = EmailLog.builder()
                    .recipient(recipient)
                    .subject(subject)
                    .status(status)
                    .errorMessage(errorMessage)
                    .sentAt(LocalDateTime.now())
                    .build();
            emailLogRepository.save(logEntry);
        } catch (Exception ex) {
            log.error("Falha ao salvar log de email: {}", ex.getMessage());
        }
    }
}

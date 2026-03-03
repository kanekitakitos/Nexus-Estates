package com.nexus.estates.service;

import com.nexus.estates.entity.EmailLog;
import com.nexus.estates.entity.EmailLog.EmailStatus;
import com.nexus.estates.repository.EmailLogRepository;
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

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Serviço especializado no processamento e envio de comunicações eletrónicas.
 *
 * <p>Utiliza o {@link JavaMailSender} para o protocolo SMTP e {@link TemplateEngine}
 * para renderização de HTML dinâmico. Além do envio, este serviço é responsável
 * pela auditoria de todas as tentativas de comunicação, registando o sucesso ou
 * falha na base de dados.</p>
 *
 * @author Equipa Nexus Estates
 * @version 1.0
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailLogRepository emailLogRepository;

    /**
     * Envia um e-mail baseado num template HTML de forma assíncrona.
     *
     * <p>O método utiliza o executor do Spring ({@code @Async}) para não bloquear a thread principal
     * de consumo de mensagens do RabbitMQ, permitindo alto débito no processamento de eventos.</p>
     *
     * <p>Inclui lógica de auditoria automática:
     * <ul>
     *     <li>Se o envio for bem-sucedido, grava um log com status SUCCESS.</li>
     *     <li>Se ocorrer erro, captura a exceção, grava um log com status FAILED e a mensagem de erro,
     *     sem interromper o fluxo da aplicação.</li>
     * </ul>
     * </p>
     *
     * @param to           Endereço de e-mail do destinatário.
     * @param subject      Assunto da mensagem.
     * @param templateName Nome do ficheiro HTML em {@code src/main/resources/templates/emails/}.
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

            // 5. Auditoria de Sucesso
            saveLog(to, subject, EmailStatus.SUCCESS, null);

        } catch (Exception e) {
            /**
             * CRITÉRIO DE ACEITAÇÃO: Tolerância a Falhas.
             * O erro é logado mas não interrompe o fluxo de negócio,
             * garantindo que a falha no e-mail não cause rollback em outras operações.
             */
            log.error("FALHA AO ENVIAR EMAIL: {}. A transação continuará normalmente.", e.getMessage());
            
            // 6. Auditoria de Falha
            saveLog(to, subject, EmailStatus.FAILED, e.getMessage());
        }
    }

    /**
     * Método auxiliar para persistir o log de auditoria na base de dados.
     *
     * <p>Envolve a operação de save num try-catch para garantir que uma falha
     * na auditoria (ex: base de dados indisponível) não afete o fluxo principal,
     * embora seja logada como erro.</p>
     *
     * @param recipient    Destinatário do email.
     * @param subject      Assunto do email.
     * @param status       Status final da operação (SUCCESS/FAILED).
     * @param errorMessage Mensagem de erro em caso de falha (pode ser null).
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
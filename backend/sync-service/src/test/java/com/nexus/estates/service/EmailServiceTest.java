package com.nexus.estates.service;

import com.nexus.estates.entity.EmailLog;
import com.nexus.estates.repository.EmailLogRepository;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Testes unitários para o {@link EmailService}.
 *
 * <p>Esta classe valida a lógica de envio de emails e, crucialmente,
 * a auditoria (logging) das operações de sucesso e falha.</p>
 *
 * @author Nexus Estates Team
 */
@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private EmailLogRepository emailLogRepository;

    @InjectMocks
    private EmailService emailService;

    @Mock
    private MimeMessage mimeMessage;

    /**
     * Configuração inicial dos mocks.
     * <p>Garante que o mock do JavaMailSender retorna uma mensagem MIME válida
     * quando solicitado, evitando NullPointerExceptions durante os testes.</p>
     */
    @BeforeEach
    void setUp() {
        // Simula a criação de uma mensagem MIME pelo JavaMailSender
        lenient().when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    /**
     * Valida o fluxo de sucesso no envio de email.
     *
     * <p>Cenário: O envio do email ocorre sem erros.
     * Resultado Esperado:
     * 1. O método send() do mailSender é invocado.
     * 2. Um registo de auditoria (EmailLog) é salvo com status SUCCESS.
     * 3. Os dados do log (destinatário, assunto) correspondem aos parâmetros de entrada.</p>
     */
    @Test
    @DisplayName("Deve enviar email e registar log de sucesso")
    void shouldProcessTemplateAndSendEmailAndLogSuccess() {
        // GIVEN
        String to = "test@example.com";
        String subject = "Teste";
        String templateName = "property-created";
        Map<String, Object> variables = Map.of("propertyName", "Casa Praia");

        // Simula o Thymeleaf a transformar o HTML num texto qualquer
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("<html>Conteúdo</html>");

        // WHEN
        emailService.sendEmailFromTemplate(to, subject, templateName, variables);

        // THEN
        // Verifica se o mailSender.send() foi chamado exatamente 1 vez
        verify(mailSender, times(1)).send(any(MimeMessage.class));
        verify(templateEngine, times(1)).process(eq("emails/" + templateName), any(Context.class));

        // Verifica se o log de sucesso foi salvo
        ArgumentCaptor<EmailLog> logCaptor = ArgumentCaptor.forClass(EmailLog.class);
        verify(emailLogRepository, times(1)).save(logCaptor.capture());
        
        EmailLog savedLog = logCaptor.getValue();
        assertEquals(to, savedLog.getRecipient());
        assertEquals(subject, savedLog.getSubject());
        assertEquals(EmailLog.EmailStatus.SUCCESS, savedLog.getStatus());
        assertNotNull(savedLog.getSentAt());
    }

    /**
     * Valida o fluxo de falha e tolerância a erros.
     *
     * <p>Cenário: O servidor SMTP lança uma exceção durante o envio.
     * Resultado Esperado:
     * 1. A exceção é capturada e não propagada (o método não falha).
     * 2. Um registo de auditoria (EmailLog) é salvo com status FAILED.
     * 3. A mensagem de erro da exceção é persistida no log para diagnóstico.</p>
     */
    @Test
    @DisplayName("Deve capturar erro de envio e registar log de falha")
    void shouldLogFailureWhenEmailSendingFails() {
        // GIVEN
        String to = "fail@example.com";
        String subject = "Falha";
        String templateName = "error-template";
        Map<String, Object> variables = Map.of();

        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("<html>Conteúdo</html>");
        doThrow(new RuntimeException("SMTP Error")).when(mailSender).send(any(MimeMessage.class));

        // WHEN
        emailService.sendEmailFromTemplate(to, subject, templateName, variables);

        // THEN
        // Verifica se o log de falha foi salvo
        ArgumentCaptor<EmailLog> logCaptor = ArgumentCaptor.forClass(EmailLog.class);
        verify(emailLogRepository, times(1)).save(logCaptor.capture());

        EmailLog savedLog = logCaptor.getValue();
        assertEquals(to, savedLog.getRecipient());
        assertEquals(subject, savedLog.getSubject());
        assertEquals(EmailLog.EmailStatus.FAILED, savedLog.getStatus());
        assertEquals("SMTP Error", savedLog.getErrorMessage());
        assertNotNull(savedLog.getSentAt());
    }
}
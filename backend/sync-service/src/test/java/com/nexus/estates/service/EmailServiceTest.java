package com.nexus.estates.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateEngine templateEngine;

    @InjectMocks
    private EmailService emailService;

    @Mock
    private MimeMessage mimeMessage;

    @BeforeEach
    void setUp() {
        // Simula a criação de uma mensagem MIME pelo JavaMailSender
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Test
    void shouldProcessTemplateAndSendEmail() {
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
    }
}
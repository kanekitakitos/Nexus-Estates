package com.nexus.estates.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidade JPA que representa um registo de auditoria para cada email enviado pelo sistema.
 * <p>
 * Esta tabela é crucial para a rastreabilidade e diagnóstico de problemas de comunicação,
 * permitindo que a equipa de suporte verifique se um email foi enviado com sucesso,
 * quando foi enviado e, em caso de falha, qual foi o motivo.
 * </p>
 *
 * @author Nexus Estates Team
 */
@Entity
@Table(name = "email_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLog {

    /**
     * Identificador único do registo de log.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Endereço de email do destinatário.
     */
    @Column(nullable = false)
    private String recipient;

    /**
     * Assunto do email enviado.
     */
    @Column(nullable = false)
    private String subject;

    /**
     * Corpo do email enviado.
     */
    @Column(columnDefinition = "TEXT")
    private String body;

    /**
     * Status final do envio (SUCCESS ou FAILED).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmailStatus status;

    /**
     * Mensagem de erro capturada em caso de falha no envio.
     * Nulo se o envio for bem-sucedido.
     */
    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    /**
     * Timestamp exato de quando a tentativa de envio foi realizada.
     */
    @Column(nullable = false)
    private LocalDateTime sentAt;

    /**
     * Enum que define os possíveis estados de um envio de email.
     */
    public enum EmailStatus {
        /**
         * O email foi aceite pelo servidor SMTP para entrega.
         */
        SUCCESS,
        /**
         * Ocorreu um erro ao tentar enviar o email.
         */
        FAILED
    }
}
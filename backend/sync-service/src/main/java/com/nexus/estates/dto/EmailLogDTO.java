package com.nexus.estates.dto;

import com.nexus.estates.entity.EmailLog.EmailStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO (Data Transfer Object) para a entidade {@link com.nexus.estates.entity.EmailLog}.
 *
 * <p>Este objeto é utilizado para transferir dados de logs de email de forma segura
 * e desacoplada da entidade de persistência. É ideal para ser exposto em endpoints
 * de API REST, por exemplo, numa futura tela de administração que liste o histórico
 * de emails enviados.</p>
 *
 * @author Nexus Estates Team
 */
@Data
@Builder
public class EmailLogDTO {
    private Long id;
    private String recipient;
    private String subject;
    private EmailStatus status;
    private String errorMessage;
    private LocalDateTime sentAt;
}
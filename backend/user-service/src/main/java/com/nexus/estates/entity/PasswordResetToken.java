package com.nexus.estates.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidade de persistência para tokens de redefinição de credenciais.
 * <p>
 * Esta classe mapeia a tabela {@code password_reset_tokens} e é utilizada para
 * gerir o ciclo de vida de segurança de pedidos de recuperação de conta.
 * Implementa um mecanismo de expiração temporal para mitigar riscos de ataques de replay.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 */
@Entity
@Table(name = "password_reset_tokens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetToken {

    /**
     * Identificador único do registo do token.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Valor alfanumérico único (geralmente um UUID) enviado ao utilizador.
     * <p>Este campo é indexado e obrigatório para permitir pesquisas rápidas durante a validação.</p>
     */
    @Column(nullable = false, unique = true)
    private String token;

    /**
     * Data e hora limite para a validade do token.
     * <p>A política de segurança padrão recomenda janelas curtas (ex: 15 a 60 minutos).</p>
     */
    @Column(nullable = false)
    private LocalDateTime expiryDate;

    /**
     * Relação um-para-um com o utilizador que solicitou a recuperação.
     * <p>O carregamento EAGER garante que os dados do utilizador estejam disponíveis
     * imediatamente para realizar a alteração da password assim que o token for validado.</p>
     */
    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    /**
     * Verifica a validade temporal do token no momento da invocação.
     * <p>
     * Este método de conveniência encapsula a lógica de negócio que determina se
     * o processo de redefinição pode prosseguir ou se o utilizador deve solicitar um novo token.
     * </p>
     * * @return {@code true} se o instante atual for posterior à {@code expiryDate};
     * {@code false} caso o token ainda esteja dentro do prazo de validade.
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
}
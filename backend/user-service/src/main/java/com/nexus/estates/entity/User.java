package com.nexus.estates.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

/**
 * Representação persistente de um Utilizador no sistema de Identidade.
 * <p>
 *     Esta entidade mapeia a tabela {@code users} e encapsula as credenciais de acesso,
 *     dados de contacto e perfil de autorização. É o núcleo do microserviço de Utilizadores.
 * </p>
 *
 * <p>
 *     <b>Invariantes:</b>
 * </p>
 *      <ul>
 *          <li>{@code email} deve ser único em todo o sistema.</li>
 *          <li>{@code password} nunca deve ser armazenada em texto limpo (apenas hash BCrypt).</li>
 *          <li>{@code role} é obrigatório para definir o alcance do acesso.</li>
 *      </ul>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entidade que representa um utilizador do sistema")
public class User {

    /**
     * Identificador único (Primary Key) do utilizador.
     * <p>
     *     Gerado sequencialmente pela base de dados (IDENTITY).
     * </p>
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Identificador único do utilizador", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    /**
     * Endereço de correio eletrónico do utilizador.
     * <p>
     *     Atua como o "username" principal para autenticação.
     *     Deve ser único (contraint {@code unique = true}) e não nulo.
     * </p>
     */
    @Column(nullable = false, unique = true)
    @Schema(description = "Email do utilizador", example = "user@example.com")
    private String email;

    /**
     * Hash da palavra-passe do utilizador.
     * <p>
     *     <b>Segurança:</b>
     *     Este campo armazena apenas o hash gerado (ex:BCrypt) e nunca a senha original.
     * </p>
     */
    @Column(nullable = false)
    @Schema(description = "Hash da password (não exposto em leituras)", hidden = true)
    private String password;

    /**
     * Contacto telefónico do utilizador.
     * <p>
     *     Opcional. Útil para notificações SMS ou contacto de emergência em reservas.
     * </p>
     */
    @Schema(description = "Número de telefone", example = "+351912345678")
    private String phone;

    /**
     * Papel atribuído ao utilizador no sistema.
     * <p>
     *     Armazenado como {@code STRING} na base de dados (ex: "ADMIN", "GUEST")
     *     para garantir legibilidade e facilitar migrações futuras.
     * </p>
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Schema(description = "Papel do utilizador", example = "GUEST")
    private UserRole role;
}

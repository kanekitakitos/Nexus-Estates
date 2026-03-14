package com.nexus.estates.repository;

import com.nexus.estates.entity.PasswordResetToken;
import com.nexus.estates.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Interface de repositório para a entidade {@link PasswordResetToken}.
 * <p>
 * Responsável por gerir as operações de persistência relacionadas com os tokens
 * de recuperação de password, permitindo a localização e a limpeza de tokens
 * na base de dados.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Procura um token de recuperação específico na base de dados.
     * <p>
     * Utilizado durante a fase final da redefinição de password para validar
     * se o código enviado pelo utilizador existe e é válido.
     * </p>
     * * @param token String alfanumérica única enviada ao utilizador.
     * @return Um {@link Optional} contendo o token se for encontrado, ou vazio caso contrário.
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Remove todos os tokens associados a um utilizador específico.
     * <p>
     * Este método é crucial para a segurança, permitindo invalidar tokens antigos
     * sempre que um novo processo de recuperação é iniciado ou quando a
     * password é alterada com sucesso, evitando a reutilização de tokens (Replay Attacks).
     * </p>
     * * @param user A entidade {@link User} cujos tokens devem ser removidos.
     */
    void deleteByUser(User user);
}
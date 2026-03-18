package com.nexus.estates.service;

import com.nexus.estates.entity.PasswordResetToken;
import com.nexus.estates.entity.User;
import com.nexus.estates.exception.InvalidTokenException;
import com.nexus.estates.repository.PasswordResetTokenRepository;
import com.nexus.estates.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Serviço de domínio responsável pela orquestração do fluxo de recuperação de credenciais.
 * <p>
 * Este serviço gere a criação, validação e limpeza de tokens de segurança, garantindo
 * que a redefinição de passwords ocorra de forma atómica e segura através do uso
 * de transações de base de dados e hashing de BCrypt.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 */
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Inicia o fluxo de recuperação de conta para um determinado endereço de e-mail.
     * <p>
     * O método segue o princípio de <b>Security by Obscurity</b>: se o e-mail não existir,
     * o sistema não retorna erro, impedindo a enumeração de utilizadores por agentes maliciosos.
     * Se existir, invalida processos de recuperação anteriores antes de gerar um novo.
     * </p>
     *
     * @param email O endereço de e-mail do utilizador que solicita a redefinição.
     */
    @Transactional
    public void initiatePasswordReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            // Garante que apenas um token esteja ativo por utilizador de cada vez
            tokenRepository.deleteByUser(user);

            // Geração de identificador opaco e imprevisível
            String token = UUID.randomUUID().toString();

            // Configuração do envelope de segurança com TTL (Time-To-Live) de 15 minutos
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusMinutes(15))
                    .build();

            tokenRepository.save(resetToken);

            // TODO: Acoplar o EmailService para envio assíncrono do token
            System.out.println("Token de recuperação gerado para " + email + ": " + token);
        });
    }

    /**
     * Conclui o processo de redefinição, substituindo a password antiga pela nova credencial.
     * <p>
     * Este método valida a existência do token, verifica a sua validade temporal e,
     * em caso de sucesso, procede à encriptação da nova password. O token é destruído
     * imediatamente após a operação para evitar reutilização (Idempotência de segurança).
     * </p>
     *
     * @param token       O token UUID recebido pelo utilizador via e-mail.
     * @param newPassword A nova password em texto limpo, a ser processada pelo {@link PasswordEncoder}.
     * @throws InvalidTokenException Caso o token seja inexistente ou já tenha ultrapassado a data de expiração.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // Localização do token ou lançamento de exceção de negócio
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Token inválido ou não encontrado."));

        // Verificação de expiração temporal
        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new InvalidTokenException("Token expirado. Por favor, solicite um novo.");
        }

        // Atualização da entidade User com a nova credencial encriptada
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Limpeza de segurança: invalida o token após o primeiro uso bem-sucedido
        tokenRepository.delete(resetToken);
    }
}
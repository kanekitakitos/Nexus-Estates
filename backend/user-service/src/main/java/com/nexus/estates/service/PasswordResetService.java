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
 * Serviço responsável pela gestão de recuperação de passwords.
 */
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Inicia o processo de recuperação de password.
     * Gera um token único e guarda-o na base de dados.
     *
     * @param email O email do utilizador que solicitou a recuperação.
     */
    @Transactional
    public void initiatePasswordReset(String email) {
        // Se o utilizador não existir, não fazemos nada (security by obscurity)
        // para não revelar quais emails estão registados.
        userRepository.findByEmail(email).ifPresent(user -> {
            // Remove tokens antigos se existirem
            tokenRepository.deleteByUser(user);

            // Gera token único
            String token = UUID.randomUUID().toString();

            // Cria e guarda o token com validade de 15 minutos
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusMinutes(15))
                    .build();

            tokenRepository.save(resetToken);

            // TODO: Integrar com serviço de Email para enviar o token
            System.out.println("Token de recuperação gerado para " + email + ": " + token);
        });
    }

    /**
     * Redefine a password do utilizador usando um token válido.
     *
     * @param token O token de recuperação recebido.
     * @param newPassword A nova password a definir.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Token inválido ou não encontrado."));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new InvalidTokenException("Token expirado. Por favor, solicite um novo.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Invalida o token após uso com sucesso
        tokenRepository.delete(resetToken);
    }
}

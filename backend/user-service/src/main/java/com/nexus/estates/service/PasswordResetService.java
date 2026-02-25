package com.nexus.estates.service;

import com.nexus.estates.dto.ForgotPasswordRequest;
import com.nexus.estates.dto.ResetPasswordRequest;
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
     * @param request Pedido contendo o email do utilizador.
     * @return O token gerado (em produção, este token seria enviado por email).
     */
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado com este email."));

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

        // TODO: Enviar email com o token (simulado aqui retornando o token)
        return token;
    }

    /**
     * Redefine a password do utilizador usando um token válido.
     *
     * @param request Pedido contendo o token e a nova password.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = tokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Token inválido ou não encontrado."));

        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new InvalidTokenException("Token expirado. Por favor, solicite um novo.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalida o token após uso com sucesso
        tokenRepository.delete(resetToken);
    }
}

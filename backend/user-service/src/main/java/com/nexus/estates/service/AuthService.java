package com.nexus.estates.service;

import com.nexus.estates.dto.LoginRequest;
import com.nexus.estates.dto.RegisterRequest;
import com.nexus.estates.dto.AuthResponse;
import com.nexus.estates.entity.User;
import com.nexus.estates.entity.UserRole;
import com.nexus.estates.exception.EmailAlreadyRegisteredException;
import com.nexus.estates.exception.InvalidCredentialsException;
import com.nexus.estates.exception.UserNotFoundException;
import com.nexus.estates.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Serviço responsável pela lógica de negócio de autenticação e registo.
 * <p>
 *     Coordena a interação entre o repositório de utilizadores, o codificador de passwords
 *     e o serviço de geração de tokens JWT.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 * @since 2026-02-15
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Regista um novo utilizador no sistema.
     * <p>
     *     Valida se o email já existe, codifica a password e gera um token inicial.
     * </p>
     *
     * @param request DTO com dados de registo.
     * @return {@link AuthResponse} contendo o token JWT e dados do utilizador.
     * @throws EmailAlreadyRegisteredException se o email já estiver em uso.
     */
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyRegisteredException("O email '" + request.getEmail() + "' já se encontra registado.");
        }

        var user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole() != null ? request.getRole() : UserRole.GUEST)
                .build();

        var savedUser = userRepository.save(user);

        var token = jwtService.generateToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .build();
    }

    /**
     * Autentica um utilizador com base nas credenciais fornecidas.
     *
     * @param request DTO com email e password.
     * @return {@link AuthResponse} contendo o token JWT e dados do utilizador.
     * @throws UserNotFoundException se o utilizador não for encontrado.
     * @throws InvalidCredentialsException se a password estiver incorreta.
     */
    public AuthResponse login(LoginRequest request) {

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Utilizador com o email '" + request.getEmail() + "' não foi encontrado."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("A password fornecida está incorreta.");
        }

        var token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}

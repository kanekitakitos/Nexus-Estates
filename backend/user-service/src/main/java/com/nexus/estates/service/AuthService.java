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

    /**
     * Repositório para acesso e manipulação dos dados da conta do utilizador
     * Utilizado para validar credenciais, verificar unicidade de emails e persistir novas contas
     */
    private final UserRepository userRepository;

    /**
     * Utilitário criptográfico responsável por aplicar o algoritmo de hashing para
     * garantir o armazenamento seguro de novas passwords e a validação em processos de login
     */
    private final PasswordEncoder passwordEncoder;

    /**
     * Serviço centralizado para emissão e validação de tokens JWT gerando o "passaportte" de sessão que será devolvido ao cliente
     */
    private final JwtService jwtService;

    /**
     * Motor de resolução de estrtégias de Single Sign-On
     * Permite validar de forma agnóstica as identidades recebidas de provedores externos (como o Clerk)
     */
    private final ExternalIdentityProviderStrategy externalIdentityProvider;

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

        //A password deve ter pelo menos 8 caracteres
        /*if (request.getPassword() == null || request.getPassword().length() < 8)
            throw new IllegalArgumentException("A password deve ter pelo menos 8 caracteres.");*/

        //O email deve conter um @
        /*if (!request.getEmail().contains("@"))
            throw new IllegalArgumentException("O email fornecido não é válido.");*/

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyRegisteredException("O email '" + request.getEmail() + "' já se encontra registado.");
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.GUEST;

        var user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
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
        // se quiser Remove a promoção automática de GUEST para OWNER no login" — remover estas 4 linhas do login():
        if (user.getRole() == UserRole.GUEST) {
            user.setRole(UserRole.OWNER);
            user = userRepository.save(user);
        }

        var token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Processa a autenticação via Single Sign-On (SSO) trocando um token do Clerk por um token interno
     * @param clerkToken O token JWT emitido pelo provedor de entidade externo (Clerk)
     * @return Um {@link AuthResponse} com token de acesso interno da Nexus Estates
     */
    public AuthResponse exchangeClerkToken(String clerkToken) {
        var identity = externalIdentityProvider.verify(clerkToken);

        var user = externalIdentityProvider.findExistingUser(userRepository, identity).orElse(null);

        if (user == null) {
            user = User.builder()
                    .email(identity.email())
                    .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .phone(null)
                    .role(UserRole.OWNER)
                    .build();
        }

        externalIdentityProvider.applyIdentity(user, identity);

        user = userRepository.save(user);
        var token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}

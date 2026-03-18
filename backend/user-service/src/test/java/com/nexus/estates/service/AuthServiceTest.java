package com.nexus.estates.service;

import com.nexus.estates.dto.AuthResponse;
import com.nexus.estates.dto.LoginRequest;
import com.nexus.estates.dto.RegisterRequest;
import com.nexus.estates.entity.User;
import com.nexus.estates.entity.UserRole;
import com.nexus.estates.exception.EmailAlreadyRegisteredException;
import com.nexus.estates.exception.InvalidCredentialsException;
import com.nexus.estates.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Suite de testes unitários para o serviço de autenticação {@link AuthService}.
 * <p>
 * Esta classe valida os fluxos críticos de entrada no sistema: o registo de novos
 * utilizadores e o processo de login. Garante que a segurança (hashing de passwords)
 * e a geração de tokens JWT ocorram conforme as políticas da Nexus Estates.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Testes de Unidade: Auth Service")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;

    /**
     * Inicializa os dados de teste comuns antes de cada execução.
     */
    @BeforeEach
    void init() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("new@example.com");
        registerRequest.setPassword("plain");
        registerRequest.setPhone("123");
        registerRequest.setRole(null);
    }

    /**
     * Valida a criação de um novo utilizador com o papel padrão.
     * <p>
     * <b>Cenário:</b> Pedido de registo sem role definido.<br>
     * <b>Expectativa:</b> O utilizador deve ser gravado com {@link UserRole#GUEST}
     * e a password deve ser encriptada.
     * </p>
     */
    @Test
    @DisplayName("Deve registar utilizador com Role GUEST por defeito e retornar token")
    void shouldRegisterWithDefaultGuestRoleAndReturnToken() {
        // Arrange
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("plain")).thenReturn("hashed");

        Long generatedId = 1L;
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            return User.builder()
                    .id(generatedId)
                    .email(u.getEmail())
                    .password(u.getPassword())
                    .phone(u.getPhone())
                    .role(u.getRole())
                    .build();
        });

        when(jwtService.generateToken(any(User.class))).thenReturn("token");

        // Act
        AuthResponse response = authService.register(registerRequest);

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User saved = userCaptor.getValue();
        assertEquals("hashed", saved.getPassword());
        assertEquals(UserRole.GUEST, saved.getRole());

        assertEquals(generatedId, response.getId());
        assertEquals("new@example.com", response.getEmail());
        assertEquals("GUEST", response.getRole());
        assertEquals("token", response.getToken());
    }

    /**
     * Testa a proteção contra emails duplicados.
     * <p>
     * <b>Expectativa:</b> Lançar {@link EmailAlreadyRegisteredException} e
     * interromper o processo de gravação.
     * </p>
     */
    @Test
    @DisplayName("Deve falhar o registo quando o email já existe no sistema")
    void shouldFailRegisterWhenEmailExists() {
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.of(User.builder().build()));

        assertThrows(EmailAlreadyRegisteredException.class, () -> authService.register(registerRequest));

        verify(userRepository, never()).save(any());
    }

    /**
     * Valida o fluxo de login com credenciais corretas.
     * <p>
     * <b>Expectativa:</b> Retornar um {@link AuthResponse} contendo o token JWT
     * e os metadados do utilizador.
     * </p>
     */
    @Test
    @DisplayName("Deve efetuar login com sucesso e retornar token")
    void shouldLoginSuccessfullyAndReturnToken() {
        // Arrange
        Long id = 100L;
        User existing = User.builder()
                .id(id)
                .email("u@example.com")
                .password("hashed")
                .role(UserRole.GUEST)
                .build();

        when(userRepository.findByEmail("u@example.com")).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("plain", "hashed")).thenReturn(true);
        when(jwtService.generateToken(existing)).thenReturn("tok");

        LoginRequest req = LoginRequest.builder().email("u@example.com").password("plain").build();

        // Act
        AuthResponse response = authService.login(req);

        // Assert
        assertEquals(id, response.getId());
        assertEquals("u@example.com", response.getEmail());
        assertEquals("GUEST", response.getRole());
        assertEquals("tok", response.getToken());
    }

    /**
     * Testa a segurança do login contra passwords incorretas.
     * <p>
     * <b>Expectativa:</b> Lançar {@link InvalidCredentialsException} para impedir o acesso.
     * </p>
     */
    @Test
    @DisplayName("Deve falhar o login quando a password está incorreta")
    void shouldFailLoginWhenWrongPassword() {
        // Arrange
        User existing = User.builder()
                .id(50L)
                .email("u@example.com")
                .password("hashed")
                .role(UserRole.GUEST)
                .build();

        when(userRepository.findByEmail("u@example.com")).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        LoginRequest req = LoginRequest.builder().email("u@example.com").password("wrong").build();

        // Act & Assert
        assertThrows(InvalidCredentialsException.class, () -> authService.login(req));
    }
}
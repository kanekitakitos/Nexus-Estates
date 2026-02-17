package com.nexus.estates.service;

import com.nexus.estates.dto.AuthResponde;
import com.nexus.estates.dto.LoginRequest;
import com.nexus.estates.dto.RegisterRequest;
import com.nexus.estates.entity.User;
import com.nexus.estates.entity.UserRole;
import com.nexus.estates.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
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

    @BeforeEach
    void init() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("new@example.com");
        registerRequest.setPassword("plain");
        registerRequest.setPhone("123");
        registerRequest.setRole(null);
    }

    @Test
    void shouldRegisterWithDefaultGuestRoleAndReturnToken() {
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("plain")).thenReturn("hashed");
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        UUID id = UUID.randomUUID();
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            return User.builder()
                    .id(id)
                    .email(u.getEmail())
                    .password(u.getPassword())
                    .phone(u.getPhone())
                    .role(u.getRole())
                    .build();
        });
        when(jwtService.generateToken(any(User.class))).thenReturn("token");

        AuthResponde response = authService.register(registerRequest);

        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertEquals("hashed", saved.getPassword());
        assertEquals(UserRole.GUEST, saved.getRole());
        assertEquals(id, response.getId());
        assertEquals("new@example.com", response.getEmail());
        assertEquals("GUEST", response.getRole());
        assertEquals("token", response.getToken());
    }

    @Test
    void shouldFailRegisterWhenEmailExists() {
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.of(User.builder().build()));
        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void shouldLoginSuccessfullyAndReturnToken() {
        UUID id = UUID.randomUUID();
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
        AuthResponde response = authService.login(req);

        assertEquals(id, response.getId());
        assertEquals("u@example.com", response.getEmail());
        assertEquals("GUEST", response.getRole());
        assertEquals("tok", response.getToken());
    }

    @Test
    void shouldFailLoginWhenWrongPassword() {
        User existing = User.builder()
                .id(UUID.randomUUID())
                .email("u@example.com")
                .password("hashed")
                .role(UserRole.GUEST)
                .build();
        when(userRepository.findByEmail("u@example.com")).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);
        LoginRequest req = LoginRequest.builder().email("u@example.com").password("wrong").build();
        assertThrows(RuntimeException.class, () -> authService.login(req));
    }
}

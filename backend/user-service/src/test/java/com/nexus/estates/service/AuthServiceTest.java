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

    @Test
    void shouldFailRegisterWhenEmailExists() {
        when(userRepository.findByEmail("new@example.com")).thenReturn(Optional.of(User.builder().build()));
        
        assertThrows(EmailAlreadyRegisteredException.class, () -> authService.register(registerRequest));
        
        verify(userRepository, never()).save(any());
    }

    @Test
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

    @Test
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

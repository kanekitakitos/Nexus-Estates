package com.nexus.estates.config;

import com.nexus.estates.entity.User;
import com.nexus.estates.entity.UserRole;
import com.nexus.estates.repository.UserRepository;
import com.nexus.estates.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Suite de testes unitários para o {@link JwtAuthenticationFilter}.
 * <p>
 * O objetivo destes testes é garantir que o mecanismo de interceção de pedidos
 * extrai corretamente as credenciais do header HTTP, valida o token JWT e
 * popula o contexto de segurança do Spring (SecurityContextHolder).
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Testes de Unidade: JWT Authentication Filter")
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpServletResponse response;
    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    /**
     * Limpa o contexto de segurança antes de cada teste para evitar poluição
     * entre execuções e garantir isolamento total.
     */
    @BeforeEach
    void setup() {
        SecurityContextHolder.clearContext();
    }

    /**
     * Testa o comportamento quando nenhum header de autorização é enviado.
     * <p>
     * <b>Expectativa:</b> O filtro deve ignorar o processamento de JWT e
     * simplesmente passar o pedido para o próximo filtro na cadeia.
     * </p>
     */
    @Test
    @DisplayName("Deve ignorar autenticação quando o header Authorization está ausente")
    void shouldSkipWhenAuthorizationHeaderMissing() throws Exception {
        when(request.getHeader("Authorization")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    /**
     * Testa o fluxo principal de autenticação bem-sucedida.
     * <p>
     * <b>Expectativa:</b> O token deve ser validado e o utilizador deve ser
     * autenticado com as autoridades (Roles) extraídas da base de dados.
     * </p>
     */
    @Test
    @DisplayName("Deve autenticar utilizador com sucesso através de um token válido")
    void shouldSetAuthenticationOnValidToken() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer tok");
        when(jwtService.extractUsername("tok")).thenReturn("u@example.com");
        User u = User.builder().id(124L).email("u@example.com").password("x").role(UserRole.GUEST).build();
        when(userRepository.findByEmail("u@example.com")).thenReturn(Optional.of(u));
        when(jwtService.isTokenValid("tok", "u@example.com")).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals("ROLE_GUEST", auth.getAuthorities().iterator().next().getAuthority());
        verify(filterChain).doFilter(request, response);
    }

    /**
     * Testa a prioridade de autoridade entre o Header X-User-Role e a Base de Dados.
     * <p>
     * <b>Cenário:</b> O Gateway injeta um role (ex: ADMIN) no header. A base de dados
     * contém outro (ex: GUEST).<br>
     * <b>Expectativa:</b> O filtro deve honrar o role vindo do header, permitindo
     * escalabilidade em arquiteturas de microsserviços.
     * </p>
     */
    @Test
    @DisplayName("Deve dar prioridade ao Role definido no header X-User-Role")
    void shouldPrioritizeXUserRoleHeader() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer tok");
        when(request.getHeader("X-User-Role")).thenReturn("ADMIN");

        when(jwtService.extractUsername("tok")).thenReturn("u@example.com");
        User u = User.builder().id(124L).email("u@example.com").password("x").role(UserRole.GUEST).build();
        when(userRepository.findByEmail("u@example.com")).thenReturn(Optional.of(u));
        when(jwtService.isTokenValid("tok", "u@example.com")).thenReturn(true);

        filter.doFilterInternal(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals("ROLE_ADMIN", auth.getAuthorities().iterator().next().getAuthority());
        verify(filterChain).doFilter(request, response);
    }

    /**
     * Testa o tratamento de erros durante a extração do token.
     * <p>
     * <b>Expectativa:</b> Mesmo perante um token corrompido ou erro de sistema,
     * o filtro não deve "estourar" o pedido. Deve permitir que a cadeia continue,
     * sendo a autorização negada posteriormente pelo SecurityConfig.
     * </p>
     */
    @Test
    @DisplayName("Deve continuar a cadeia de filtros mesmo se o token for inválido")
    void shouldContinueChainOnInvalidToken() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer tok");
        when(jwtService.extractUsername("tok")).thenThrow(new RuntimeException("bad"));

        filter.doFilterInternal(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }
}
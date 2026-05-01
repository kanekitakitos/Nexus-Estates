package com.nexus.estates.controller;

import com.nexus.estates.entity.User;
import com.nexus.estates.repository.UserRepository;
import com.nexus.estates.service.JwtService;
import com.nexus.estates.exception.EmailAlreadyRegisteredException;
import com.nexus.estates.exception.InvalidCredentialsException;
import com.nexus.estates.dto.AuthResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.Optional;

/**
 * Controlador REST responsável pela gestão de Utilizadores.
 * <p>
 *     Este componente expõe endpoints para a criação e consulta de perfis de utilizador.
 *     Atua como ponto de entrada para operações administrativas e de auto-gestão de conta.
 * </p>
 *
 * <p>
 *     <b>Nota:</b>
 *     A lógica de autenticação (Login/Token) deve residir no {@code AuthController}.
 *     Este controlador foca-se na gestão do recurso {@code User}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-15
 */
@RestController
@RequestMapping("/api/users")
@Tag(name = "Gestão de Utilizadores", description = "Endpoints para gestão de perfis de utilizador (CRUD)")
public class UserController {

    /**
     * Injeção de dependência do repositório para acesso a dados.
     */
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    /**
     * Recupera a lista completa de utilizadores registados no sistema.
     * <p>
     *     Útil para painéis de administração.
     *     <b>Requer permissão de ADMIN.</b>
     * </p>
     * @return {@link List} contendo todos os objetos {@link User} persistidos.
     */
    @Operation(summary = "Listar todos os utilizadores", description = "Retorna uma lista de todos os utilizadores registados. Requer role ADMIN.")
    @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso")
    @ApiResponse(responseCode = "403", description = "Acesso negado")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    /**
     * Regista um novo utilizador no sistema (Método Administrativo/Interno).
     * <p>
     *     Recebe os dados brutos, incluindo a password.
     *     <b>Atenção:</b> Para registo público seguro, usar {@code AuthController}.
     *     <b>Requer permissão de ADMIN.</b>
     * </p>
     * @param user O objeto {@link User} construído a partir do JSON recebido.
     * @return O objeto {@link User} persistido, incluindo o ID gerado.
     */
    @Operation(summary = "Criar utilizador (Admin)", description = "Cria um utilizador diretamente na base de dados. Requer role ADMIN.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilizador criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public User createUser(@RequestBody User user){
        // SEGURANÇA: Codificar a password antes de guardar
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Recupera os detalhes de um utilizador específico pelo seu identificador.
     * <p>
     *     <b>Requer permissão de ADMIN ou OWNER.</b>
     * </p>
     * @param id Identificador único do utilizador (Long).
     * @return O objeto {@link User} correspondente.
     * @throws RuntimeException se o utilizador não for encontrado na base de dados
     */
    @Operation(summary = "Obter utilizador por ID", description = "Retorna os detalhes de um utilizador específico. Requer role ADMIN ou OWNER.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilizador encontrado"),
            @ApiResponse(responseCode = "404", description = "Utilizador não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public User getUserById(
            @Parameter(description = "ID do utilizador a pesquisar", required = true)
            @PathVariable Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));
    }

    /**
     * Resolve um utilizador por email (lookup), retornando apenas campos mínimos.
     *
     * <p>Este endpoint existe para suportar fluxos de colaboração (ex.: adicionar MANAGER/STAFF
     * a uma propriedade) sem expor dados sensíveis desnecessários.</p>
     *
     * <p>Requer permissão de ADMIN ou OWNER para reduzir o risco de enumeração.</p>
     *
     * @param email email a pesquisar
     * @return id e email do utilizador encontrado
     */
    @Operation(summary = "Lookup de utilizador por email", description = "Resolve um utilizador por email e devolve um payload mínimo (id+email). Requer role ADMIN ou OWNER.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilizador encontrado"),
            @ApiResponse(responseCode = "400", description = "Email inválido"),
            @ApiResponse(responseCode = "404", description = "Utilizador não encontrado"),
            @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @GetMapping("/lookup")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<com.nexus.estates.common.dto.ApiResponse<LookupResponse>> lookupByEmail(
            @RequestParam("email") String email
    ) {
        if (email == null || email.isBlank() || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body(com.nexus.estates.common.dto.ApiResponse.error("Email inválido.", "BAD_REQUEST"));
        }
        return userRepository.findByEmail(email.trim())
                .map(u -> ResponseEntity.ok(com.nexus.estates.common.dto.ApiResponse.success(new LookupResponse(u.getId(), u.getEmail()), "Utilizador encontrado.")))
                .orElseGet(() -> ResponseEntity.status(404).body(com.nexus.estates.common.dto.ApiResponse.error("Utilizador não encontrado.", "NOT_FOUND")));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.nexus.estates.common.dto.ApiResponse<MeResponse>> me(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Email", required = false) String userEmailHeader
    ) {
        User current = getCurrentUser(userIdHeader, userEmailHeader);
        MeResponse dto = new MeResponse(
                current.getId(),
                current.getEmail(),
                current.getPhone(),
                current.getRole() != null ? current.getRole().name() : null,
                current.getClerkUserId()
        );
        return ResponseEntity.ok(com.nexus.estates.common.dto.ApiResponse.success(dto, "Perfil carregado."));
    }

    /**
     * Atualiza parcialmente os dados do utilizador autenticado.
     *
     * <p>Suporta atualização de email e/ou telemóvel sem necessidade de reenviar o perfil completo.</p>
     *
     * <p><b>Nota de Segurança:</b> se o email for alterado, é gerado um novo JWT para evitar inconsistências
     * entre o subject do token e o novo email do utilizador.</p>
     */
    @Operation(summary = "Atualizar perfil do utilizador autenticado", description = "Atualiza parcialmente email/telemóvel do utilizador autenticado. Pode devolver novo token.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "401", description = "Não autenticado"),
            @ApiResponse(responseCode = "409", description = "Email já em uso")
    })
    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.nexus.estates.common.dto.ApiResponse<MeUpdateResponse>> patchMe(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Email", required = false) String userEmailHeader,
            @Valid @RequestBody MePatchRequest request
    ) {
        User current = getCurrentUser(userIdHeader, userEmailHeader);

        String normalizedEmail = request.email() != null ? request.email().trim().toLowerCase() : null;
        if (normalizedEmail != null && !normalizedEmail.isBlank() && !normalizedEmail.equalsIgnoreCase(current.getEmail())) {
            if (userRepository.findByEmail(normalizedEmail).isPresent()) {
                throw new EmailAlreadyRegisteredException("O email '" + normalizedEmail + "' já se encontra registado.");
            }
            current.setEmail(normalizedEmail);
        }

        if (request.phone() != null) {
            current.setPhone(request.phone().trim());
        }

        current = userRepository.save(current);
        String token = jwtService.generateToken(current);

        MeUpdateResponse dto = new MeUpdateResponse(
                current.getId(),
                current.getEmail(),
                current.getPhone(),
                current.getRole() != null ? current.getRole().name() : null,
                current.getClerkUserId(),
                token
        );

        return ResponseEntity.ok(com.nexus.estates.common.dto.ApiResponse.success(dto, "Perfil atualizado."));
    }

    /**
     * Altera a palavra-passe do utilizador autenticado, validando a password atual.
     *
     * <p>Este endpoint complementa o fluxo de recuperação (forgot/reset) com um fluxo autenticado.</p>
     */
    @Operation(summary = "Alterar password (autenticado)", description = "Altera a password validando a password atual e aplicando regras mínimas de segurança.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Password alterada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "401", description = "Password atual incorreta / não autenticado")
    })
    @PostMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<com.nexus.estates.common.dto.ApiResponse<AuthResponse>> changePassword(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestHeader(value = "X-User-Email", required = false) String userEmailHeader,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        User current = getCurrentUser(userIdHeader, userEmailHeader);

        if (!passwordEncoder.matches(request.currentPassword(), current.getPassword())) {
            throw new InvalidCredentialsException("A password atual fornecida está incorreta.");
        }
        validatePasswordStrength(request.newPassword());

        current.setPassword(passwordEncoder.encode(request.newPassword()));
        current = userRepository.save(current);

        String token = jwtService.generateToken(current);
        AuthResponse session = AuthResponse.builder()
                .token(token)
                .id(current.getId())
                .email(current.getEmail())
                .role(current.getRole() != null ? current.getRole().name() : null)
                .build();

        return ResponseEntity.ok(com.nexus.estates.common.dto.ApiResponse.success(session, "Password atualizada."));
    }

    public record MeResponse(Long id, String email, String phone, String role, String clerkUserId) {}
    public record LookupResponse(Long id, String email) {}
    public record MeUpdateResponse(Long id, String email, String phone, String role, String clerkUserId, String token) {}

    public record MePatchRequest(
            @Email(message = "Email inválido.")
            String email,
            @Pattern(regexp = "^[+0-9][0-9\\s-]{6,20}$", message = "Telemóvel inválido.")
            String phone
    ) {}

    public record ChangePasswordRequest(
            @Size(min = 1, message = "A password atual é obrigatória.")
            String currentPassword,
            @Size(min = 8, message = "A nova password deve ter no mínimo 8 caracteres.")
            String newPassword
    ) {}

    private void validatePasswordStrength(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("A nova password é obrigatória.");
        }
        if (password.length() < 8) {
            throw new IllegalArgumentException("A nova password deve ter no mínimo 8 caracteres.");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("A nova password deve conter pelo menos um número.");
        }
        if (!password.matches(".*[!@#$%^&*()_\\-+=\\[\\]{};:'\\\",.<>/?\\\\|`~].*")) {
            throw new IllegalArgumentException("A nova password deve conter pelo menos um símbolo.");
        }
    }

    private User getCurrentUser(String userIdHeader, String userEmailHeader) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth != null ? auth.getPrincipal() : null;
        if (principal instanceof User user) {
            return userRepository.findById(user.getId()).orElseThrow(() -> new IllegalStateException("Utilizador não autenticado."));
        }

        Optional<User> fromHeader = Optional.empty();
        if (userIdHeader != null && !userIdHeader.isBlank()) {
            try {
                Long id = Long.parseLong(userIdHeader);
                fromHeader = userRepository.findById(id);
            } catch (Exception ignored) {
            }
        }
        if (fromHeader.isEmpty() && userEmailHeader != null && !userEmailHeader.isBlank()) {
            fromHeader = userRepository.findByEmail(userEmailHeader);
        }

        return fromHeader.orElseThrow(() -> new IllegalStateException("Utilizador não autenticado."));
    }
}

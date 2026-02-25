package com.nexus.estates.controller;

import com.nexus.estates.entity.User;
import com.nexus.estates.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

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

    /**
     * Recupera a lista completa de utilizadores registados no sistema.
     * <p>
     *     Útil para painéis de administração.
     * </p>
     * @return {@link List} contendo todos os objetos {@link User} persistidos.
     */
    @Operation(summary = "Listar todos os utilizadores", description = "Retorna uma lista de todos os utilizadores registados.")
    @ApiResponse(responseCode = "200", description = "Lista recuperada com sucesso")
    @GetMapping
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    /**
     * Regista um novo utilizador no sistema (Método Administrativo/Interno).
     * <p>
     *     Recebe os dados brutos, incluindo a password.
     *     <b>Atenção:</b> Para registo público seguro, usar {@code AuthController}.
     * </p>
     * @param user O objeto {@link User} construído a partir do JSON recebido.
     * @return O objeto {@link User} persistido, incluindo o ID gerado.
     */
    @Operation(summary = "Criar utilizador (Admin)", description = "Cria um utilizador diretamente na base de dados.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilizador criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PostMapping
    public User createUser(@RequestBody User user){
        // SEGURANÇA: Codificar a password antes de guardar
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    /**
     * Recupera os detalhes de um utilizador específico pelo seu identificador.
     * @param id Identificador único do utilizador (Long).
     * @return O objeto {@link User} correspondente.
     * @throws RuntimeException se o utilizador não for encontrado na base de dados
     */
    @Operation(summary = "Obter utilizador por ID", description = "Retorna os detalhes de um utilizador específico.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilizador encontrado"),
            @ApiResponse(responseCode = "404", description = "Utilizador não encontrado")
    })
    @GetMapping("/{id}")
    public User getUserById(
            @Parameter(description = "ID do utilizador a pesquisar", required = true)
            @PathVariable Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));
    }
}

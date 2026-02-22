package com.nexus.estates.controller;

import com.nexus.estates.entity.User;
import com.nexus.estates.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;

/**
 * Controlador REST responsável pela gestão de Utilizadores.
 * <p>
 *     Este componente expõe endpoints para a criação e consulta de perfis de utilizador.
 *     Atua como ponto de entrada para aoperações administrativas e de auto-gestão de conta.
 * </p>
 *
 * <p>
 *     <b>
 *         Nota:
 *     </b>
 * </p>
 * <p>
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
public class UserController
{
    /**
     * Injeção de dependência do repositório para acesso a dados.
     * <p>
     *     Permite a comunicação direta com a base de dados Postgres.
     * </p>
     */

    @Autowired
    private UserRepository userRepository;

    /**
     * Recupera a lista completa de utilizadores registados no sistema.
     * <p>
     *     Útil para painéis de administração
     * </p>
     * @return {@link List} contendo todos os objetos {@link User} persistidos.
     */

    @GetMapping
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    /**
     * Regista um novo utilizador no sistema.
     * <p>
     *     Recebe os dados brutos, incluido a password.
     * </p>
     * @param user O objeto {@link User} construído a partir do JSON recebido.
     * @return O objeto {@link User} persistio, incluindo o ID gerado.
     */

    @PostMapping
    public User createUser(@RequestBody User user){
        return userRepository.save(user);
    }

    /**
     * Recupera os detalhes de um utilizador específico pelo seu identificador.
     * @param id Identificador único do utilizador (UUID).
     * @return O objeto {@link User} correspondente.
     * @thorws RuntimeException se o utilizador não for encontrado na base de dados
     */

    @GetMapping("/{id}")
    public User getUserById(@PathVariable UUID id){
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));
    }

}

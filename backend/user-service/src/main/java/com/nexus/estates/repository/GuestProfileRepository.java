package com.nexus.estates.repository;

import com.nexus.estates.entity.GuestProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


/**
 * Repsitório Spring Data JPA para a entidade {@link GuestProfile}
 * <p>
 *     Fornece os métodos de acesso a dados para consultar e persistir os perfis detalhados dos hóspedes,
 *     incluindo as suas notas internas de gestão e etiquetas de categorização (tags)
 * </p>
 *
 * @auhtor Nexus Estates Team
 * @version 1.0
 */
@Repository
public interface GuestProfileRepository extends JpaRepository<GuestProfile, Long> {

    /**
     * Recupera o perfil de hóspede associado a uma conta de utilziador específica
     * <p>
     *     A relação entre User e GuestProfile é de 1-para-1
     * </p>
     * @param userId O identificador único da conta do utilizador base (User ID)
     * @return Um {@link Optional} contendo o perfil do hóspede, ou vazio caso o utilizador ainda não possua um perfil criado
     */
    Optional<GuestProfile> findByUserId(Long userId);
}


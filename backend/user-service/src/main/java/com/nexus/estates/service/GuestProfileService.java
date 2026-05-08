package com.nexus.estates.service;

import com.nexus.estates.dto.GuestProfileRequest;
import com.nexus.estates.dto.GuestProfileResponse;
import com.nexus.estates.entity.GuestProfile;
import com.nexus.estates.entity.User;
import com.nexus.estates.exception.UserNotFoundException;
import com.nexus.estates.repository.GuestProfileRepository;
import com.nexus.estates.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * Serviço responsável pela gestão das regras de negócio associadas aos Perfis de Hóspedes
 * <p>
 *     Atua como intermediário entre a camada de controlo (API) e a camada de acesso a dados (Repositórios),
 *     garantindo a integridade transacional das operações
 *     Este serviço implementa também a lógica de criação sob demanda (Lazy Creation), criando automaticamente
 *     um perfil para o utilizador caso este ainda não exista no momento da primeira atualização
 *
 * @auhtor Nexus Estates Team
 * @version 1.0
 * </p>
 */
@Service
@RequiredArgsConstructor
public class GuestProfileService {

    /**
     * Repositório dedicado ás operações CRUD exclusivas da entidade de perfil de hóspede
     */
    private final GuestProfileRepository guestProfileRepository;

    /**
     * Repositório de uitlizadores, necessário para verificar a existência e associar a conta base na criação de um novo perfil
     */
    private final UserRepository userRepository;


    /**
     * Recupera o perfil detalhado de um hóspede utilizando o identificador da conta
     * <p>
     *     A operação decorre num contexto de transação apenas de leitura para otimizar o acesso á base de dados
     * </p>
     * @param userId O identificador único do utilizador (conta principal)
     * @return O DTO contendo as notas internas e etiquetas associadas ao hóspedes
     * @throws UserNotFoundException Se o utilziador não tiver nenhum perfil associado
     */
    @Transactional(readOnly = true)
    public GuestProfileResponse getProfileByUserId(Long userId) {
        GuestProfile profile = guestProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("Guest profile not found for user ID: " + userId));

        return mapToResponse(profile);
    }


    /**
     * Realiza a atualização compelta (substituição total) do perfil do hóspede
     * <p>
     *     Se o perfil ainda não existir para o utilizador especificado, este método cria um novo de forma transparaente,
     *     associando-o á conta do utilizador antes de aplicar as atualizações
     * </p>
     * @param userId O identificador da conta do utilizador
     * @param request O DTO com os novos dados que irão substituir o estado atual das notas e tags
     * @return O perfil do hóspede atualizado e convertido no DTO de resposta
     * @throws UserNotFoundException Caso o ID fornecido não corresponda a um utilizador válido na base de dados
     */
    @Transactional
    public GuestProfileResponse updateGuestProfile(Long userId, GuestProfileRequest request) {
        GuestProfile profile = guestProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

                    return GuestProfile.builder().user(user).build();
                });

        profile.setInternalNotes(request.getInternalNotes());
        profile.setTags(request.getTags());

        GuestProfile savedProfile = guestProfileRepository.save(profile);

        return mapToResponse(savedProfile);
    }


    /**
     * Aplica uma atualização parcial aos campos específicos do perfil do hóspede
     * <p>
     *     Á semelhança do PUT, suporta a criação sob demanda do perfil caso não exista
     *     Valores {@code null} recebidos no pedido serão ignorados, mantendo o estado anterior do respetivo campo
     * </p>
     * @param userId O identificador da conta do utilizador
     * @param request O DTO contendo apenas os campos que devem sofrer alterações
     * @return O perfil do hóspede após a fusão dos  novos dados
     * @throws UserNotFoundException Caso o ID não corresponda a nenhum utilizador válido
     */
    @Transactional
    public GuestProfileResponse patchGuestProfile(Long userId, GuestProfileRequest request) {
        GuestProfile profile = guestProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

                    return GuestProfile.builder().user(user).build();
                });

        if (request.getInternalNotes() != null) {
            profile.setInternalNotes(request.getInternalNotes());
        }
        if (request.getTags() != null) {
            profile.setTags(request.getTags());
        }

        GuestProfile savedProfile = guestProfileRepository.save(profile);

        return mapToResponse(savedProfile);
    }


    /**
     * Método auxiliar interno para converter a entidade de base de dados num DTO
     * @param profile A entidae {@link GuestProfile} após extração ou persistência na base de dados
     * @return {@link GuestProfileResponse} seguro para envio á camada de apresentação/cliente
     */
    private GuestProfileResponse mapToResponse(GuestProfile profile) {
        return GuestProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .userEmail(profile.getUser().getEmail())
                .internalNotes(profile.getInternalNotes())
                .tags(profile.getTags())
                .build();
    }
}

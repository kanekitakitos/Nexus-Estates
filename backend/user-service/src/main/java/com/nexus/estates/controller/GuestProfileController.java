package com.nexus.estates.controller;

import com.nexus.estates.dto.GuestProfileRequest;
import com.nexus.estates.dto.GuestProfileResponse;
import com.nexus.estates.service.GuestProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


/**
 * Controlador REST para gestão de perfis de hóspedes (Guest Profiles)
 * <p>
 *     Permite que gestores e administradores consultem e editem informações detalhadas
 *     sobre os hóspedes, tais como notas internas e etiquetas (tags), auxiliando na personalização do atendimento
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/users/{userId}/profile")
@RequiredArgsConstructor
public class GuestProfileController {

    private final GuestProfileService guestProfileService;

    // Apenas Gestores e Admins podem ler as notas do perfil

    /**
     * Recupera o perfil detalhado de um hóspede
     * @param userId O ID do utilizador corresponde ao hóspede
     * @return O perfil do hóspede com notas e tags
     */
    @GetMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<GuestProfileResponse> getGuestProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(guestProfileService.getProfileByUserId(userId));
    }

    // Apenas Gestores e Admins podem editar as notas e as tags (substituição total)

    /**
     * Atualiza integralmente o perfil de um hóspede (Substituição Total)
     * <p>
     *     Este endpoint é utilizado quando se pretende substituir todas as notas e tags atuais do hóspede
     *     pelas novas informações enviadas no request
     *     Apenas uitlizadores com privilégios de Gestão (Manager/Admin) têm acesso
     * </p>
     * @param userId O identificador único do utilizador/hóspede a atualizar
     * @param request DTO contendo o novo estado completo das notas e etiquetas do hóspede
     * @return Uma resposta encapsulando o perfil atualizado do hóspede
     */
    @PutMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<GuestProfileResponse> updateGuestProfile(
            @PathVariable Long userId,
            @RequestBody GuestProfileRequest request) {
        return ResponseEntity.ok(guestProfileService.updateGuestProfile(userId, request));
    }

    // Apenas Gestores e Admins podem editar campos específicos (atualização parcial)
    /**
     * Atualiza parcialmente campos específicos do perfil de um hóspede
     * <p>
     *     Ao contrário do PUT, este endpoint permite alterar apenas certos atributos (como adicionar uma nova nota)
     *     sem necessidade de enviar todo o perfil atual
     *     Accesso reservado a equipas de Gestão e Administração
     * </p>
     * @param userId O identificador único do utilizador/hóspede
     * @param request DTO contendo apenas os campos que se pretendem alterar
     * @return Uma resposta encapsulando o perfil do hóspede após as alterações parciais
     */
    @PatchMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<GuestProfileResponse> patchGuestProfile(
            @PathVariable Long userId,
            @RequestBody GuestProfileRequest request) {
        return ResponseEntity.ok(guestProfileService.patchGuestProfile(userId, request));
    }
}

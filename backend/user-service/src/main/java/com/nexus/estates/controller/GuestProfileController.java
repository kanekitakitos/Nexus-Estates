package com.nexus.estates.controller;

import com.nexus.estates.dto.GuestProfileRequest;
import com.nexus.estates.dto.GuestProfileResponse;
import com.nexus.estates.service.GuestProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{userId}/profile")
@RequiredArgsConstructor
public class GuestProfileController {

    private final GuestProfileService guestProfileService;

    // Apenas Gestores e Admins podem ler as notas do perfil
    @GetMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<GuestProfileResponse> getGuestProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(guestProfileService.getProfileByUserId(userId));
    }

    // Apenas Gestores e Admins podem editar as notas e as tags (substituição total)
    @PutMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<GuestProfileResponse> updateGuestProfile(
            @PathVariable Long userId,
            @RequestBody GuestProfileRequest request) {
        return ResponseEntity.ok(guestProfileService.updateGuestProfile(userId, request));
    }

    // Apenas Gestores e Admins podem editar campos específicos (atualização parcial)
    @PatchMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<GuestProfileResponse> patchGuestProfile(
            @PathVariable Long userId,
            @RequestBody GuestProfileRequest request) {
        return ResponseEntity.ok(guestProfileService.patchGuestProfile(userId, request));
    }
}

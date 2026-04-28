package com.nexus.estates.service;

import com.nexus.estates.dto.GuestProfileRequest;
import com.nexus.estates.dto.GuestProfileResponse;
import com.nexus.estates.entity.GuestProfile;
import com.nexus.estates.entity.User;
import com.nexus.estates.exception.UserNotFoundException;
import com.nexus.estates.repository.GuestProfileRepository;
import com.nexus.estates.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Suite de testes unitários para o serviço {@link GuestProfileService}.
 * <p>
 * Valida a recuperação, atualização completa e atualização parcial (patch)
 * de perfis de hóspedes, incluindo o tratamento de exceções.
 * </p>
 *
 * @author Nexus Estates Team
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Testes de Unidade: Guest Profile Service")
class GuestProfileServiceTest {

    @Mock
    private GuestProfileRepository guestProfileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GuestProfileService guestProfileService;

    private User user;
    private GuestProfile guestProfile;
    private GuestProfileRequest request;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("guest@example.com")
                .build();

        guestProfile = GuestProfile.builder()
                .id(100L)
                .user(user)
                .internalNotes("Notas iniciais")
                .tags(List.of("VIP", "Frequent"))
                .build();

        request = new GuestProfileRequest();
        request.setInternalNotes("Notas atualizadas");
        request.setTags(List.of("VIP", "Premium"));
    }

    @Test
    @DisplayName("Deve retornar GuestProfileResponse quando o perfil existe")
    void getProfileByUserId_ShouldReturnProfile_WhenExists() {
        when(guestProfileRepository.findByUserId(1L)).thenReturn(Optional.of(guestProfile));

        GuestProfileResponse response = guestProfileService.getProfileByUserId(1L);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(1L, response.getUserId());
        assertEquals("guest@example.com", response.getUserEmail());
        assertEquals("Notas iniciais", response.getInternalNotes());
        assertTrue(response.getTags().contains("VIP"));
    }

    @Test
    @DisplayName("Deve lançar UserNotFoundException ao tentar obter um perfil inexistente")
    void getProfileByUserId_ShouldThrowException_WhenProfileNotFound() {
        when(guestProfileRepository.findByUserId(99L)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> guestProfileService.getProfileByUserId(99L));
    }

    @Test
    @DisplayName("Deve atualizar e retornar um perfil existente (PUT)")
    void updateGuestProfile_ShouldUpdateExistingProfile() {
        when(guestProfileRepository.findByUserId(1L)).thenReturn(Optional.of(guestProfile));
        when(guestProfileRepository.save(any(GuestProfile.class))).thenReturn(guestProfile);

        GuestProfileResponse response = guestProfileService.updateGuestProfile(1L, request);

        verify(guestProfileRepository).save(guestProfile);
        assertEquals("Notas atualizadas", response.getInternalNotes());
        assertEquals(2, response.getTags().size());
        assertTrue(response.getTags().contains("Premium"));
    }

    @Test
    @DisplayName("Deve criar um novo perfil caso não exista no PUT (Upsert)")
    void updateGuestProfile_ShouldCreateProfile_WhenNotExists() {
        when(guestProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        GuestProfile newProfile = GuestProfile.builder()
                .user(user)
                .internalNotes(request.getInternalNotes())
                .tags(request.getTags())
                .build();

        when(guestProfileRepository.save(any(GuestProfile.class))).thenReturn(newProfile);

        GuestProfileResponse response = guestProfileService.updateGuestProfile(1L, request);

        verify(guestProfileRepository).save(any(GuestProfile.class));
        assertEquals("Notas atualizadas", response.getInternalNotes());
    }

    @Test
    @DisplayName("Deve fazer Patch Parcial do perfil (Apenas notas)")
    void patchGuestProfile_ShouldUpdateOnlyNotes() {
        GuestProfileRequest patchRequest = new GuestProfileRequest();
        patchRequest.setInternalNotes("Apenas alterar notas");
        // Deixamos a lista de tags nula intencionalmente

        when(guestProfileRepository.findByUserId(1L)).thenReturn(Optional.of(guestProfile));
        when(guestProfileRepository.save(any(GuestProfile.class))).thenReturn(guestProfile);

        GuestProfileResponse response = guestProfileService.patchGuestProfile(1L, patchRequest);

        verify(guestProfileRepository).save(guestProfile);
        assertEquals("Apenas alterar notas", response.getInternalNotes());
        // Garante que as tags originais não foram apagadas/substituídas
        assertEquals(2, response.getTags().size());
    }
}
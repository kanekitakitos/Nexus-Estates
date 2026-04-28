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

@Service
@RequiredArgsConstructor
public class GuestProfileService {

    private final GuestProfileRepository guestProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public GuestProfileResponse getProfileByUserId(Long userId) {
        GuestProfile profile = guestProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new UserNotFoundException("Guest profile not found for user ID: " + userId));

        return mapToResponse(profile);
    }

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

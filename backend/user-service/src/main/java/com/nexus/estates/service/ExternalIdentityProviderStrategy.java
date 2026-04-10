package com.nexus.estates.service;

import com.nexus.estates.entity.User;
import com.nexus.estates.repository.UserRepository;

import java.util.Optional;

public interface ExternalIdentityProviderStrategy {
    String key();

    ExternalIdentity verify(String token);

    Optional<User> findExistingUser(UserRepository userRepository, ExternalIdentity identity);

    void applyIdentity(User user, ExternalIdentity identity);

    record ExternalIdentity(String providerUserId, String email, String name) {}
}

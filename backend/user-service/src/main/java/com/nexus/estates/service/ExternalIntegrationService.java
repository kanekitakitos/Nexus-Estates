package com.nexus.estates.service;

import com.nexus.estates.dto.CreateExternalIntegrationRequest;
import com.nexus.estates.dto.ExternalIntegrationDTO;
import com.nexus.estates.entity.ExternalIntegration;
import com.nexus.estates.repository.ExternalIntegrationRepository;
import com.nexus.estates.entity.User;
import com.nexus.estates.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
/**
 * Serviço de domínio para gestão de integrações externas de utilizadores.
 * <p>
 * Responsável por criar, listar (com mascaramento) e remover integrações,
 * garantindo segurança em repouso via encriptação transparente da API Key.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 */
public class ExternalIntegrationService {

    private final ExternalIntegrationRepository integrationRepository;
    private final UserRepository userRepository;

    /**
     * Cria uma integração externa para o utilizador autenticado.
     * <p>
     * Aplica encriptação transparente da API Key via {@link com.nexus.estates.config.EncryptedStringAttributeConverter}.
     * </p>
     *
     * @param req dados de criação
     * @return DTO com apiKey mascarada
     * @author Nexus Estates Team
     * @version 1.0
     */
    @Transactional
    public ExternalIntegrationDTO createIntegration(CreateExternalIntegrationRequest req) {
        User currentUser = getCurrentUser();

        ExternalIntegration entity = ExternalIntegration.builder()
                .user(currentUser)
                .providerName(req.getProviderName())
                .apiKey(req.getApiKey())
                .active(req.isActive())
                .build();

        ExternalIntegration saved = integrationRepository.save(entity);
        return toDto(saved);
    }

    /**
     * Lista integrações do utilizador atual com mascaramento de chave.
     *
     * @return lista de DTOs
     */
    @Transactional(readOnly = true)
    public List<ExternalIntegrationDTO> listIntegrationsForCurrentUser() {
        User currentUser = getCurrentUser();
        return integrationRepository.findByUserId(currentUser.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Remove uma integração pertencente ao utilizador atual.
     *
     * @param id identificador da integração
     */
    @Transactional
    public void deleteIntegration(Long id) {
        User currentUser = getCurrentUser();
        integrationRepository.findByIdAndUserId(id, currentUser.getId())
                .ifPresent(integrationRepository::delete);
    }

    /**
     * Obtém o utilizador autenticado a partir do SecurityContext.
     *
     * @return entidade User persistida
     */
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth != null ? auth.getPrincipal() : null;
        if (principal instanceof User user) {
            return userRepository.findById(user.getId()).orElseThrow();
        }
        throw new IllegalStateException("Utilizador não autenticado.");
    }

    /**
     * Converte entidade em DTO aplicando mascaramento de chave.
     */
    private ExternalIntegrationDTO toDto(ExternalIntegration e) {
        return ExternalIntegrationDTO.builder()
                .id(e.getId())
                .providerName(e.getProviderName())
                .apiKeyMasked(mask(e.getApiKey()))
                .active(e.isActive())
                .build();
    }

    /**
     * Mascaramento: preserva até 8 caracteres iniciais e 4 finais, inserindo '****' no meio.
     */
    private String mask(String raw) {
        if (raw == null || raw.isBlank()) return "****";
        int len = raw.length();
        int prefix = Math.min(8, len);
        int suffix = Math.min(4, len - prefix);
        String start = raw.substring(0, prefix);
        String end = suffix > 0 ? raw.substring(len - suffix) : "";
        return start + "****" + end;
    }
}

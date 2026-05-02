package com.nexus.estates.service.chat;

import com.nexus.estates.client.Proxy;
import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.entity.PropertyInquiry;
import com.nexus.estates.repository.PropertyInquiryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Serviço de domínio responsável por gerir conversas do tipo PROPERTY_INQUIRY.
 *
 * <p>Responsabilidades:</p>
 * <ul>
 *   <li>Garantir unicidade de conversa por (propertyId, guestId).</li>
 *   <li>Aplicar regras de autorização para “shared inbox” da propriedade.</li>
 *   <li>Listar conversas do hóspede.</li>
 * </ul>
 *
 * <p>Nota de segurança:</p>
 * <ul>
 *   <li>O frontend nunca faz lookup de emails nem conhece emails de proprietários.</li>
 *   <li>O sync-service valida permissões via property-service internamente.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class PropertyInquiryService {

    private final PropertyInquiryRepository repository;
    private final Proxy proxy;

    @Transactional
    public PropertyInquiry createOrGet(Long propertyId, Long guestId) {
        var existing = repository.findByPropertyIdAndGuestId(propertyId, guestId);
        if (existing.isPresent()) {
            return existing.get();
        }

        ApiResponse<Long> ownerResp = proxy.propertyClient().getPrimaryOwnerId(propertyId);
        if (ownerResp == null || !ownerResp.isSuccess() || ownerResp.getData() == null) {
            throw new IllegalArgumentException("Property not found or without owner: " + propertyId);
        }

        PropertyInquiry inquiry = PropertyInquiry.builder()
                .propertyId(propertyId)
                .guestId(guestId)
                .build();
        return repository.save(inquiry);
    }

    @Transactional(readOnly = true)
    public Optional<PropertyInquiry> findExisting(Long propertyId, Long guestId) {
        return repository.findByPropertyIdAndGuestId(propertyId, guestId);
    }

    @Transactional(readOnly = true)
    public PropertyInquiry getById(Long inquiryId) {
        return repository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("Inquiry not found: " + inquiryId));
    }

    @Transactional(readOnly = true)
    public boolean canAccess(Long inquiryId, Long userId) {
        PropertyInquiry inquiry = getById(inquiryId);
        if (inquiry.getGuestId().equals(userId)) return true;

        try {
            ApiResponse<String> resp = proxy.propertyClient().getAccessLevel(inquiry.getPropertyId(), userId);
            if (resp == null || !resp.isSuccess() || resp.getData() == null) return false;
            String level = resp.getData();
            return "PRIMARY_OWNER".equals(level) || "MANAGER".equals(level) || "STAFF".equals(level);
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional(readOnly = true)
    public List<PropertyInquiry> listForGuest(Long guestId) {
        return repository.findByGuestIdOrderByCreatedAtDesc(guestId);
    }
}

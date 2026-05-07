package com.nexus.estates.repository;

import com.nexus.estates.entity.PropertyInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório para {@link PropertyInquiry}.
 *
 * <p>Expõe consultas orientadas ao fluxo de UI:</p>
 * <ul>
 *   <li>Resolver (ou criar) uma thread única por property + guest.</li>
 *   <li>Listar conversas iniciadas pelo hóspede (inbox do guest).</li>
 * </ul>
 */
@Repository
public interface PropertyInquiryRepository extends JpaRepository<PropertyInquiry, Long> {
    Optional<PropertyInquiry> findByPropertyIdAndGuestId(Long propertyId, Long guestId);

    List<PropertyInquiry> findByGuestIdOrderByCreatedAtDesc(Long guestId);
}

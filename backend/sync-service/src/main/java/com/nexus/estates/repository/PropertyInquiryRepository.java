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
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Repository
public interface PropertyInquiryRepository extends JpaRepository<PropertyInquiry, Long> {

    /**
     * Recupera o contexto de uma conversa (inquérito) específica cruzando o identificador da propriedade e o identificador do hóspede
     * @param propertyId O identificador único da propriedade associada à dúvida/inquérito
     * @param guestId O identificador único do hóspede que iniciou ou pretende iniciar o contacto
     * @return Um {@link Optional} contendo o inquérito correspondente, ou vazio caso seja o primeiro contacto
     */
    Optional<PropertyInquiry> findByPropertyIdAndGuestId(Long propertyId, Long guestId);


    /**
     * Recupera a lista completa de conversas iniciadas por um hóspede específico, ordenadas cronologicamente da mais recente para a mais antiga
     * @param guestId O identificador único do hóspede
     * @return Uma lista de entidades {@link PropertyInquiry} ordenadas de forma decrescente pela data de criação
     */
    List<PropertyInquiry> findByGuestIdOrderByCreatedAtDesc(Long guestId);
}

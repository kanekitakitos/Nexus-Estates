package com.nexus.estates.repository;

import com.nexus.estates.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositório JPA para documentos de faturação.
 * <p>
 *     Fornece operações de persistência e consulta para as faturas emitidas pelo sistema,
 *     estendendo as capacidades padrão do {@link JpaRepository}
 * </p>
 *
 * @auhtor Nexus Estates Team
 * @version 1.0
 */
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    /**
     * Procura uma fatura específica associada a um pagamento e a um provedor de faturação
     * <p>
     *     Útil para garantir a idempotência da emissão de faturas, verificando se já
     *     existe um documento gerado para o pagamento através do provedor atual
     * </p>
     * @param paymentId O identificador interno (ID) do pagamento associado
     * @param provider O nome do provedor de faturação (ex: "MOLONI", "MOCK")
     * @return Um {@link Optional} contendo a fatura, se encontrada, ou vazio caso contrário
     */
    Optional<Invoice> findByPayment_IdAndProvider(Long paymentId, String provider);
}

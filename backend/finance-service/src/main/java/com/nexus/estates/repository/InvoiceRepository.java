package com.nexus.estates.repository;

import com.nexus.estates.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositório JPA para documentos de faturação.
 */
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByPayment_IdAndProvider(Long paymentId, String provider);
}

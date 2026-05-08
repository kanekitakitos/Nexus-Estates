package com.nexus.estates.repository;

import com.nexus.estates.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositório JPA para pagamentos.
 * <p>
 *     Responsável por gerir a persistência das transações financeiras e o estado
 *     dos pagamentos processados pela plataforma
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Recupera um pagamento utilizando o seu identificador único no provedor externo
     * <p>
     *     Este método é crítico para o processamento de webhooks e callbacks assíncronos
     *     permitindo cruzar o ID da transação do Gateway (ex: Stripe PaymentIntent ID)
     *     com o registo interno na nossa base de dados
     * </p>
     *
     * @param paymentIntentId O identificador único da intenção de pagamento gerado pelo provedor
     * @return Um {@link Optional} contendo a entidade do pagamento correspondente, ou vazio se não existir
     */
    Optional<Payment> findByPaymentIntentId(String paymentIntentId);
}

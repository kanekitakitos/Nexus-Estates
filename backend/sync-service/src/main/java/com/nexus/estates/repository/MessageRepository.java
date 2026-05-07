package com.nexus.estates.repository;

import com.nexus.estates.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório JPA para a entidade {@link Message}.
 * <p>
 *     Fornece os métodos de acesso á base de dados para persistir e recuperar o
 *     histórico permanente de mensagens de chat entre utilizadores do sistema
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Busca todas as mensagens associadas a uma reserva específica, ordenadas cronologicamente.
     *
     * @param bookingId O ID da reserva.
     * @return Uma lista de mensagens ordenadas por data de criação (mais antigas primeiro).
     */
    List<Message> findByBookingIdOrderByCreatedAtAsc(Long bookingId);



}

package com.nexus.estates.repository;

import com.nexus.estates.entity.Message;
import com.nexus.estates.entity.MessageContextType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório JPA para a entidade {@link Message}.
 * <p>
 * Fornece métodos para persistir e recuperar o histórico de mensagens de chat.
 * </p>
 * Para interagir com a Tabela
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

    /**
     * Recupera o histórico de mensagens por contexto (thread), ordenado por createdAt ascendente.
     *
     * <p>Usado para:</p>
     * <ul>
     *   <li>BOOKING: chat por reserva</li>
     *   <li>PROPERTY_INQUIRY: chat por inquiry/propriedade</li>
     * </ul>
     */
    List<Message> findByContextTypeAndContextIdOrderByCreatedAtAsc(MessageContextType contextType, Long contextId);



}

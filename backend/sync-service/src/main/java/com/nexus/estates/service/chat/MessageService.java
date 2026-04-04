package com.nexus.estates.service.chat;

import com.nexus.estates.entity.Message;
import com.nexus.estates.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Serviço responsável pela persistência e consulta do histórico de mensagens de chat.
 * <p>
 * Mantém uma cópia local das mensagens trocadas em tempo real para auditoria e recuperação,
 * independente da retenção e disponibilidade do fornecedor externo.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-03-31
 * @see com.nexus.estates.entity.Message
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    /**
     * Persiste uma nova mensagem associada a uma reserva.
     *
     * @param bookingId id da reserva
     * @param senderId  id do remetente
     * @param content   conteúdo da mensagem
     * @return entidade persistida
     */
    @Transactional
    public Message saveMessage(Long bookingId, String senderId, String content) {
        log.debug("Salvando mensagem para Booking ID {}: {}", bookingId, content);
        Message message = Message.builder()
                .bookingId(bookingId)
                .senderId(senderId)
                .content(content)
                .build();
        return messageRepository.save(message);
    }

    /**
     * Obtém o histórico completo de mensagens para uma reserva.
     *
     * @param bookingId id da reserva
     * @return lista cronológica de mensagens
     */
    @Transactional(readOnly = true)
    public List<Message> getMessagesByBookingId(Long bookingId) {
        log.debug("Recuperando histórico de mensagens para Booking ID {}", bookingId);
        return messageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
    }
}

package com.nexus.estates.service;

import com.nexus.estates.entity.Message;
import com.nexus.estates.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Serviço responsável pela gestão do histórico de mensagens de chat.
 * <p>
 * Garante que todas as mensagens trocadas em tempo real sejam persistidas localmente
 * para auditoria e recuperação futura, independente da retenção do provedor externo.
 * </p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;

    /**
     * Salva uma nova mensagem no histórico local.
     *
     * @param bookingId O ID da reserva associada.
     * @param senderId  O ID do remetente.
     * @param content   O conteúdo da mensagem.
     * @return A entidade {@link Message} persistida.
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
     * Recupera o histórico completo de mensagens de uma reserva.
     *
     * @param bookingId O ID da reserva.
     * @return Uma lista de mensagens ordenadas cronologicamente.
     */
    @Transactional(readOnly = true)
    public List<Message> getMessagesByBookingId(Long bookingId) {
        log.debug("Recuperando histórico de mensagens para Booking ID {}", bookingId);
        return messageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
    }
}

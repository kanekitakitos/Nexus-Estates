package com.nexus.estates.service.chat;

import com.nexus.estates.client.NexusClients;
import com.nexus.estates.client.Proxy;
import com.nexus.estates.entity.Message;
import com.nexus.estates.repository.MessageRepository;
import com.nexus.estates.service.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Serviço de domínio responsável pela gestão do ciclo de vida das mensagens de chat.
 * <p>
 * Centraliza a lógica de persistência para histórico, orquestração de notificações
 * para participantes ausentes e integração com serviços de identidade via {@link Proxy}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 * @since 2026-03-31
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final Proxy proxy;
    private final EmailService emailService;

    /**
     * Persiste uma nova mensagem associada a uma reserva no histórico local.
     *
     * @param bookingId ID da reserva.
     * @param senderId  Identificador do remetente.
     * @param content   Conteúdo textual.
     * @return A entidade persistida.
     */
    @Transactional
    public Message saveMessage(Long bookingId, String senderId, String content) {
        log.debug("A persistir mensagem para Booking ID {}: {}", bookingId, content);
        Message message = Message.builder()
                .bookingId(bookingId)
                .senderId(senderId)
                .content(content)
                .build();
        return messageRepository.save(message);
    }

    /**
     * Recupera o histórico cronológico de mensagens de uma reserva.
     *
     * @param bookingId ID da reserva.
     * @return Lista de mensagens ordenadas.
     */
    @Transactional(readOnly = true)
    public List<Message> getMessagesByBookingId(Long bookingId) {
        return messageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);
    }

    /**
     * Orquestra o processamento de uma nova mensagem vinda de integração externa.
     * <p>
     * Este método garante a consistência atómica entre a persistência da mensagem
     * e o disparo de gatilhos secundários de notificação.
     * </p>
     *
     * @param bookingId ID da reserva.
     * @param senderId  ID do remetente da mensagem.
     * @param content   Conteúdo recebido.
     */
    public void handleNewIncomingMessage(Long bookingId, String senderId, String content) {
        saveMessage(bookingId, senderId, content);
        log.info("Mensagem externa integrada com sucesso para a reserva #{}", bookingId);

        // Notifica o participante que não é o remetente
        notifyRecipientIfOffline(bookingId, senderId, content);
    }

    /**
     * Identifica o destinatário de uma conversa e dispara notificação por e-mail,
     * respeitando as preferências de privacidade do utilizador.
     */
    private void notifyRecipientIfOffline(Long bookingId, String senderId, String content) {
        try {
            // Obtém participantes via Booking Service
            Set<Long> participants = proxy.bookingClient().getBookingParticipants(bookingId);

            Long receiverId = participants.stream()
                    .filter(id -> !id.toString().equals(senderId))
                    .findFirst()
                    .orElse(null);

            if (receiverId == null) return;

            // Valida preferências de notificação via User Service
            NexusClients.UserPreferencesDTO preferences = proxy.userClient().getUserPreferences(receiverId);

            if (preferences != null && preferences.emailNotificationsEnabled()) {
                String receiverEmail = proxy.userClient().getUserEmail(receiverId);
                sendEmailNotification(receiverEmail, content, bookingId);
            }
        } catch (Exception e) {
            log.error("Falha na orquestração de notificação para a reserva {}: {}", bookingId, e.getMessage());
        }
    }

    /**
     * Prepara e envia o e-mail transacional de nova mensagem.
     */
    private void sendEmailNotification(String email, String messageContent, Long bookingId) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("bookingId", bookingId);
        variables.put("messageContent", messageContent);

        emailService.sendEmailFromTemplate(
                email,
                "Nova mensagem na reserva #" + bookingId,
                "chat-notification",
                variables
        );
    }
}
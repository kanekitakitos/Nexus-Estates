package com.nexus.estates.client;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.service.annotation.GetExchange;

import java.util.Set;

/**
 * Definição centralizada das interfaces de comunicação HTTP com microsserviços externos.
 * <p>
 * Esta classe utiliza o recurso de <i>Declarative HTTP Clients</i> do Spring 6.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 */
public interface NexusClients {

    /**
     * Cliente para interagir com o User Service.
     */
    interface UserClient {

        /**
         * Obtém o e-mail de um utilizador específico.
         *
         * @param id Identificador único do utilizador.
         * @return O endereço de e-mail do utilizador.
         */
        @GetExchange("/api/users/{id}/email")
        String getUserEmail(@PathVariable("id") Long id);

        /**
         * Obtém as preferências de notificação de um usuário.
         *
         * @param id Identificador único do utilizador.
         * @return Um DTO com as preferências do usuário.
         */
        @GetExchange("/api/users/{id}/preferences")
        UserPreferencesDTO getUserPreferences(@PathVariable("id") Long id);
    }

    /**
     * Cliente para interagir com o Booking Service.
     */
    interface BookingClient {

        /**
         * Obtém os IDs dos participantes de uma reserva (ex: hóspede e proprietário).
         *
         * @param bookingId O ID da reserva.
         * @return Um conjunto de IDs dos participantes.
         */
        @GetExchange("/api/bookings/{bookingId}/participants")
        Set<Long> getBookingParticipants(@PathVariable("bookingId") Long bookingId);
    }

    /**
     * DTO para mapear as preferências do usuário.
     */
    record UserPreferencesDTO(
            boolean emailNotificationsEnabled
    ) {}
}

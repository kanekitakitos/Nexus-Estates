package com.nexus.estates.client;

import com.nexus.estates.common.dto.ApiResponse;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
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
         * @param userId ID do utilizador autenticado (propagado pelo gateway), usado para autorização no booking-service.
         * @return Um conjunto de IDs dos participantes.
         */
        @GetExchange("/api/bookings/{bookingId}/participants")
        Set<Long> getBookingParticipants(@PathVariable("bookingId") Long bookingId, @RequestHeader("X-User-Id") Long userId);
    }

    /**
     * Cliente para interagir com o Property Service.
     */
    interface PropertyClient {
        /**
         * Resolve o utilizador com permissões de PRIMARY_OWNER de uma propriedade.
         */
        @GetExchange("/api/properties/{propertyId}/primary-owner")
        ApiResponse<Long> getPrimaryOwnerId(@PathVariable("propertyId") Long propertyId);

        /**
         * Resolve o nível de acesso do utilizador à propriedade (PRIMARY_OWNER/MANAGER/STAFF).
         */
        @GetExchange("/api/properties/{propertyId}/access-level/{userId}")
        ApiResponse<String> getAccessLevel(@PathVariable("propertyId") Long propertyId, @PathVariable("userId") Long userId);
    }

    /**
     * DTO para mapear as preferências do usuário.
     */
    record UserPreferencesDTO(
            boolean emailNotificationsEnabled
    ) {}
}

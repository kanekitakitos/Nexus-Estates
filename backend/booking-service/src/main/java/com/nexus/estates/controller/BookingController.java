package com.nexus.estates.controller;

import com.nexus.estates.dto.BookingResponse;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

/**
 * Controlador REST responsável pela orquestração das operações de reserva.
 * <p>
 * Este componente atua como a camada de entrada para o domínio de reservas, expondo
 * uma API RESTful versionada. Garante a validação de entrada e delega a lógica
 * de negócio para o {@link BookingService}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.0
 * @since 2026-02-10
 */
@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    /**
     * Instancia o controlador com as dependências necessárias.
     *
     * @param bookingService Serviço de domínio para gestão de reservas.
     */
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Inicia o processo de criação de uma nova reserva.
     * <p>
     * Este endpoint é idempotente em caso de falha, mas não em caso de sucesso (cria novos recursos).
     * </p>
     *
     * @param request Objeto de transferência de dados (DTO) contendo os detalhes da reserva.
     * @return {@link ResponseEntity} contendo o {@link BookingResponse} criado.
     *
     * @apiNote O status inicial da reserva será sempre {@code PENDING_PAYMENT}.
     *
     * @throws org.springframework.web.bind.MethodArgumentNotValidException Se o payload for inválido (400).
     * @throws com.nexus.estates.exception.BookingConflictException Se houver sobreposição de datas (409).
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(request);

        // Retorna 201 Created em vez de 200 OK (Padrão REST)
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }



    /**
     * Recupera os detalhes de uma reserva específica pelo seu identificador.
     *
     * @param id Identificador único da reserva (UUID).
     * @return {@link ResponseEntity} contendo os detalhes da reserva encontrada.
     * @throws RuntimeException Se a reserva não for encontrada (404).
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    /**
     * Lista todas as reservas associadas a uma propriedade.
     * <p>
     * Utilizado para construção de calendários de disponibilidade e gestão de ocupação.
     * </p>
     *
     * @param propertyId Identificador único da propriedade.
     * @return Lista de {@link BookingResponse} contendo todas as reservas da propriedade.
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<BookingResponse>> getByProperty(@PathVariable UUID propertyId) {
        return ResponseEntity.ok(bookingService.getBookingsByProperty(propertyId));
    }

    /**
     * Recupera o histórico de reservas de um utilizador específico.
     *
     * @param userId Identificador único do utilizador.
     * @return Lista de {@link BookingResponse} com o histórico de reservas do utilizador.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }


}
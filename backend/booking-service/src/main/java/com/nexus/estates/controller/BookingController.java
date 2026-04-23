package com.nexus.estates.controller;

import com.nexus.estates.dto.BookingResponse;
import com.nexus.estates.dto.CreateBlockRequest;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST responsável pela orquestração das operações de reserva.
 * <p>
 * Este componente atua como a camada de entrada para o domínio de reservas, expondo
 * uma API RESTful. Garante a validação de entrada e delega a lógica
 * de negócio para o {@link BookingService}.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.2
 * @since 2026-02-10
 */
@RestController
@RequestMapping("/api/bookings")
@Tag(
        name = "Bookings",
        description = "Operações para criação e consulta de reservas de propriedades."
)
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
     * Este endpoint é idempotente em caso de falha, mas não em caso de sucesso (cria recursos).
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
    @Operation(
            summary = "Cria uma nova reserva",
            description = "Valida datas, verifica conflitos (CONFIRMED, BLOCKED, PENDING_PAYMENT) com Pessimistic Lock e cria uma reserva com estado inicial PENDING_PAYMENT."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Reserva criada com sucesso",
                    content = @Content(schema = @Schema(implementation = BookingResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos"),
            @ApiResponse(responseCode = "409", description = "Conflito de datas (double booking)"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request, @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        CreateBookingRequest effective = request;
        try {
            if (userIdHeader != null) {
                Long uid = Long.parseLong(userIdHeader);
                effective = new CreateBookingRequest(
                        request.propertyId(),
                        uid,
                        request.checkInDate(),
                        request.checkOutDate(),
                        request.guestCount(),
                        request.guestFullName(),
                        request.guestEmail(),
                        request.guestPhone(),
                        request.guestNationality(),
                        request.guestIssuingCountry(),
                        request.guestDocumentType(),
                        request.guestDocumentNumber(),
                        request.guestDocumentIssueDate()
                );
            }
        } catch (Exception ignored) {}
        BookingResponse response = bookingService.createBooking(effective);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Cria uma Reserva Técnica (bloqueio manual) para uma propriedade.
     *
     * <p>
     * Bloqueia um intervalo de datas sem envolver qualquer transação financeira.
     * Usado pelo proprietário para marcar períodos de indisponibilidade por motivos pessoais
     * (ex: uso próprio, obras, manutenção). O bloqueio impede novas reservas para as mesmas
     * datas da mesma forma que uma reserva {@code CONFIRMED}.
     * </p>
     *
     * <p>
     * A verificação de disponibilidade usa <b>Pessimistic Write Lock</b>
     * ({@code SELECT ... FOR UPDATE}), garantindo atomicidade ao milissegundo
     * e prevenção de double booking mesmo sob alta concorrência.
     * </p>
     *
     * @param request Payload com propertyId, datas e razão opcional do bloqueio.
     * @param actorUserIdHeader ID do proprietário que solicita o bloqueio,
     *                          propagado pelo API Gateway via header {@code X-User-Id}.
     * @return {@link ResponseEntity} contendo o {@link BookingResponse} com status {@code BLOCKED}.
     *
     * @throws org.springframework.web.bind.MethodArgumentNotValidException Se o payload for inválido (400).
     * @throws com.nexus.estates.exception.BookingConflictException Se as datas colidirem com
     *         reservas ou bloqueios existentes (409).
     */
    @Operation(
            summary = "Cria um bloqueio manual (Reserva Técnica)",
            description = """
                    Bloqueia um período de datas para uma propriedade sem transação financeira.
                    O estado resultante é BLOCKED, que impede novos agendamentos tal como CONFIRMED.
                    A verificação de disponibilidade usa Pessimistic Write Lock para garantir
                    atomicidade sob alta concorrência.
                    """
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Bloqueio criado com sucesso",
                    content = @Content(schema = @Schema(implementation = BookingResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Dados de entrada inválidos"),
            @ApiResponse(responseCode = "409", description = "Conflito de datas — já existe reserva ou bloqueio para este período"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @PostMapping("/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<BookingResponse> createBlock(
            @Valid @RequestBody CreateBlockRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String actorUserIdHeader
    ) {
        Long actorUserId = null;
        try {
            if (actorUserIdHeader != null) {
                actorUserId = Long.parseLong(actorUserIdHeader);
            }
        } catch (Exception ignored) {}

        BookingResponse response = bookingService.createBlock(request, actorUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Recupera os detalhes de uma reserva específica pelo seu identificador.
     *
     * @param id Identificador único da reserva (UUID).
     * @return {@link ResponseEntity} contendo os detalhes da reserva encontrada.
     * @throws RuntimeException Se a reserva não for encontrada (404).
     */
    @Operation(
            summary = "Obtém uma reserva pelo ID",
            description = "Retorna os detalhes completos de uma reserva existente."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Reserva encontrada",
                    content = @Content(schema = @Schema(implementation = BookingResponse.class))
            ),
            @ApiResponse(responseCode = "404", description = "Reserva não encontrada"),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBooking(@PathVariable Long id) {
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
    @Operation(
            summary = "Lista reservas por propriedade",
            description = "Retorna todas as reservas associadas a uma propriedade específica."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Reservas encontradas",
                    content = @Content(schema = @Schema(implementation = BookingResponse.class))
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<BookingResponse>> getByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(bookingService.getBookingsByProperty(propertyId));
    }

    /**
     * Recupera o histórico de reservas de um utilizador específico.
     *
     * @param userId Identificador único do utilizador.
     * @return Lista de {@link BookingResponse} com o histórico de reservas do utilizador.
     */
    @Operation(
            summary = "Lista reservas por utilizador",
            description = "Retorna o histórico de reservas associadas a um utilizador."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Reservas encontradas",
                    content = @Content(schema = @Schema(implementation = BookingResponse.class))
            ),
            @ApiResponse(responseCode = "500", description = "Erro interno do servidor")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByUser(userId));
    }

}

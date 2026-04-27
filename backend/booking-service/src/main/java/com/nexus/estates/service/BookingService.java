package com.nexus.estates.service;

import com.nexus.estates.common.dto.ApiResponse;
import com.nexus.estates.common.dto.PropertyQuoteRequest;
import com.nexus.estates.common.dto.PropertyQuoteResponse;
import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.dto.BookingResponse;
import com.nexus.estates.dto.CreateBlockRequest;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.exception.BookingConflictException;
import com.nexus.estates.exception.RuleViolationException;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.messaging.BookingEventPublisher;
import com.nexus.estates.repository.BookingRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import com.nexus.estates.client.Proxy;

import java.math.BigDecimal;
import java.util.List;

/**
 * Serviço de domínio responsável pela execução da lógica de negócio de Reservas.
 *
 * <p>Implementa o padrão <i>Transaction Script</i> para garantir a integridade e atomicidade
 * das operações de reserva. Este serviço orquestra validações de domínio, cálculos financeiros,
 * comunicação com serviços externos e persistência de dados.</p>
 *
 * @see BookingRepository
 * @author Nexus Estates Team
 * @version 1.1
 */
@Service
public class BookingService
{

    private final BookingRepository bookingRepository;
    private final BookingEventPublisher bookingEventPublisher;
    private final BookingPaymentService bookingPaymentService;

    private final Proxy api;

    /**
     * Construtor padrão para injeção de dependências.
     *
     * @param bookingRepository 'Interface' de acesso aos dados persistidos.
     * @param bookingEventPublisher Componente responsável pela publicação de eventos de reserva.
     * @param bookingPaymentService Serviço para processamento de pagamentos.
     * @param api Facade para comunicação com microservices externos (Propriedades, Utilizadores).
     */
    public BookingService(BookingRepository bookingRepository, BookingEventPublisher bookingEventPublisher, BookingPaymentService bookingPaymentService, Proxy api)
    {
        this.bookingRepository = bookingRepository;
        this.bookingEventPublisher = bookingEventPublisher;
        this.bookingPaymentService = bookingPaymentService;
        this.api = api;
    }

    /**
     * Executa o fluxo de criação de uma reserva de forma atómica.
     *
     * <p><b>Regras de Negócio aplicadas:</b></p>
     * <ul>
     *   <li>Validação temporal: Check-out deve ser posterior ao Check-in.</li>
     *   <li>Verificação de disponibilidade: Impede sobreposição com reservas CONFIRMED,
     *       BLOCKED ou PENDING_PAYMENT (Double Booking).</li>
     *   <li>Validação + cotação: Delegada ao property-service via endpoint de quote
     *       (regras operacionais + sazonalidade).</li>
     * </ul>
     *
     * <p><b>Concorrência:</b> A query de disponibilidade usa Pessimistic Write Lock
     * ({@code SELECT ... FOR UPDATE}), garantindo atomicidade ao milissegundo.</p>
     *
     * @param request O pedido de criação contendo os dados validados.
     * @return A resposta contendo os dados da reserva persistida.
     *
     * @throws IllegalArgumentException Se as regras de validação de data forem violadas.
     * @throws BookingConflictException Se for detetada uma sobreposição de agendamento (Double Booking).
     * @throws RuleViolationException Se o property-service rejeitar a cotação (regras operacionais).
     */
    @Transactional // Garante que tudo acontece ou nada acontece (Atomicidade)
    public BookingResponse createBooking(CreateBookingRequest request)
    {
        // 1. Validação Lógica de Datas
        if (!request.checkOutDate().isAfter(request.checkInDate()))
            throw new IllegalArgumentException("Check-out date must be after check-in date");

        // 1.5 Validação: Utilizador Registado vs Guest
        if (request.userId() != null) {
            try {
                api.userClient().getUserEmail(request.userId());
            } catch (Exception e) {
                throw new IllegalArgumentException("O utilizador informado não existe ou o serviço está indisponível.", e);
            }
        }

        // 2. Verificar Disponibilidade com Pessimistic Lock (domínio do booking-service)
        // Rejeita se existir sobreposição com CONFIRMED, BLOCKED ou PENDING_PAYMENT
        boolean isOccupied = bookingRepository.existsOverlappingBooking(
                request.propertyId(),
                request.checkInDate(),
                request.checkOutDate()
        );

        if (isOccupied)
            throw new BookingConflictException("Property is already booked for these dates");

        // 3. Validação + Cotação (Regras Operacionais + Sazonalidade) no property-service
        PropertyQuoteRequest quoteRequest = new PropertyQuoteRequest(
                request.checkInDate(),
                request.checkOutDate(),
                request.guestCount()
        );

        PropertyQuoteResponse quote;
        try {
            ApiResponse<PropertyQuoteResponse> quoteResponse = api.propertyClient().quote(request.propertyId(), quoteRequest);
            if (quoteResponse == null || !quoteResponse.isSuccess() || quoteResponse.getData() == null) {
                throw new RuntimeException("Não foi possível obter a cotação da propriedade.");
            }
            quote = quoteResponse.getData();
        } catch (Exception e) {
            throw new RuntimeException("Não foi possível validar/cotar a propriedade. Tente novamente mais tarde.", e);
        }

        if (!quote.valid()) {
            List<String> errors = quote.validationErrors() != null ? quote.validationErrors() : List.of("Cotação inválida.");
            throw new RuleViolationException(String.join(", ", errors));
        }

        // 4. Converter DTO para Entidade
        Booking booking = request.toEntity();

        // 5. Registar preço calculado pelo property-service
        booking.setTotalPrice(quote.totalPrice());

        Booking savedBooking = bookingRepository.save(booking);

        BookingResponse response = new BookingResponse(savedBooking);

        BookingCreatedMessage message = new BookingCreatedMessage(
                savedBooking.getId(),
                savedBooking.getPropertyId(),
                savedBooking.getUserId(),
                savedBooking.getStatus()
        );

        bookingEventPublisher.publishBookingCreated(message);

        return response;
    }

    /**
     * Cria uma Reserva Técnica (bloqueio manual) de forma atómica.
     *
     * <p>Um bloqueio é uma reserva sem transação financeira, criada pelo proprietário
     * para impedir que determinadas datas fiquem disponíveis. Não passa pelo fluxo de
     * cotação nem publica eventos de pagamento.</p>
     *
     * <p><b>Concorrência:</b> Usa a mesma query com Pessimistic Write Lock que
     * {@link #createBooking}, garantindo que bloqueios e reservas normais competem
     * pela mesma secção crítica e não se podem sobrepor.</p>
     *
     * <p><b>Estados bloqueantes verificados:</b> CONFIRMED, BLOCKED e PENDING_PAYMENT.</p>
     *
     * @param request O pedido de criação do bloqueio com propertyId, datas e razão opcional.
     * @param actorUserId ID do utilizador que solicita o bloqueio (proprietário), propagado
     *                    pelo Gateway via header {@code X-User-Id}.
     * @return A resposta contendo os dados do bloqueio persistido com status {@code BLOCKED}.
     *
     * @throws IllegalArgumentException Se checkOut não for posterior a checkIn.
     * @throws BookingConflictException Se as datas colidirem com reservas existentes.
     */
    @Transactional
    public BookingResponse createBlock(CreateBlockRequest request, Long actorUserId)
    {
        // 1. Validação de datas
        if (!request.checkOutDate().isAfter(request.checkInDate()))
            throw new IllegalArgumentException("Check-out date must be after check-in date");

        // 2. Verificar disponibilidade com Pessimistic Lock
        // A mesma query usada em createBooking — bloqueios e reservas competem
        // pela mesma secção crítica, impedindo sobreposições entre si.
        boolean isOccupied = bookingRepository.existsOverlappingBooking(
                request.propertyId(),
                request.checkInDate(),
                request.checkOutDate()
        );

        if (isOccupied)
            throw new BookingConflictException("Property is already occupied for these dates (booking or block exists)");

        // 3. Criar a reserva técnica diretamente — sem cotação, sem pagamento
        Booking block = Booking.builder()
                .propertyId(request.propertyId())
                .userId(actorUserId)              // Proprietário que criou o bloqueio
                .checkInDate(request.checkInDate())
                .checkOutDate(request.checkOutDate())
                .guests(0)                        // Bloqueios não têm hóspedes
                .totalPrice(BigDecimal.ZERO)      // Sem transação financeira
                .currency("EUR")
                .status(BookingStatus.BLOCKED)    // Estado exclusivo de bloqueios técnicos
                .cancellationReason(request.reason()) // Razão do bloqueio (uso interno)
                .build();

        Booking savedBlock = bookingRepository.save(block);

        return new BookingResponse(savedBlock);
    }

    /**
     * Recupera os detalhes de uma reserva específica.
     *
     * @param id O identificador único da reserva (UUID).
     * @return O DTO de resposta {@link BookingResponse} com os dados da reserva.
     * @throws RuntimeException Se a reserva não for encontrada na base de dados.
     */
    public BookingResponse getBookingById(Long id)
    {
        return bookingRepository.findById(id)
                .map(BookingResponse::new)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    /**
     * Lista todas as reservas associadas a uma propriedade específica.
     * <p>
     * Útil para exibir o calendário de disponibilidade no Frontend e verificar ocupação.
     * </p>
     *
     * @param propertyId O UUID da propriedade alvo.
     * @return Lista de {@link BookingResponse} contendo as reservas encontradas.
     */
    public java.util.List<BookingResponse> getBookingsByProperty(Long propertyId)
    {
        return bookingRepository.findByPropertyId(propertyId).stream()
                .map(BookingResponse::new)
                .toList();
    }

    /**
     * Lista o histórico completo de reservas efetuadas por um utilizador.
     *
     * @param userId O UUID do utilizador.
     * @return Lista de {@link BookingResponse} com o histórico pessoal.
     */
    public java.util.List<BookingResponse> getBookingsByUser(Long userId)
    {
        return bookingRepository.findByUserId(userId).stream()
                .map(BookingResponse::new)
                .toList();
    }

    /**
     * Cria uma intenção de pagamento para uma reserva.
     *
     * <p>Esta método permite que o utilizador inicie o processo de pagamento
     * sem concluir imediatamente. Útil para fluxos de checkout em múltiplos passos.</p>
     *
     * @param bookingId 'ID' da reserva
     * @param paymentMethod Método de pagamento escolhido
     * @return Detalhes da intenção de pagamento criada ({@link com.nexus.estates.dto.payment.PaymentResponse})
     * @throws PaymentProcessingException se houver erro no processamento
     */
    @Transactional
    public com.nexus.estates.dto.payment.PaymentResponse createPaymentIntent(Long bookingId, com.nexus.estates.dto.payment.PaymentMethod paymentMethod) {
        return bookingPaymentService.createPaymentIntent(bookingId, paymentMethod);
    }

    /**
     * Confirma um pagamento e atualiza o status da reserva.
     *
     * <p>Após a confirmação bem-sucedida, a reserva é marcada como confirmada
     * e um evento de atualização é publicado.</p>
     *
     * @param bookingId 'ID' da reserva
     * @param paymentIntentId 'ID' da intenção de pagamento a confirmar
     * @return Confirmação do pagamento ({@link com.nexus.estates.dto.payment.PaymentResponse})
     * @throws PaymentProcessingException se houver erro na confirmação
     */
    @Transactional
    public com.nexus.estates.dto.payment.PaymentResponse confirmPayment(Long bookingId, String paymentIntentId) {
        return bookingPaymentService.confirmPayment(bookingId, paymentIntentId);
    }

    /**
     * Processa um reembolso para uma reserva.
     *
     * <p>Permite reembolsos parciais ou totais, dependendo da política
     * de cancelamento e do provedor de pagamento.</p>
     *
     * @param bookingId 'ID' da reserva
     * @param amount Valor do reembolso (null para reembolso total)
     * @param reason Motivo do reembolso
     * @return Resultado do reembolso
     * @throws InvalidRefundException se o reembolso for inválido
     * @throws PaymentProcessingException se houver erro no processamento
     */
    @Transactional
    public com.nexus.estates.dto.payment.RefundResult processRefund(Long bookingId, java.math.BigDecimal amount, String reason) {
        return bookingPaymentService.processRefund(bookingId, amount, reason);
    }
}

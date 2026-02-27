package com.nexus.estates.service;

import com.nexus.estates.dto.BookingResponse;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.exception.BookingConflictException;
import com.nexus.estates.exception.InvalidRefundException;
import com.nexus.estates.exception.PaymentProcessingException;
import com.nexus.estates.common.messaging.BookingCreatedMessage;
import com.nexus.estates.messaging.BookingEventPublisher;
import com.nexus.estates.repository.BookingRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import com.nexus.estates.client.Proxy;

import java.math.BigDecimal;

/**
 * Serviço de domínio responsável pela execução da lógica de negócio de Reservas.
 *
 * <p>Implementa o padrão <i>Transaction Script</i> para garantir a integridade e atomicidade
 * das operações de reserva. Este serviço orquestra validações de domínio, cálculos financeiros,
 * comunicação com serviços externos e persistência de dados.</p>
 *
 * @see BookingRepository
 * @author Nexus Estates Team
 * @version 1.0
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
     * @param bookingRepository ‘Interface’ de acesso aos dados persistidos.
     * @param bookingEventPublisher Componente responsável pela publicação de eventos de reserva.
     * @param bookingPaymentService Serviço para processamento de pagamentos.
     * @param api Facade para comunicação com microservices externos (Propriedades, Utilizadores).
     */
    public BookingService(BookingRepository bookingRepository, BookingEventPublisher bookingEventPublisher, BookingPaymentService bookingPaymentService,Proxy api)
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
     *   <li>Verificação de disponibilidade: Impede sobreposição de reservas (Double Booking).</li>
     *   <li>Cálculo financeiro: Determina o custo total com base na tarifa obtida externamente.</li>
     * </ul>
     *
     * @param request O pedido de criação contendo os dados validados.
     * @return A resposta contendo os dados da reserva persistida.
     *
     * @throws IllegalArgumentException Se as regras de validação de data forem violadas.
     * @throws BookingConflictException Se for detetada uma sobreposição de agendamento (Double Booking).
     */
    @Transactional // Garante que tudo acontece ou nada acontece (Atomicidade)
    public BookingResponse createBooking(CreateBookingRequest request)
    {
        // 1. Validação Lógica de Datas
        if (!request.checkOutDate().isAfter(request.checkInDate()))
            throw new IllegalArgumentException("Check-out date must be after check-in date");


        // 2. Verificar Disponibilidade
        boolean isOccupied = bookingRepository.existsOverlappingBooking(
                request.propertyId(),
                request.checkInDate(),
                request.checkOutDate()
        );

        if (isOccupied)
            throw new BookingConflictException("Property is already booked for these dates");


        // 3. Converter DTO para Entidade
        Booking booking = request.toEntity();

        // 4. Calcular Preço
        booking.setTotalPrice(this.calculateTotalPrice(request));

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
     * Calcula o preço total da reserva com base na tarifa diária e na duração da estadia.
     *
     * <p>Implementação temporária (mock) que aplica um preço fixo por noite. No futuro,
     * este método será substituído por um {@code PricingService} que considera fatores
     * sazonais, regras de negócio e descontos.</p>
     *
     * @param request dados validados da reserva, incluindo datas de check-in e check-out
     * @return montante total a pagar pela estadia, em {@link BigDecimal}
     * @throws IllegalArgumentException caso a duração calculada seja negativa ou zero
     */
    private BigDecimal calculateTotalPrice(CreateBookingRequest request)
    {
                                        // Entramos no api para outros modulos
                                        // usamos especificamente o cliente de property
            BigDecimal pricePerNight = api.propertyClient().getPropertyPrice(request.userId());
            long days = request.checkOutDate().toEpochDay() - request.checkInDate().toEpochDay();
        return pricePerNight.multiply(BigDecimal.valueOf(days));
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
     * @param bookingId ‘ID’ da reserva
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
     * @param bookingId ‘ID’ da reserva
     * @param paymentIntentId ‘ID’ da intenção de pagamento a confirmar
     * @return Confirmação do pagamento ({@link com.nexus.estates.dto.payment.PaymentResponse})
     * @throws PaymentProcessingException se houver erro na confirmação
     */
    @Transactional
    public com.nexus.estates.dto.payment.PaymentResponse confirmPayment(Long bookingId, String paymentIntentId) {
        java.util.Map<String, Object> metadata = java.util.Map.of(
                "bookingId", bookingId.toString(),
                "confirmedAt", java.time.LocalDateTime.now().toString()
        );
        
        return bookingPaymentService.confirmPayment(paymentIntentId, metadata);
    }

    /**
     * Processa um reembolso para uma reserva.
     * 
     * <p>Permite reembolsos parciais ou totais, dependendo da política
     * de cancelamento e do provedor de pagamento.</p>
     * 
     * @param bookingId ‘ID’ da reserva
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

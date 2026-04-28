package com.nexus.estates.service;

import com.nexus.estates.client.NexusClients;
import com.nexus.estates.client.Proxy;
import com.nexus.estates.dto.payment.*;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.common.enums.BookingStatus;
import com.nexus.estates.exception.PaymentNotFoundException;
import com.nexus.estates.exception.PaymentProcessingException;
import com.nexus.estates.messaging.BookingEventPublisher;
import com.nexus.estates.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Serviço responsável pela orquestração de pagamentos relacionados a reservas.
 * <p>
 * Este serviço atua como camada de orquestração entre o domínio de reservas e o finance-service.
 * Ele delega a criação/confirmação/reembolso ao {@code NexusClients.FinanceClient} e mantém
 * a consistência do estado da reserva através de callbacks internos e publicação de eventos.
 * </p>
 *
 * @author Nexus Estates Team
 * @version 1.1
 * @see BookingRepository
 * @see BookingEventPublisher
 */
@Service
public class BookingPaymentService {

    private final Proxy proxy;
    private final BookingRepository bookingRepository;
    private final BookingEventPublisher eventPublisher;

    /**
     * Construtor para injeção de dependências.
     *
     * @param proxy Facade para comunicação com microservices externos (inclui finance-service).
     * @param bookingRepository Repositório para acesso e persistência de dados de reservas.
     * @param eventPublisher Publicador de eventos para notificar outros componentes sobre mudanças de estado.
     */
    public BookingPaymentService(Proxy proxy,
                                 BookingRepository bookingRepository,
                                 BookingEventPublisher eventPublisher) {
        this.proxy = proxy;
        this.bookingRepository = bookingRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Cria uma intenção de pagamento para uma reserva específica.
     * <p>
     * Este método inicia o processo de pagamento, gerando um identificador de intenção
     * que pode ser usado pelo cliente para concluir a transação. O ID da intenção é
     * salvo na entidade {@link Booking}.
     * </p>
     *
     * @param bookingId O ID da reserva para a qual o pagamento será criado.
     * @param paymentMethod O método de pagamento selecionado pelo usuário.
     * @return Um objeto {@link PaymentResponse} contendo os detalhes para prosseguir com o pagamento.
     * @throws PaymentProcessingException Se ocorrer um erro ao comunicar com o gateway de pagamento.
     * @throws IllegalArgumentException Se a reserva não for encontrada.
     * @throws IllegalStateException Se a reserva não estiver num estado válido para pagamento.
     */
    @Transactional
    public PaymentResponse createPaymentIntent(Long bookingId, PaymentMethod paymentMethod) {
        Booking booking = findBookingById(bookingId);
        
        validateBookingForPayment(booking);
        
        Map<String, Object> metadata = createPaymentMetadata(booking);
        
        try {
            PaymentResponse response = proxy.financeClient().createPaymentIntent(
                    bookingId,
                    new NexusClients.CreatePaymentIntentRequest(booking.getTotalPrice(), "EUR", paymentMethod, metadata)
            );
            
            booking.setPaymentIntentId(response.transactionId());
            bookingRepository.save(booking);
            
            return response;
        } catch (Exception e) {
            throw new PaymentProcessingException(
                "Failed to create payment intent for booking " + bookingId,
                null,
                e.getMessage(),
                null
            );
        }
    }

    /**
     * Confirma uma intenção de pagamento previamente criada.
     * <p>
     * Este método é chamado após o cliente autorizar o pagamento. Se a confirmação for
     * bem-sucedida (status {@code SUCCEEDED}), o status da reserva é atualizado para
     * {@code CONFIRMED} e um evento é publicado.
     * </p>
     *
     * @param paymentIntentId O ID da intenção de pagamento a ser confirmada.
     * @return Um objeto {@link PaymentResponse} com o resultado da operação.
     * @throws PaymentProcessingException Se ocorrer um erro durante a confirmação do pagamento.
     */
    @Transactional
    public PaymentResponse confirmPayment(Long bookingId, String paymentIntentId) {
        try {
            Map<String, Object> metadata = Map.of(
                    "bookingId", bookingId.toString(),
                    "confirmedAt", LocalDateTime.now().toString()
            );

            return proxy.financeClient().confirmPayment(
                    bookingId,
                    new NexusClients.ConfirmPaymentRequest(paymentIntentId, metadata)
            );
        } catch (Exception e) {
            throw new PaymentProcessingException(
                "Failed to confirm payment intent " + paymentIntentId,
                null,
                e.getMessage(),
                paymentIntentId
            );
        }
    }

    /**
     * Processa um pagamento direto em uma única etapa.
     * <p>
     * Útil para métodos de pagamento que não requerem o fluxo de duas etapas (intenção + confirmação).
     * Se bem-sucedido, a reserva é confirmada imediatamente.
     * </p>
     *
     * @param bookingId O ID da reserva a ser paga.
     * @param paymentMethod O método de pagamento a ser utilizado.
     * @return Um objeto {@link PaymentResponse} com o resultado do processamento.
     * @throws PaymentProcessingException Se ocorrer um erro no processamento do pagamento.
     * @throws IllegalArgumentException Se a reserva não for encontrada.
     * @throws IllegalStateException Se a reserva não estiver elegível para pagamento.
     */
    @Transactional
    public PaymentResponse processDirectPayment(Long bookingId, PaymentMethod paymentMethod) {
        Booking booking = findBookingById(bookingId);
        
        validateBookingForPayment(booking);
        
        Map<String, Object> metadata = createPaymentMetadata(booking);
        
        try {
            return proxy.financeClient().processDirectPayment(
                    bookingId,
                    new NexusClients.DirectPaymentRequest(booking.getTotalPrice(), "EUR", paymentMethod, metadata)
            );
        } catch (Exception e) {
            throw new PaymentProcessingException(
                "Failed to process direct payment for booking " + bookingId,
                null,
                e.getMessage(),
                null
            );
        }
    }

    /**
     * Processa o reembolso de uma reserva.
     * <p>
     * Inicia o processo de reembolso junto ao provedor de pagamento usando o ID da transação
     * armazenado na reserva. Se o reembolso for bem-sucedido, a reserva é cancelada.
     * </p>
     *
     * @param bookingId O ID da reserva a ser reembolsada.
     * @param amount O valor a ser reembolsado.
     * @param reason O motivo do reembolso.
     * @return Um objeto {@link RefundResult} com os detalhes do reembolso.
     * @throws PaymentNotFoundException Se não houver transação associada à reserva.
     * @throws PaymentProcessingException Se ocorrer um erro no processamento do reembolso.
     * @throws IllegalArgumentException Se a reserva não for encontrada.
     * @throws IllegalStateException Se a reserva não estiver confirmada.
     */
    @Transactional
    public RefundResult processRefund(Long bookingId, BigDecimal amount, String reason) {
        Booking booking = findBookingById(bookingId);
        
        validateBookingForRefund(booking);
        
        String transactionId = booking.getPaymentIntentId();
        if (transactionId == null) {
            throw new PaymentNotFoundException("No transaction found for booking " + bookingId);
        }
        
        Map<String, Object> metadata = Map.of(
            "bookingId", booking.getId().toString(),
            "refundReason", reason,
            "originalAmount", booking.getTotalPrice().toString()
        );
        
        try {
            RefundResult refund = proxy.financeClient().refund(
                    bookingId,
                    new NexusClients.RefundRequest(transactionId, amount, "EUR", reason, metadata)
            );
            
            if (refund.status() == RefundStatus.SUCCEEDED) {
                updateBookingStatusAfterRefund(bookingId);
            }
            
            return refund;
        } catch (Exception e) {
            throw new PaymentProcessingException(
                "Failed to process refund for booking " + bookingId,
                null,
                e.getMessage(),
                transactionId
            );
        }
    }

    /**
     * Obtém os detalhes de uma transação específica.
     *
     * @param transactionId O ID da transação.
     * @return Um objeto {@link TransactionInfo} com as informações completas da transação.
     * @throws PaymentNotFoundException Se a transação não for encontrada.
     */
    public TransactionInfo getTransactionDetails(String transactionId) {
        try {
            return proxy.financeClient().getTransactionDetails(transactionId);
        } catch (Exception e) {
            throw new PaymentNotFoundException("Transaction not found: " + transactionId);
        }
    }

    /**
     * Verifica o status atual de um pagamento.
     *
     * @param transactionId O ID da transação.
     * @return O {@link PaymentStatus} atual da transação.
     * @throws PaymentNotFoundException Se a transação não for encontrada ou o status não puder ser recuperado.
     */
    public PaymentStatus getPaymentStatus(String transactionId) {
        try {
            return proxy.financeClient().getPaymentStatus(transactionId);
        } catch (Exception e) {
            throw new PaymentNotFoundException("Unable to get payment status for transaction: " + transactionId);
        }
    }

    /**
     * Verifica se um determinado método de pagamento é suportado pelo provedor atual.
     *
     * @param paymentMethod O método de pagamento a ser verificado.
     * @return {@code true} se o método for suportado, {@code false} caso contrário.
     */
    public boolean supportsPaymentMethod(PaymentMethod paymentMethod) {
        Map<String, Object> result = proxy.financeClient().supportsPaymentMethod(paymentMethod);
        Object supported = result != null ? result.get("supported") : null;
        return supported instanceof Boolean b ? b : false;
    }

    /**
     * Obtém informações sobre o provedor de pagamento configurado.
     *
     * @return Um objeto {@link ProviderInfo} contendo metadados do provedor.
     */
    public ProviderInfo getProviderInfo() {
        return proxy.financeClient().getPaymentProviderInfo();
    }

    @Transactional
    public void markPaymentSucceeded(Long bookingId, String transactionId) {
        bookingRepository.findById(bookingId).ifPresent(booking -> {
            if (booking.getStatus() == BookingStatus.CONFIRMED) {
                if (transactionId != null && transactionId.equals(booking.getPaymentIntentId())) {
                    return;
                }
            }
            updateBookingStatusAfterPayment(bookingId, transactionId);
        });
    }

    /**
     * Busca uma reserva pelo seu identificador.
     *
     * @param bookingId O ID da reserva.
     * @return A entidade {@link Booking} encontrada.
     * @throws IllegalArgumentException Se a reserva não for encontrada.
     */
    private Booking findBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found with id: " + bookingId));
    }

    /**
     * Valida se a reserva está apta para pagamento.
     * <p>
     * Verifica se a reserva já não está paga, cancelada ou se possui um valor inválido.
     * </p>
     *
     * @param booking A reserva a ser validada.
     * @throws IllegalStateException Se a reserva não estiver em um estado válido.
     */
    private void validateBookingForPayment(Booking booking) {
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Booking is already confirmed and paid");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cannot process payment for cancelled booking");
        }
        if (booking.getTotalPrice() == null || booking.getTotalPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Invalid booking total price");
        }
    }

    /**
     * Valida se a reserva está apta para reembolso.
     * <p>
     * Apenas reservas confirmadas podem ser reembolsadas.
     * </p>
     *
     * @param booking A reserva a ser validada.
     * @throws IllegalStateException Se a reserva não estiver confirmada.
     */
    private void validateBookingForRefund(Booking booking) {
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Can only refund confirmed bookings");
        }
    }

    /**
     * Cria o mapa de metadados para envio ao provedor de pagamento.
     *
     * @param booking A reserva contendo os dados.
     * @return Um mapa contendo informações relevantes da reserva.
     */
    private Map<String, Object> createPaymentMetadata(Booking booking) {
        return Map.of(
            "bookingId", booking.getId().toString(),
            "propertyId", booking.getPropertyId().toString(),
                "userId", booking.getUserId() != null ? booking.getUserId().toString() : "GUEST",
            "checkInDate", booking.getCheckInDate().toString(),
            "checkOutDate", booking.getCheckOutDate().toString(),
            "guests", String.valueOf(booking.getGuests())
        );
    }

    /**
     * Atualiza o status da reserva após um pagamento bem-sucedido.
     * <p>
     * Define o status como {@code CONFIRMED}, salva o ID da transação e publica o evento de atualização.
     * </p>
     *
     * @param bookingId O ID da reserva.
     * @param transactionId O ID da transação de pagamento.
     */
    private void updateBookingStatusAfterPayment(Long bookingId, String transactionId) {
        bookingRepository.findById(bookingId).ifPresent(booking -> {
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setPaymentIntentId(transactionId);
            bookingRepository.save(booking);
            
            com.nexus.estates.common.messaging.BookingUpdatedMessage message = new com.nexus.estates.common.messaging.BookingUpdatedMessage(
                booking.getId(),
                booking.getPropertyId(),
                booking.getUserId(),
                BookingStatus.CONFIRMED,
                "Payment confirmed - Transaction: " + transactionId
            );
            eventPublisher.publishBookingUpdated(message);
        });
    }

    /**
     * Atualiza o status da reserva após um reembolso bem-sucedido.
     * <p>
     * Define o status como {@code CANCELLED} e publica o evento de cancelamento.
     * </p>
     *
     * @param bookingId O ID da reserva.
     */
    private void updateBookingStatusAfterRefund(Long bookingId) {
        bookingRepository.findById(bookingId).ifPresent(booking -> {
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            
            com.nexus.estates.common.messaging.BookingCancelledMessage message = new com.nexus.estates.common.messaging.BookingCancelledMessage(
                booking.getId(),
                booking.getPropertyId(),
                booking.getUserId(),
                "Booking cancelled after refund"
            );
            eventPublisher.publishBookingCancelled(message);
        });
    }
}

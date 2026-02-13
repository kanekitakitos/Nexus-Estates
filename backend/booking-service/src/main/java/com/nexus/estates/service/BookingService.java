package com.nexus.estates.service;

import com.nexus.estates.dto.BookingResponse;
import com.nexus.estates.dto.CreateBookingRequest;
import com.nexus.estates.entity.Booking;
import com.nexus.estates.exception.BookingConflictException;
import com.nexus.estates.mapper.BookingMapper;
import com.nexus.estates.repository.BookingRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Serviço de domínio responsável pela execução da lógica de negócio de Reservas.
 * <p>
 * Implementa o padrão <i>Transaction Script</i> para garantir a integridade das operações
 * de reserva. Gerencia validações de domínio, cálculos financeiros e interação com a camada de dados.
 * </p>
 *
 * @see BookingRepository
 * @see BookingMapper
 * @author Nexus Estates Team
 */
@Service
public class BookingService
{


    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;

    /**
     * Construtor padrão para injeção de dependências.
     *
     * @param bookingRepository Interface de acesso aos dados persistidos.
     * @param bookingMapper Componente de transformação de objetos.
     */
    public BookingService(BookingRepository bookingRepository, BookingMapper bookingMapper)
    {
        this.bookingRepository = bookingRepository;
        this.bookingMapper = bookingMapper;
    }

    /**
     * Executa o fluxo de criação de uma reserva de forma atómica.
     * <p>
     * <b>Regras de Negócio:</b>
     * <ol>
     *   <li>A data de check-out deve ser estritamente posterior à data de check-in.</li>
     *   <li>A propriedade não pode ter reservas confirmadas ou pendentes que coincidam com o período solicitado.</li>
     *   <li>O preço total é calculado com base na tarifa diária (mock) e duração da estadia.</li>
     * </ol>
     * </p>
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
        Booking booking = bookingMapper.toEntity(request);

        // 4. Calcular Preço (MOCK TEMPORÁRIO)
        // TODO: Substituir pelo PricingService real no próximo passo
        BigDecimal pricePerNight = new BigDecimal("100.00");
        long days = request.checkOutDate().toEpochDay() - request.checkInDate().toEpochDay();
        BigDecimal total = pricePerNight.multiply(BigDecimal.valueOf(days));
        booking.setTotalPrice(total);

        // 5. Guardar na BD
        Booking savedBooking = bookingRepository.save(booking);

        // 6. Retornar resposta
        return bookingMapper.toResponse(savedBooking);
        }


    /**
     * Recupera os detalhes de uma reserva específica.
     *
     * @param id O identificador único da reserva (UUID).
     * @return O DTO de resposta {@link BookingResponse} com os dados da reserva.
     * @throws RuntimeException Se a reserva não for encontrada na base de dados.
     */
    public BookingResponse getBookingById(java.util.UUID id)
    {
        return bookingRepository.findById(id)
                .map(bookingMapper::toResponse)
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
    public java.util.List<BookingResponse> getBookingsByProperty(java.util.UUID propertyId)
    {
        return bookingRepository.findByPropertyId(propertyId).stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    /**
     * Lista o histórico completo de reservas efetuadas por um utilizador.
     *
     * @param userId O UUID do utilizador.
     * @return Lista de {@link BookingResponse} com o histórico pessoal.
     */
    public java.util.List<BookingResponse> getBookingsByUser(java.util.UUID userId)
    {
        return bookingRepository.findByUserId(userId).stream()
                .map(bookingMapper::toResponse)
                .toList();
    }
}

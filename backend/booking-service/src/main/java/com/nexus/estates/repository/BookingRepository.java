package com.nexus.estates.repository;

import com.nexus.estates.entity.Booking;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Interface de repositório para a entidade {@link Booking}.
 * <p>
 * Extende {@link JpaRepository} para fornecer operações CRUD padrão e consultas
 * personalizadas otimizadas para o domínio de reservas.
 *
 * @author Nexus Estates Team
 * @version 1.1
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Deteta sobreposições de agendamento para uma propriedade num intervalo de datas,
     * aplicando <b>Pessimistic Write Lock</b> para garantir atomicidade sob alta concorrência.
     *
     * <p>
     * <b>Pessimistic Locking:</b>
     * A anotação {@link Lock} com {@link LockModeType#PESSIMISTIC_WRITE} emite um
     * {@code SELECT ... FOR UPDATE} no PostgreSQL, bloqueando as linhas lidas até ao fim
     * da transação. Isto garante que duas threads concorrentes que verificam a mesma
     * propriedade para o mesmo período não passam ambas na validação de disponibilidade
     * (prevenção de double booking ao milissegundo).
     * </p>
     *
     * <p>
     * <b>Estados bloqueantes:</b>
     * A query considera como "ocupados" os estados {@code CONFIRMED}, {@code BLOCKED}
     * e {@code PENDING_PAYMENT}:
     * <ul>
     *   <li>{@code CONFIRMED} — reserva com pagamento processado, datas definitivamente ocupadas.</li>
     *   <li>{@code BLOCKED} — bloqueio técnico (manual ou iCal), sem transação financeira.</li>
     *   <li>{@code PENDING_PAYMENT} — reserva criada mas aguarda pagamento; as datas estão
     *       temporariamente reservadas para evitar que outro utilizador ocupe o mesmo período
     *       durante o checkout.</li>
     * </ul>
     * </p>
     *
     * <p>
     * <b>Lógica de interseção de intervalos:</b>
     * {@code (checkIn_A < checkOut_B) AND (checkOut_A > checkIn_B)}.
     * </p>
     *
     * <p>
     * <b>Desempenho:</b>
     * Esta operação é crítica para a consistência dos dados. Recomenda-se a existência
     * de um índice composto na base de dados: {@code (property_id, check_in_date, check_out_date)}.
     * </p>
     *
     * @param propertyId O identificador da propriedade alvo.
     * @param checkIn    Data de início do intervalo pretendido.
     * @param checkOut   Data de fim do intervalo pretendido.
     * @return {@code true} se existir pelo menos uma reserva activa (CONFIRMED, BLOCKED ou
     *         PENDING_PAYMENT) que colida com o intervalo.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.propertyId = :propertyId
        AND b.status IN ('CONFIRMED', 'BLOCKED', 'PENDING_PAYMENT')
        AND (
            b.checkInDate < :checkOut AND b.checkOutDate > :checkIn
        )
    """)
    boolean existsOverlappingBooking(
            @Param("propertyId") Long propertyId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    /**
     * Recupera todas as reservas associadas a uma determinada propriedade.
     *
     * <p>Uso típico: construir calendários de disponibilidade e verificar ocupação.</p>
     *
     * <b>Nota de desempenho:</b> recomenda-se índice composto (property_id, check_in_date, check_out_date).
     *
     * @param propertyId identificador único (UUID) da propriedade
     * @return lista de reservas da propriedade (sem ordenação garantida)
     */
    List<Booking> findByPropertyId(Long propertyId);

    /**
     * Recupera o histórico de reservas efetuadas por um utilizador específico.
     *
     * <p>Uso típico: exibir histórico pessoal de reservas no frontend.</p>
     *
     * @param userId identificador único (UUID) do utilizador
     * @return lista de reservas associadas ao utilizador (sem ordenação garantida)
     */
    List<Booking> findByUserId(Long userId);

    //* Outra forma de fazer a query, mas se ve horrivel
//?    boolean existsByPropertyIdAndStatusInAndCheckInDateLessThanAndCheckOutDateGreaterThan(
//            UUID propertyId,
//            List<BookingStatus> statuses,
//            LocalDate checkOut,
//            LocalDate checkIn
//    );

}

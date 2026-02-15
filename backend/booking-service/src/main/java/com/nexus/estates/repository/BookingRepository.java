package com.nexus.estates.repository;



import com.nexus.estates.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Interface de repositório para a entidade {@link Booking}.
 * <p>
 * Extende {@link JpaRepository} para fornecer operações CRUD padrão e consultas
 * personalizadas otimizadas para o domínio de reservas.
 *
 * @author Nexus Estates Team
 * @version 1.0
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    /**
     * Deteta sobreposições de agendamento para uma propriedade num intervalo de datas.
     * <p>
     * <b>Query JPQL Otimizada:</b>
     * A consulta verifica a interseção de intervalos temporais utilizando a lógica:
     * {@code (StartA < EndB) e (EndA > StartB)}.
     * </p>
     * <p>
     * <b>Desempenho:</b>
     * Esta operação é crítica para a consistência dos dados. Recomenda-se a existência
     * de um índice composto na base de dados: {@code (property_id, check_in_date, check_out_date)}.
     * </p>
     *
     * @param propertyId O identificador da propriedade alvo.
     * @param checkIn Data de início do intervalo pretendido.
     * @param checkOut Data de fim do intervalo pretendido.
     * @return {@code true} se existir pelo menos uma reserva ativa (não cancelada/reembolsada) que colida com o intervalo.
     */
    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.propertyId = :propertyId
        AND b.status NOT IN ('CANCELLED', 'REFUNDED')
        AND (
            b.checkInDate < :checkOut AND b.checkOutDate > :checkIn
        )
    """)
    boolean existsOverlappingBooking(
            @Param("propertyId") UUID propertyId,
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
    List<Booking> findByPropertyId(UUID propertyId);

    /**
     * Recupera o histórico de reservas efetuadas por um utilizador específico.
     *
     * <p>Uso típico: exibir histórico pessoal de reservas no frontend.</p>
     *
     * @param userId identificador único (UUID) do utilizador
     * @return lista de reservas associadas ao utilizador (sem ordenação garantida)
     */
    List<Booking> findByUserId(UUID userId);

    //* Outra forma de fazer a query, mas se ve horrivel
//?    boolean existsByPropertyIdAndStatusInAndCheckInDateLessThanAndCheckOutDateGreaterThan(
//            UUID propertyId,
//            List<BookingStatus> statuses,
//            LocalDate checkOut,
//            LocalDate checkIn
//    );



}

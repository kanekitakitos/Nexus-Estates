package com.nexus.estates.repository;

import com.nexus.estates.entity.Booking;
import com.nexus.estates.common.enums.BookingStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class BookingRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    void shouldReturnTrueWhenBookingOverlaps() {
        UUID propertyId = UUID.randomUUID();
        
        Booking booking = new Booking();
        booking.setPropertyId(propertyId);
        booking.setUserId(UUID.randomUUID());
        booking.setCheckInDate(LocalDate.now().plusDays(2));
        booking.setCheckOutDate(LocalDate.now().plusDays(5));
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setTotalPrice(BigDecimal.TEN);
        booking.setGuestCount(1);
        
        entityManager.persist(booking);
        entityManager.flush();

        // Overlap cases
        boolean overlap1 = bookingRepository.existsOverlappingBooking(propertyId, LocalDate.now().plusDays(1), LocalDate.now().plusDays(3)); // Starts before, ends inside
        boolean overlap2 = bookingRepository.existsOverlappingBooking(propertyId, LocalDate.now().plusDays(3), LocalDate.now().plusDays(6)); // Starts inside, ends after
        boolean overlap3 = bookingRepository.existsOverlappingBooking(propertyId, LocalDate.now().plusDays(2), LocalDate.now().plusDays(5)); // Exact match
        boolean overlap4 = bookingRepository.existsOverlappingBooking(propertyId, LocalDate.now().plusDays(1), LocalDate.now().plusDays(6)); // Encloses

        assertThat(overlap1).isTrue();
        assertThat(overlap2).isTrue();
        assertThat(overlap3).isTrue();
        assertThat(overlap4).isTrue();
    }

    @Test
    void shouldReturnFalseWhenNoOverlap() {
        UUID propertyId = UUID.randomUUID();
        
        Booking booking = new Booking();
        booking.setPropertyId(propertyId);
        booking.setUserId(UUID.randomUUID());
        booking.setCheckInDate(LocalDate.now().plusDays(2));
        booking.setCheckOutDate(LocalDate.now().plusDays(5));
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setTotalPrice(BigDecimal.TEN);
        booking.setGuestCount(1);
        
        entityManager.persist(booking);
        entityManager.flush();

        // No overlap cases
        boolean noOverlap1 = bookingRepository.existsOverlappingBooking(propertyId, LocalDate.now(), LocalDate.now().plusDays(2));
        boolean noOverlap2 = bookingRepository.existsOverlappingBooking(propertyId, LocalDate.now().plusDays(5), LocalDate.now().plusDays(7));

        assertThat(noOverlap1).isFalse();
        assertThat(noOverlap2).isFalse();
    }
}
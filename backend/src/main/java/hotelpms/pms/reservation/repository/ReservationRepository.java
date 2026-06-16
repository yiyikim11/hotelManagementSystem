package hotelpms.pms.reservation.repository;

import hotelpms.pms.reservation.entity.Reservation;
import hotelpms.pms.reservation.entity.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    Page<Reservation> findByStatus(ReservationStatus status, Pageable pageable);

    Page<Reservation> findByGuest_Id(UUID guestId, Pageable pageable);

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.arrivalDate = :date
          AND r.status IN ('CONFIRMED', 'CHECKED_IN')
        """)
    List<Reservation> findArrivalsForDate(@Param("date") LocalDate date);

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.departureDate = :date
          AND r.status = 'CHECKED_IN'
        """)
    List<Reservation> findDeparturesForDate(@Param("date") LocalDate date);

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.status = 'CHECKED_IN'
          AND r.arrivalDate <= :date
          AND r.departureDate > :date
        """)
    List<Reservation> findInHouseForDate(@Param("date") LocalDate date);

    Page<Reservation> findByGuest_EmailAndGuest_DeletedAtIsNull(String email, Pageable pageable);

    long countByStatus(ReservationStatus status);

    @Query("""
        SELECT COUNT(r) FROM Reservation r
        WHERE r.arrivalDate = :date
          AND r.status IN ('CONFIRMED', 'CHECKED_IN')
        """)
    long countArrivalsForDate(@Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(r) FROM Reservation r
        WHERE r.departureDate = :date
          AND r.status = 'CHECKED_IN'
        """)
    long countDeparturesForDate(@Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(r) FROM Reservation r
        WHERE r.status = 'CHECKED_IN'
          AND r.arrivalDate <= :date
          AND r.departureDate > :date
        """)
    long countInHouseForDate(@Param("date") LocalDate date);
}

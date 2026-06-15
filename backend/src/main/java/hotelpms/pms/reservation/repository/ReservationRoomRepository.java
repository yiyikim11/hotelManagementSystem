package hotelpms.pms.reservation.repository;

import hotelpms.pms.reservation.entity.ReservationRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReservationRoomRepository extends JpaRepository<ReservationRoom, UUID> {

    List<ReservationRoom> findByReservationId(UUID reservationId);

    /** Count rooms of a given type with overlapping stay (for availability checks). */
    @Query("""
        SELECT COUNT(rr) FROM ReservationRoom rr
        WHERE rr.roomType.id = :roomTypeId
          AND rr.reservation.status NOT IN ('CANCELLED', 'NO_SHOW')
          AND rr.arrivalDate < :to
          AND rr.departureDate > :from
        """)
    long countOccupiedByTypeAndDateRange(
            @Param("roomTypeId") UUID roomTypeId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}

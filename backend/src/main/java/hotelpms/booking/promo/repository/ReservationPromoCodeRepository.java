package hotelpms.booking.promo.repository;

import hotelpms.booking.promo.entity.ReservationPromoCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReservationPromoCodeRepository extends JpaRepository<ReservationPromoCode, UUID> {
    // findById(reservationId) inherited from JpaRepository — PK is reservation_id
}

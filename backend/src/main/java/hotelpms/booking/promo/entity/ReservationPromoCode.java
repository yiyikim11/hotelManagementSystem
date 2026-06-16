package hotelpms.booking.promo.entity;

import hotelpms.pms.reservation.entity.Reservation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Join record between a reservation and the promo code applied to it.
 * PK = reservation_id (FK), so only one promo code per reservation.
 * Does not extend BaseEntity — the table has no separate id/audit columns.
 */
@Entity
@Table(name = "reservation_promo_codes")
@Getter
@Setter
@NoArgsConstructor
public class ReservationPromoCode {

    @Id
    @Column(name = "reservation_id")
    private UUID reservationId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promo_code_id", nullable = false)
    private PromoCode promoCode;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal discountApplied;

    @Column(nullable = false)
    private Instant appliedAt = Instant.now();
}

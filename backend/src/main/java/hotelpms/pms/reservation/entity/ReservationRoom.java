package hotelpms.pms.reservation.entity;

import hotelpms.common.persistence.BaseEntity;
import hotelpms.pms.cancellationpolicy.entity.CancellationPolicy;
import hotelpms.pms.room.entity.Room;
import hotelpms.pms.room.entity.RoomType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "reservation_rooms")
@Getter
@Setter
@NoArgsConstructor
public class ReservationRoom extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancellation_policy_id")
    private CancellationPolicy cancellationPolicy;

    @Column(nullable = false)
    private LocalDate arrivalDate;

    @Column(nullable = false)
    private LocalDate departureDate;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal nightlyRate = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    private Instant checkedInAt;

    private Instant checkedOutAt;
}

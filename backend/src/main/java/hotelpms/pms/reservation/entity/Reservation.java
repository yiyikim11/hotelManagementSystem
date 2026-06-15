package hotelpms.pms.reservation.entity;

import hotelpms.common.persistence.BaseEntity;
import hotelpms.common.user.entity.User;
import hotelpms.pms.guest.entity.Guest;
import hotelpms.pms.rateplan.entity.RatePlan;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
public class Reservation extends BaseEntity {

    @Column(nullable = false, unique = true, length = 30)
    private String confirmationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReservationStatus status = ReservationStatus.CONFIRMED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReservationSource source = ReservationSource.WALK_IN;

    @Column(nullable = false)
    private LocalDate arrivalDate;

    @Column(nullable = false)
    private LocalDate departureDate;

    @Column(nullable = false)
    private int adults = 1;

    @Column(nullable = false)
    private int children = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rate_plan_id")
    private RatePlan ratePlan;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal depositAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @Column(columnDefinition = "TEXT")
    private String specialRequests;

    @Column(columnDefinition = "TEXT")
    private String cancellationReason;

    private Instant cancelledAt;

    @Column(nullable = false)
    private boolean isDayUse = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReservationRoom> rooms = new ArrayList<>();
}

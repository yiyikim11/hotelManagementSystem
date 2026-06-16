package hotelpms.booking.payment.entity;

import hotelpms.common.persistence.BaseEntity;
import hotelpms.pms.reservation.entity.Reservation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "online_payment_transactions")
@Getter
@Setter
@NoArgsConstructor
public class OnlinePaymentTransaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(nullable = false, length = 32)
    private String gateway;

    @Column(unique = true, length = 255)
    private String gatewayTransactionId;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentStatus status;

    @Column(length = 30)
    private String paymentMethod;

    @Column(length = 30)
    private String cardBrand;

    @Column(length = 4)
    private String cardLast4;

    /** Pointer into Mongo `payment_gateway_events` collection — not written yet. */
    @Column(length = 64)
    private String gatewayResponseDocId;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    private Instant completedAt;
}

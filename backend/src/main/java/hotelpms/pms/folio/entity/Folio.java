package hotelpms.pms.folio.entity;

import hotelpms.common.persistence.BaseEntity;
import hotelpms.pms.guest.entity.Guest;
import hotelpms.pms.reservation.entity.Reservation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "folios")
@Getter
@Setter
@NoArgsConstructor
public class Folio extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FolioStatus status = FolioStatus.OPEN;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    private Instant settledAt;

    @OneToMany(mappedBy = "folio", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FolioItem> items = new ArrayList<>();
}

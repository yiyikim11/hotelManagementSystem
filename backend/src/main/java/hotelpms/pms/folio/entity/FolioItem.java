package hotelpms.pms.folio.entity;

import hotelpms.common.persistence.BaseEntity;
import hotelpms.common.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "folio_items")
@Getter
@Setter
@NoArgsConstructor
public class FolioItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folio_id", nullable = false)
    private Folio folio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ChargeType chargeType;

    @Column(length = 255)
    private String description;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false)
    private int quantity = 1;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by")
    private User postedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voided_by")
    private User voidedBy;

    private Instant voidedAt;

    @Column(nullable = false)
    private Instant postedAt;
}

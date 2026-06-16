package hotelpms.booking.promo.entity;

import hotelpms.common.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "promo_codes")
@Getter
@Setter
@NoArgsConstructor
public class PromoCode extends BaseEntity {

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private PromotionalPackage promotionalPackage;

    /** NULL means unlimited usage. */
    private Integer usageLimit;

    @Column(nullable = false)
    private int usageCount = 0;

    @Column(nullable = false)
    private Instant validFrom;

    @Column(nullable = false)
    private Instant validTo;

    @Column(nullable = false)
    private boolean isActive = true;
}

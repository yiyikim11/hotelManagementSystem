package hotelpms.pms.cancellationpolicy.entity;

import hotelpms.common.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "cancellation_policies")
@Getter
@Setter
@NoArgsConstructor
public class CancellationPolicy extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int hoursBeforeArrival = 24;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FeeType feeType = FeeType.PERCENTAGE;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal feeValue = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean isActive = true;
}

package hotelpms.booking.promo.entity;

import hotelpms.common.persistence.BaseEntity;
import hotelpms.pms.room.entity.RoomType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "promotional_packages")
@Getter
@Setter
@NoArgsConstructor
public class PromotionalPackage extends BaseEntity {

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountType discountType;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal discountValue;

    @Column(nullable = false)
    private LocalDate validFrom;

    @Column(nullable = false)
    private LocalDate validTo;

    @Column(nullable = false)
    private int minNights = 1;

    private Integer maxNights;

    @Column(nullable = false)
    private boolean isActive = true;

    /**
     * Empty set means the package applies to all room types.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "package_room_types",
        joinColumns = @JoinColumn(name = "package_id"),
        inverseJoinColumns = @JoinColumn(name = "room_type_id")
    )
    private Set<RoomType> applicableRoomTypes = new HashSet<>();
}

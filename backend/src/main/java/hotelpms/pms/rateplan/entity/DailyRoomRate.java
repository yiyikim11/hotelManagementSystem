package hotelpms.pms.rateplan.entity;

import hotelpms.common.persistence.BaseEntity;
import hotelpms.pms.room.entity.RoomType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "daily_room_rates",
       uniqueConstraints = @UniqueConstraint(columnNames = {"rate_plan_id", "room_type_id", "rate_date"}))
@Getter
@Setter
@NoArgsConstructor
public class DailyRoomRate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rate_plan_id", nullable = false)
    private RatePlan ratePlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    @Column(nullable = false)
    private LocalDate rateDate;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal rate;
}

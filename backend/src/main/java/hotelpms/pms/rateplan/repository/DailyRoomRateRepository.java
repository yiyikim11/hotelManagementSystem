package hotelpms.pms.rateplan.repository;

import hotelpms.pms.rateplan.entity.DailyRoomRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DailyRoomRateRepository extends JpaRepository<DailyRoomRate, UUID> {

    Optional<DailyRoomRate> findByRatePlanIdAndRoomTypeIdAndRateDate(
            UUID ratePlanId, UUID roomTypeId, LocalDate rateDate);

    @Query("""
        SELECT r FROM DailyRoomRate r
        WHERE r.ratePlan.id = :ratePlanId
          AND r.roomType.id = :roomTypeId
          AND r.rateDate BETWEEN :from AND :to
        ORDER BY r.rateDate
        """)
    List<DailyRoomRate> findByRatePlanAndRoomTypeAndDateRange(
            @Param("ratePlanId") UUID ratePlanId,
            @Param("roomTypeId") UUID roomTypeId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}

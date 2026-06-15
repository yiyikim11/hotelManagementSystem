package hotelpms.pms.rateplan.dto;

import hotelpms.pms.rateplan.entity.DailyRoomRate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DailyRoomRateResponse(
    UUID id,
    UUID ratePlanId,
    String ratePlanCode,
    UUID roomTypeId,
    String roomTypeCode,
    LocalDate rateDate,
    BigDecimal rate
) {
    public static DailyRoomRateResponse from(DailyRoomRate r) {
        return new DailyRoomRateResponse(
                r.getId(),
                r.getRatePlan().getId(), r.getRatePlan().getCode(),
                r.getRoomType().getId(), r.getRoomType().getCode(),
                r.getRateDate(), r.getRate());
    }
}

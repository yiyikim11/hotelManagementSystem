package hotelpms.pms.rateplan.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record DailyRoomRateRequest(
    @NotNull UUID ratePlanId,
    @NotNull UUID roomTypeId,
    @NotNull LocalDate rateDate,
    @NotNull @DecimalMin("0.00") BigDecimal rate
) {}

package hotelpms.pms.room.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record RoomTypeRequest(
    @NotBlank @Size(max = 20) String code,
    @NotBlank @Size(max = 100) String name,
    String description,
    @Min(1) int baseOccupancy,
    @Min(1) int maxOccupancy,
    @NotNull @DecimalMin("0.01") BigDecimal baseRate,
    @Size(min = 3, max = 3) String currency
) {}

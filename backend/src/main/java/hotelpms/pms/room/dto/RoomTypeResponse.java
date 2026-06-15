package hotelpms.pms.room.dto;

import hotelpms.pms.room.entity.RoomType;

import java.math.BigDecimal;
import java.util.UUID;

public record RoomTypeResponse(
    UUID id,
    String code,
    String name,
    String description,
    int baseOccupancy,
    int maxOccupancy,
    BigDecimal baseRate,
    String currency
) {
    public static RoomTypeResponse from(RoomType rt) {
        return new RoomTypeResponse(
                rt.getId(), rt.getCode(), rt.getName(), rt.getDescription(),
                rt.getBaseOccupancy(), rt.getMaxOccupancy(), rt.getBaseRate(), rt.getCurrency());
    }
}

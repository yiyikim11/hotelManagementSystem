package hotelpms.pms.room.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AvailabilityResponse(
    UUID roomTypeId,
    String roomTypeCode,
    String roomTypeName,
    long totalRooms,
    long occupiedRooms,
    long availableRooms,
    BigDecimal baseRate
) {}

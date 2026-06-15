package hotelpms.pms.report.dto;

import java.time.LocalDate;

public record OccupancyResponse(
    LocalDate date,
    long totalRooms,
    long occupiedRooms,
    double occupancyRate
) {}

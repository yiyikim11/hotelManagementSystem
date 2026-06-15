package hotelpms.pms.report.dto;

import java.math.BigDecimal;

public record DashboardResponse(
    long totalRooms,
    long availableRooms,
    long occupiedRooms,
    long arrivalsToday,
    long departuresToday,
    long inHouseGuests,
    long confirmedReservations,
    BigDecimal revenueToday
) {}

package hotelpms.pms.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RevenueResponse(
    LocalDate from,
    LocalDate to,
    BigDecimal totalRevenue,
    BigDecimal roomRevenue,
    BigDecimal otherRevenue,
    long totalFolios
) {}

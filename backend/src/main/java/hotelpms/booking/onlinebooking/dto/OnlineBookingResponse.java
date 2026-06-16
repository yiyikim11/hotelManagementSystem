package hotelpms.booking.onlinebooking.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OnlineBookingResponse(
    UUID reservationId,
    String confirmationNumber,
    BigDecimal totalAmount,
    String currency
) {}

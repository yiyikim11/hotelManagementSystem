package hotelpms.booking.onlinebooking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PayOnlineBookingRequest(
    @NotBlank @Size(max = 32) String gateway,
    String gatewayTransactionId,
    @NotNull @DecimalMin("0.01") BigDecimal amount,
    @Size(max = 3) String currency,
    @Size(max = 30) String paymentMethod,
    @Size(max = 30) String cardBrand,
    @Size(max = 4) String cardLast4
) {}

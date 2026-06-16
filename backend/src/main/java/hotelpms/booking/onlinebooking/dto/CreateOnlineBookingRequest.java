package hotelpms.booking.onlinebooking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateOnlineBookingRequest(
    @NotNull @Valid GuestDetails guest,
    @NotNull LocalDate arrivalDate,
    @NotNull LocalDate departureDate,
    @Min(1) int adults,
    @Min(0) int children,
    @NotNull UUID roomTypeId,
    UUID ratePlanId,
    String promoCode,
    String specialRequests
) {}

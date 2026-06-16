package hotelpms.booking.onlinebooking.dto;

import jakarta.validation.constraints.NotBlank;

public record CancelOnlineBookingRequest(
    @NotBlank String reason
) {}

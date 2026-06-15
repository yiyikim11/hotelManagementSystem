package hotelpms.pms.reservation.dto;

import jakarta.validation.constraints.NotBlank;

public record CancelReservationRequest(
    @NotBlank String reason
) {}

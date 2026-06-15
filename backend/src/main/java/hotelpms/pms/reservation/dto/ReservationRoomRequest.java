package hotelpms.pms.reservation.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ReservationRoomRequest(
    @NotNull UUID roomTypeId,
    UUID cancellationPolicyId
) {}

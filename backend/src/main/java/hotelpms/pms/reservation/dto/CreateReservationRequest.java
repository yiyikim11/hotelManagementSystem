package hotelpms.pms.reservation.dto;

import hotelpms.pms.reservation.entity.ReservationSource;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateReservationRequest(
    @NotNull UUID guestId,
    @NotNull UUID ratePlanId,
    @NotNull LocalDate arrivalDate,
    @NotNull LocalDate departureDate,
    @Min(1) int adults,
    @Min(0) int children,
    @NotNull ReservationSource source,
    @Size(max = 3) String currency,
    String specialRequests,
    boolean isDayUse,
    @NotEmpty @Valid List<ReservationRoomRequest> rooms
) {}

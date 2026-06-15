package hotelpms.pms.reservation.dto;

import hotelpms.pms.reservation.entity.Reservation;
import hotelpms.pms.reservation.entity.ReservationSource;
import hotelpms.pms.reservation.entity.ReservationStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ReservationResponse(
    UUID id,
    String confirmationNumber,
    UUID guestId,
    String guestName,
    ReservationStatus status,
    ReservationSource source,
    LocalDate arrivalDate,
    LocalDate departureDate,
    int adults,
    int children,
    UUID ratePlanId,
    String ratePlanCode,
    BigDecimal totalAmount,
    BigDecimal depositAmount,
    BigDecimal paidAmount,
    String currency,
    String specialRequests,
    String cancellationReason,
    Instant cancelledAt,
    boolean isDayUse,
    List<ReservationRoomResponse> rooms,
    Instant createdAt
) {
    public static ReservationResponse from(Reservation r) {
        return new ReservationResponse(
                r.getId(),
                r.getConfirmationNumber(),
                r.getGuest() != null ? r.getGuest().getId() : null,
                r.getGuest() != null ? r.getGuest().getFirstName() + " " + r.getGuest().getLastName() : null,
                r.getStatus(),
                r.getSource(),
                r.getArrivalDate(),
                r.getDepartureDate(),
                r.getAdults(),
                r.getChildren(),
                r.getRatePlan() != null ? r.getRatePlan().getId() : null,
                r.getRatePlan() != null ? r.getRatePlan().getCode() : null,
                r.getTotalAmount(),
                r.getDepositAmount(),
                r.getPaidAmount(),
                r.getCurrency(),
                r.getSpecialRequests(),
                r.getCancellationReason(),
                r.getCancelledAt(),
                r.isDayUse(),
                r.getRooms().stream().map(ReservationRoomResponse::from).toList(),
                r.getCreatedAt());
    }
}

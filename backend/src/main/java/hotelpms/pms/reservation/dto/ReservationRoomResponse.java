package hotelpms.pms.reservation.dto;

import hotelpms.pms.reservation.entity.ReservationRoom;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ReservationRoomResponse(
    UUID id,
    UUID roomId,
    String roomNumber,
    UUID roomTypeId,
    String roomTypeCode,
    UUID cancellationPolicyId,
    LocalDate arrivalDate,
    LocalDate departureDate,
    BigDecimal nightlyRate,
    BigDecimal totalAmount,
    Instant checkedInAt,
    Instant checkedOutAt
) {
    public static ReservationRoomResponse from(ReservationRoom rr) {
        return new ReservationRoomResponse(
                rr.getId(),
                rr.getRoom() != null ? rr.getRoom().getId() : null,
                rr.getRoom() != null ? rr.getRoom().getRoomNumber() : null,
                rr.getRoomType() != null ? rr.getRoomType().getId() : null,
                rr.getRoomType() != null ? rr.getRoomType().getCode() : null,
                rr.getCancellationPolicy() != null ? rr.getCancellationPolicy().getId() : null,
                rr.getArrivalDate(), rr.getDepartureDate(),
                rr.getNightlyRate(), rr.getTotalAmount(),
                rr.getCheckedInAt(), rr.getCheckedOutAt());
    }
}

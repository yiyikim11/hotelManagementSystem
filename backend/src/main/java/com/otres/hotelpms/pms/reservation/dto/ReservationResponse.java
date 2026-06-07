package com.otres.hotelpms.pms.reservation.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ReservationResponse(
    UUID id,
    UUID guestId,
    UUID roomId,
    LocalDate checkIn,
    LocalDate checkOut,
    String status,
    Instant createdAt
) {
}

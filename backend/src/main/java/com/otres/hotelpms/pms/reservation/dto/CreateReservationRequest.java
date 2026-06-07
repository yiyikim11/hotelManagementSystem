package com.otres.hotelpms.pms.reservation.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreateReservationRequest(
    @NotNull UUID guestId,
    @NotNull UUID roomId,
    @NotNull LocalDate checkIn,
    @NotNull LocalDate checkOut
) {
}

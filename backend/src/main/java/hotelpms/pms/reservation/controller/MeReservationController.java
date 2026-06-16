package hotelpms.pms.reservation.controller;

import hotelpms.pms.reservation.dto.CancelReservationRequest;
import hotelpms.pms.reservation.dto.ReservationResponse;
import hotelpms.pms.reservation.service.MeReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/me/reservations")
@RequiredArgsConstructor
public class MeReservationController {

    private final MeReservationService meReservationService;

    @GetMapping
    @PreAuthorize("hasAuthority('MY_BOOKING_READ')")
    public ResponseEntity<Page<ReservationResponse>> list(
            @AuthenticationPrincipal UserDetails principal,
            Pageable pageable) {
        return ResponseEntity.ok(meReservationService.list(principal.getUsername(), pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MY_BOOKING_READ')")
    public ResponseEntity<ReservationResponse> get(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(meReservationService.findById(principal.getUsername(), id));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('MY_BOOKING_WRITE')")
    public ResponseEntity<ReservationResponse> cancel(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id,
            @Valid @RequestBody CancelReservationRequest request) {
        return ResponseEntity.ok(meReservationService.cancel(principal.getUsername(), id, request));
    }
}

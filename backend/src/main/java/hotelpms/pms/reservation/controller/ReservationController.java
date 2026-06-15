package hotelpms.pms.reservation.controller;

import hotelpms.pms.reservation.dto.CancelReservationRequest;
import hotelpms.pms.reservation.dto.CreateReservationRequest;
import hotelpms.pms.reservation.dto.ReservationResponse;
import hotelpms.pms.reservation.entity.ReservationStatus;
import hotelpms.pms.reservation.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pms/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ResponseEntity<Page<ReservationResponse>> list(
            @RequestParam(required = false) ReservationStatus status,
            Pageable pageable) {
        if (status != null) {
            return ResponseEntity.ok(reservationService.listByStatus(status, pageable));
        }
        return ResponseEntity.ok(reservationService.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(reservationService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ReservationResponse> create(@Valid @RequestBody CreateReservationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.create(request));
    }

    @PostMapping("/{id}/check-in")
    public ResponseEntity<ReservationResponse> checkIn(@PathVariable UUID id) {
        return ResponseEntity.ok(reservationService.checkIn(id));
    }

    @PostMapping("/{id}/check-out")
    public ResponseEntity<ReservationResponse> checkOut(@PathVariable UUID id) {
        return ResponseEntity.ok(reservationService.checkOut(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancel(@PathVariable UUID id,
                                                      @Valid @RequestBody CancelReservationRequest request) {
        return ResponseEntity.ok(reservationService.cancel(id, request));
    }

    @PostMapping("/{id}/no-show")
    public ResponseEntity<ReservationResponse> noShow(@PathVariable UUID id) {
        return ResponseEntity.ok(reservationService.noShow(id));
    }

    @GetMapping("/arrivals")
    public ResponseEntity<List<ReservationResponse>> arrivals(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getArrivals(date));
    }

    @GetMapping("/departures")
    public ResponseEntity<List<ReservationResponse>> departures(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getDepartures(date));
    }

    @GetMapping("/in-house")
    public ResponseEntity<List<ReservationResponse>> inHouse(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reservationService.getInHouse(date));
    }
}

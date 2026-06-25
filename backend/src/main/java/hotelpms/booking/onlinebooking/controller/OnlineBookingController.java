package hotelpms.booking.onlinebooking.controller;

import hotelpms.booking.onlinebooking.dto.*;
import hotelpms.booking.onlinebooking.service.OnlineBookingService;
import hotelpms.booking.promo.dto.PromotionalPackageResponse;
import hotelpms.booking.promo.dto.PromoValidateRequest;
import hotelpms.booking.promo.dto.PromoValidateResponse;
import hotelpms.booking.promo.dto.PublicPromoCodeResponse;
import hotelpms.booking.promo.service.PromotionService;
import hotelpms.pms.reservation.dto.ReservationResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
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

/**
 * Public endpoints for the customer booking site. No authentication required.
 * These paths are explicitly listed in SecurityConfig.permitAll().
 */
@RestController
@RequiredArgsConstructor
public class OnlineBookingController {

    private final OnlineBookingService onlineBookingService;
    private final PromotionService promotionService;

    @GetMapping("/public/offers")
    public ResponseEntity<List<PromotionalPackageResponse>> listOffers(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) UUID roomTypeId) {
        return ResponseEntity.ok(promotionService.listActiveOffers(from, to, roomTypeId));
    }

    @GetMapping("/public/promo/codes")
    public ResponseEntity<List<PublicPromoCodeResponse>> listPromoCodes() {
        return ResponseEntity.ok(promotionService.listPublicPromoCodes());
    }

    @PostMapping("/public/promo/validate")
    public ResponseEntity<PromoValidateResponse> validatePromo(
            @Valid @RequestBody PromoValidateRequest request) {
        return ResponseEntity.ok(promotionService.validatePromo(
            request.code(),
            request.arrivalDate(),
            request.departureDate(),
            request.roomTypeId()));
    }

    @GetMapping("/public/bookings/{id}")
    public ResponseEntity<ReservationResponse> getBooking(@PathVariable UUID id) {
        return ResponseEntity.ok(onlineBookingService.getById(id));
    }

    @PostMapping("/public/bookings")
    public ResponseEntity<OnlineBookingResponse> createBooking(
            @Valid @RequestBody CreateOnlineBookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(onlineBookingService.createBooking(request));
    }

    @PostMapping("/public/bookings/{id}/pay")
    public ResponseEntity<ReservationResponse> pay(
            @PathVariable UUID id,
            @Valid @RequestBody PayOnlineBookingRequest request) {
        return ResponseEntity.ok(onlineBookingService.pay(id, request));
    }

    @GetMapping("/public/bookings")
    public ResponseEntity<Page<ReservationResponse>> listByEmail(
            @RequestParam @Email String email,
            Pageable pageable) {
        return ResponseEntity.ok(onlineBookingService.listByEmail(email, pageable));
    }

    @PostMapping("/public/bookings/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancel(
            @PathVariable UUID id,
            @Valid @RequestBody CancelOnlineBookingRequest request) {
        return ResponseEntity.ok(onlineBookingService.cancel(id, request.reason()));
    }
}

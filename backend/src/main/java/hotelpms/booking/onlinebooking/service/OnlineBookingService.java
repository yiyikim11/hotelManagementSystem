package hotelpms.booking.onlinebooking.service;

import hotelpms.booking.onlinebooking.dto.*;
import hotelpms.booking.payment.service.OnlinePaymentService;
import hotelpms.booking.promo.entity.PromoCode;
import hotelpms.booking.promo.entity.PromotionalPackage;
import hotelpms.booking.promo.entity.ReservationPromoCode;
import hotelpms.booking.promo.repository.PromoCodeRepository;
import hotelpms.booking.promo.repository.ReservationPromoCodeRepository;
import hotelpms.booking.promo.service.PromotionService;
import hotelpms.booking.websitelisting.service.WebsiteRoomListingService;
import hotelpms.common.exception.ConflictException;
import hotelpms.common.exception.NotFoundException;
import hotelpms.pms.guest.entity.Guest;
import hotelpms.pms.guest.repository.GuestRepository;
import hotelpms.pms.rateplan.repository.RatePlanRepository;
import hotelpms.pms.reservation.dto.CreateReservationRequest;
import hotelpms.pms.reservation.dto.ReservationResponse;
import hotelpms.pms.reservation.dto.ReservationRoomRequest;
import hotelpms.pms.reservation.entity.Reservation;
import hotelpms.pms.reservation.entity.ReservationSource;
import hotelpms.pms.reservation.entity.ReservationStatus;
import hotelpms.pms.reservation.repository.ReservationRepository;
import hotelpms.pms.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OnlineBookingService {

    private static final Pattern EMAIL_PATTERN =
        Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final ReservationService reservationService;
    private final ReservationRepository reservationRepository;
    private final GuestRepository guestRepository;
    private final RatePlanRepository ratePlanRepository;
    private final PromotionService promotionService;
    private final PromoCodeRepository promoCodeRepository;
    private final ReservationPromoCodeRepository reservationPromoCodeRepository;
    private final OnlinePaymentService paymentService;
    private final WebsiteRoomListingService websiteRoomListingService;

    // ── Create booking ────────────────────────────────────────────────────────

    @Transactional
    public OnlineBookingResponse createBooking(CreateOnlineBookingRequest req) {
        if (!req.arrivalDate().isBefore(req.departureDate())) {
            throw new IllegalArgumentException("Departure date must be after arrival date");
        }
        if (!websiteRoomListingService.isPubliclyBookable(req.roomTypeId())) {
            throw new NotFoundException("Published room type not found: " + req.roomTypeId());
        }

        // 1. Upsert guest by email
        Guest guest = upsertGuest(req.guest());

        // 2. Resolve rate plan: use the one provided, or fall back to the first available
        UUID ratePlanId = req.ratePlanId();
        if (ratePlanId == null) {
            ratePlanId = ratePlanRepository.findAll(
                    org.springframework.data.domain.PageRequest.of(0, 1))
                .stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No rate plan configured"))
                .getId();
        }
        final UUID resolvedRatePlanId = ratePlanId;

        // 3. Validate promo code (don't claim yet — claim happens at pay time)
        PromoCode promoCode = null;
        if (StringUtils.hasText(req.promoCode())) {
            var validation = promotionService.validatePromo(
                req.promoCode(), req.arrivalDate(), req.departureDate(), req.roomTypeId());
            promoCode = promoCodeRepository.findById(validation.promoCodeId())
                .orElseThrow(() -> NotFoundException.of("PromoCode", validation.promoCodeId()));
        }

        // 4. Create reservation in PENDING_PAYMENT status
        CreateReservationRequest resReq = new CreateReservationRequest(
            guest.getId(),
            resolvedRatePlanId,
            req.arrivalDate(),
            req.departureDate(),
            req.adults(),
            req.children(),
            ReservationSource.WEBSITE,
            null,
            req.specialRequests(),
            false,
            List.of(new ReservationRoomRequest(req.roomTypeId(), null))
        );
        ReservationResponse created = reservationService.create(resReq, ReservationStatus.PENDING_PAYMENT);

        // 5. Apply promo discount and record the link (claim happens at pay-time)
        BigDecimal finalTotal = created.totalAmount();
        if (promoCode != null) {
            BigDecimal discountAmount = computeDiscount(
                promoCode.getPromotionalPackage(), created.totalAmount());

            // Use the updated response so finalTotal reflects the persisted value
            ReservationResponse discounted = reservationService.applyDiscount(created.id(), discountAmount);
            finalTotal = discounted.totalAmount();

            // reservation_promo_codes PK = reservation_id (UUID) — see ReservationPromoCode entity
            Reservation resEntity = reservationRepository.findById(created.id())
                .orElseThrow(() -> NotFoundException.of("Reservation", created.id()));
            ReservationPromoCode rpc = new ReservationPromoCode();
            rpc.setReservation(resEntity);
            rpc.setPromoCode(promoCode);
            rpc.setDiscountApplied(discountAmount);
            rpc.setAppliedAt(Instant.now());
            reservationPromoCodeRepository.save(rpc);
        }

        return new OnlineBookingResponse(
            created.id(),
            created.confirmationNumber(),
            finalTotal,
            created.currency()
        );
    }

    // ── Get by ID ─────────────────────────────────────────────────────────────

    public ReservationResponse getById(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> NotFoundException.of("Reservation", reservationId));
        return ReservationResponse.from(reservation);
    }

    // ── Pay ───────────────────────────────────────────────────────────────────

    @Transactional
    public ReservationResponse pay(UUID reservationId, PayOnlineBookingRequest req) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> NotFoundException.of("Reservation", reservationId));

        if (reservation.getStatus() == ReservationStatus.CONFIRMED) {
            throw new ConflictException("Reservation is already paid and confirmed");
        }
        if (reservation.getStatus() != ReservationStatus.PENDING_PAYMENT) {
            throw new ConflictException(
                "Cannot pay for reservation with status: " + reservation.getStatus());
        }

        // Record mock payment transaction
        paymentService.record(reservation, req);

        // Transition to CONFIRMED
        ReservationResponse result = reservationService.confirmPayment(reservationId, req.amount());

        // Atomically claim promo usage if one was applied at booking time.
        // findById uses the reservation UUID as PK — see ReservationPromoCode @Id/@MapsId.
        reservationPromoCodeRepository.findById(reservationId)
            .ifPresent(rpc -> promotionService.claimUsage(rpc.getPromoCode().getId()));

        return result;
    }

    // ── List by email ─────────────────────────────────────────────────────────

    public Page<ReservationResponse> listByEmail(String email, Pageable pageable) {
        if (!StringUtils.hasText(email) || !EMAIL_PATTERN.matcher(email.strip()).matches()) {
            throw new IllegalArgumentException("A valid email address is required");
        }
        return reservationRepository
            .findByGuest_EmailAndGuest_DeletedAtIsNull(email.strip(), pageable)
            .map(ReservationResponse::from);
    }

    // ── Cancel ────────────────────────────────────────────────────────────────

    @Transactional
    public ReservationResponse cancel(UUID reservationId, String reason) {
        if (!StringUtils.hasText(reason)) {
            throw new IllegalArgumentException("Cancellation reason must not be blank");
        }

        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> NotFoundException.of("Reservation", reservationId));

        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new ConflictException(
                "Only CONFIRMED reservations can be cancelled via the guest portal, " +
                "current status: " + reservation.getStatus());
        }

        // Arrival must be strictly more than 24 hours from now (i.e. at least 2 days out)
        if (!reservation.getArrivalDate().isAfter(LocalDate.now().plusDays(1))) {
            throw new ConflictException(
                "Cancellation is not allowed within 24 hours of the arrival date");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancellationReason(reason);
        reservation.setCancelledAt(Instant.now());
        return ReservationResponse.from(reservationRepository.save(reservation));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Guest upsertGuest(GuestDetails details) {
        return guestRepository.findByEmailAndDeletedAtIsNull(details.email())
            .map(existing -> {
                // Update only fields that are currently blank
                if (!StringUtils.hasText(existing.getFirstName())) {
                    existing.setFirstName(details.firstName());
                }
                if (!StringUtils.hasText(existing.getLastName())) {
                    existing.setLastName(details.lastName());
                }
                if (!StringUtils.hasText(existing.getPhone())) {
                    existing.setPhone(details.phone());
                }
                return guestRepository.save(existing);
            })
            .orElseGet(() -> {
                Guest g = new Guest();
                g.setFirstName(details.firstName());
                g.setLastName(details.lastName());
                g.setEmail(details.email());
                g.setPhone(details.phone());
                return guestRepository.save(g);
            });
    }

    /**
     * Computes the discount amount from a package's discount type and value.
     * Returns zero if pkg is null (code has no linked package).
     */
    private BigDecimal computeDiscount(PromotionalPackage pkg, BigDecimal totalAmount) {
        if (pkg == null) {
            return BigDecimal.ZERO;
        }
        return switch (pkg.getDiscountType()) {
            case PERCENTAGE -> totalAmount
                .multiply(pkg.getDiscountValue())
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)
                .min(totalAmount);
            case FIXED_AMOUNT -> pkg.getDiscountValue().min(totalAmount);
        };
    }
}

package hotelpms.pms.reservation.service;

import hotelpms.common.exception.ConflictException;
import hotelpms.common.exception.NotFoundException;
import hotelpms.pms.cancellationpolicy.entity.CancellationPolicy;
import hotelpms.pms.cancellationpolicy.repository.CancellationPolicyRepository;
import hotelpms.pms.guest.entity.Guest;
import hotelpms.pms.guest.repository.GuestRepository;
import hotelpms.pms.rateplan.entity.DailyRoomRate;
import hotelpms.pms.rateplan.entity.RatePlan;
import hotelpms.pms.rateplan.repository.DailyRoomRateRepository;
import hotelpms.pms.rateplan.repository.RatePlanRepository;
import hotelpms.pms.reservation.dto.CancelReservationRequest;
import hotelpms.pms.reservation.dto.CreateReservationRequest;
import hotelpms.pms.reservation.dto.ReservationResponse;
import hotelpms.pms.reservation.dto.ReservationRoomRequest;
import hotelpms.pms.reservation.entity.Reservation;
import hotelpms.pms.reservation.entity.ReservationRoom;
import hotelpms.pms.reservation.entity.ReservationStatus;
import hotelpms.pms.reservation.repository.ReservationRepository;
import hotelpms.pms.reservation.repository.ReservationRoomRepository;
import hotelpms.pms.room.entity.RoomType;
import hotelpms.pms.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationRoomRepository reservationRoomRepository;
    private final GuestRepository guestRepository;
    private final RatePlanRepository ratePlanRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final CancellationPolicyRepository cancellationPolicyRepository;
    private final DailyRoomRateRepository dailyRoomRateRepository;

    public Page<ReservationResponse> list(Pageable pageable) {
        return reservationRepository.findAll(pageable).map(ReservationResponse::from);
    }

    public Page<ReservationResponse> listByStatus(ReservationStatus status, Pageable pageable) {
        return reservationRepository.findByStatus(status, pageable).map(ReservationResponse::from);
    }

    public ReservationResponse findById(UUID id) {
        return ReservationResponse.from(get(id));
    }

    @Transactional
    public ReservationResponse create(CreateReservationRequest req) {
        if (req.arrivalDate().isAfter(req.departureDate()) || req.arrivalDate().equals(req.departureDate())) {
            throw new IllegalArgumentException("Departure date must be after arrival date");
        }

        Guest guest = guestRepository.findById(req.guestId())
                .orElseThrow(() -> NotFoundException.of("Guest", req.guestId()));
        RatePlan ratePlan = ratePlanRepository.findById(req.ratePlanId())
                .orElseThrow(() -> NotFoundException.of("RatePlan", req.ratePlanId()));

        Reservation reservation = new Reservation();
        reservation.setConfirmationNumber(generateConfirmationNumber());
        reservation.setGuest(guest);
        reservation.setRatePlan(ratePlan);
        reservation.setStatus(ReservationStatus.CONFIRMED);
        reservation.setSource(req.source());
        reservation.setArrivalDate(req.arrivalDate());
        reservation.setDepartureDate(req.departureDate());
        reservation.setAdults(req.adults());
        reservation.setChildren(req.children());
        reservation.setCurrency(req.currency() != null ? req.currency() : "USD");
        reservation.setSpecialRequests(req.specialRequests());
        reservation.setDayUse(req.isDayUse());

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (ReservationRoomRequest roomReq : req.rooms()) {
            ReservationRoom rr = buildReservationRoom(reservation, roomReq, req.arrivalDate(), req.departureDate(), ratePlan);
            reservation.getRooms().add(rr);
            totalAmount = totalAmount.add(rr.getTotalAmount());
        }
        reservation.setTotalAmount(totalAmount);

        return ReservationResponse.from(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationResponse checkIn(UUID id) {
        Reservation reservation = get(id);
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new ConflictException("Only CONFIRMED reservations can be checked in, current status: " + reservation.getStatus());
        }
        reservation.setStatus(ReservationStatus.CHECKED_IN);
        Instant now = Instant.now();
        reservation.getRooms().forEach(rr -> rr.setCheckedInAt(now));
        return ReservationResponse.from(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationResponse checkOut(UUID id) {
        Reservation reservation = get(id);
        if (reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            throw new ConflictException("Only CHECKED_IN reservations can be checked out, current status: " + reservation.getStatus());
        }
        reservation.setStatus(ReservationStatus.CHECKED_OUT);
        Instant now = Instant.now();
        reservation.getRooms().forEach(rr -> rr.setCheckedOutAt(now));
        return ReservationResponse.from(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationResponse cancel(UUID id, CancelReservationRequest req) {
        Reservation reservation = get(id);
        if (reservation.getStatus() == ReservationStatus.CHECKED_OUT
                || reservation.getStatus() == ReservationStatus.CANCELLED
                || reservation.getStatus() == ReservationStatus.NO_SHOW) {
            throw new ConflictException("Cannot cancel reservation with status: " + reservation.getStatus());
        }
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCancellationReason(req.reason());
        reservation.setCancelledAt(Instant.now());
        return ReservationResponse.from(reservationRepository.save(reservation));
    }

    @Transactional
    public ReservationResponse noShow(UUID id) {
        Reservation reservation = get(id);
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new ConflictException("Only CONFIRMED reservations can be marked no-show, current status: " + reservation.getStatus());
        }
        reservation.setStatus(ReservationStatus.NO_SHOW);
        return ReservationResponse.from(reservationRepository.save(reservation));
    }

    public List<ReservationResponse> getArrivals(LocalDate date) {
        return reservationRepository.findArrivalsForDate(date).stream()
                .map(ReservationResponse::from).toList();
    }

    public List<ReservationResponse> getDepartures(LocalDate date) {
        return reservationRepository.findDeparturesForDate(date).stream()
                .map(ReservationResponse::from).toList();
    }

    public List<ReservationResponse> getInHouse(LocalDate date) {
        return reservationRepository.findInHouseForDate(date).stream()
                .map(ReservationResponse::from).toList();
    }

    private ReservationRoom buildReservationRoom(Reservation reservation, ReservationRoomRequest req,
                                                  LocalDate arrival, LocalDate departure, RatePlan ratePlan) {
        RoomType roomType = roomTypeRepository.findById(req.roomTypeId())
                .orElseThrow(() -> NotFoundException.of("RoomType", req.roomTypeId()));

        CancellationPolicy policy = null;
        if (req.cancellationPolicyId() != null) {
            policy = cancellationPolicyRepository.findById(req.cancellationPolicyId())
                    .orElseThrow(() -> NotFoundException.of("CancellationPolicy", req.cancellationPolicyId()));
        }

        BigDecimal nightlyRate = computeNightlyRate(ratePlan, roomType, arrival);
        long nights = arrival.until(departure).getDays();
        BigDecimal totalAmount = nightlyRate.multiply(BigDecimal.valueOf(nights));

        ReservationRoom rr = new ReservationRoom();
        rr.setReservation(reservation);
        rr.setRoomType(roomType);
        rr.setCancellationPolicy(policy);
        rr.setArrivalDate(arrival);
        rr.setDepartureDate(departure);
        rr.setNightlyRate(nightlyRate);
        rr.setTotalAmount(totalAmount);
        return rr;
    }

    private BigDecimal computeNightlyRate(RatePlan ratePlan, RoomType roomType, LocalDate date) {
        return dailyRoomRateRepository
                .findByRatePlanIdAndRoomTypeIdAndRateDate(ratePlan.getId(), roomType.getId(), date)
                .map(DailyRoomRate::getRate)
                .orElse(roomType.getBaseRate());
    }

    private Reservation get(UUID id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Reservation", id));
    }

    private static final AtomicInteger COUNTER = new AtomicInteger(
            (int) (System.currentTimeMillis() % 10000));

    private String generateConfirmationNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String seq = String.format("%05d", COUNTER.incrementAndGet() % 100000);
        return "RES-" + date + "-" + seq;
    }
}

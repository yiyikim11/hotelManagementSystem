package hotelpms.pms.reservation.service;

import hotelpms.common.exception.NotFoundException;
import hotelpms.common.exception.ConflictException;
import hotelpms.common.user.repository.UserRepository;
import hotelpms.pms.guest.entity.Guest;
import hotelpms.pms.guest.repository.GuestRepository;
import hotelpms.pms.reservation.dto.CancelReservationRequest;
import hotelpms.pms.reservation.dto.ReservationResponse;
import hotelpms.pms.reservation.entity.Reservation;
import hotelpms.pms.reservation.entity.ReservationStatus;
import hotelpms.pms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MeReservationService {

    private final UserRepository userRepository;
    private final GuestRepository guestRepository;
    private final ReservationRepository reservationRepository;

    public Page<ReservationResponse> list(String email, Pageable pageable) {
        Guest guest = resolveGuest(email);
        return reservationRepository.findByGuest_Id(guest.getId(), pageable)
                .map(ReservationResponse::from);
    }

    public ReservationResponse findById(String email, UUID reservationId) {
        Guest guest = resolveGuest(email);
        Reservation reservation = getReservation(reservationId);
        assertOwnership(reservation, guest);
        return ReservationResponse.from(reservation);
    }

    @Transactional
    public ReservationResponse cancel(String email, UUID reservationId, CancelReservationRequest req) {
        Guest guest = resolveGuest(email);
        Reservation reservation = getReservation(reservationId);
        assertOwnership(reservation, guest);
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

    private Guest resolveGuest(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found: " + email));
        return guestRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("No guest profile linked to this account"));
    }

    private Reservation getReservation(UUID id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Reservation", id));
    }

    private void assertOwnership(Reservation reservation, Guest guest) {
        if (!reservation.getGuest().getId().equals(guest.getId())) {
            throw new AccessDeniedException("Access denied");
        }
    }
}

package hotelpms.pms.folio.service;

import hotelpms.common.exception.ConflictException;
import hotelpms.common.exception.NotFoundException;
import hotelpms.common.user.entity.User;
import hotelpms.common.user.repository.UserRepository;
import hotelpms.pms.folio.dto.FolioResponse;
import hotelpms.pms.folio.dto.PostFolioItemRequest;
import hotelpms.pms.folio.entity.Folio;
import hotelpms.pms.folio.entity.FolioItem;
import hotelpms.pms.folio.entity.FolioStatus;
import hotelpms.pms.folio.repository.FolioRepository;
import hotelpms.pms.reservation.entity.Reservation;
import hotelpms.pms.reservation.entity.ReservationStatus;
import hotelpms.pms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FolioService {

    private final FolioRepository folioRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public FolioResponse findByReservation(UUID reservationId) {
        return FolioResponse.from(getFolioByReservation(reservationId));
    }

    public FolioResponse findById(UUID id) {
        return FolioResponse.from(getById(id));
    }

    @Transactional
    public FolioResponse openForReservation(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> NotFoundException.of("Reservation", reservationId));
        if (reservation.getStatus() != ReservationStatus.CHECKED_IN) {
            throw new ConflictException("Folio can only be opened for CHECKED_IN reservations");
        }
        if (folioRepository.findByReservationId(reservationId).isPresent()) {
            throw new ConflictException("Folio already exists for reservation: " + reservationId);
        }
        Folio folio = new Folio();
        folio.setReservation(reservation);
        folio.setGuest(reservation.getGuest());
        folio.setStatus(FolioStatus.OPEN);
        folio.setTotalAmount(BigDecimal.ZERO);
        folio.setPaidAmount(BigDecimal.ZERO);
        return FolioResponse.from(folioRepository.save(folio));
    }

    @Transactional
    public FolioResponse postCharge(UUID folioId, PostFolioItemRequest req, String actorEmail) {
        Folio folio = getById(folioId);
        if (folio.getStatus() != FolioStatus.OPEN) {
            throw new ConflictException("Cannot post charges to a closed folio");
        }
        User postedBy = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> NotFoundException.of("User", actorEmail));

        BigDecimal amount = req.unitPrice().multiply(BigDecimal.valueOf(req.quantity()));

        FolioItem item = new FolioItem();
        item.setFolio(folio);
        item.setChargeType(req.chargeType());
        item.setDescription(req.description());
        item.setQuantity(req.quantity());
        item.setUnitPrice(req.unitPrice());
        item.setAmount(amount);
        item.setPostedBy(postedBy);
        item.setPostedAt(Instant.now());
        folio.getItems().add(item);

        folio.setTotalAmount(folio.getTotalAmount().add(amount));
        return FolioResponse.from(folioRepository.save(folio));
    }

    @Transactional
    public FolioResponse voidItem(UUID folioId, UUID itemId, String actorEmail) {
        Folio folio = getById(folioId);
        if (folio.getStatus() != FolioStatus.OPEN) {
            throw new ConflictException("Cannot void items on a closed folio");
        }
        FolioItem item = folio.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> NotFoundException.of("FolioItem", itemId));
        if (item.getVoidedAt() != null) {
            throw new ConflictException("Item is already voided");
        }
        User voidedBy = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> NotFoundException.of("User", actorEmail));

        item.setVoidedAt(Instant.now());
        item.setVoidedBy(voidedBy);
        folio.setTotalAmount(folio.getTotalAmount().subtract(item.getAmount()));
        return FolioResponse.from(folioRepository.save(folio));
    }

    @Transactional
    public FolioResponse close(UUID folioId) {
        Folio folio = getById(folioId);
        if (folio.getStatus() != FolioStatus.OPEN) {
            throw new ConflictException("Folio is already closed");
        }
        folio.setStatus(FolioStatus.CLOSED);
        folio.setSettledAt(Instant.now());
        return FolioResponse.from(folioRepository.save(folio));
    }

    private Folio getById(UUID id) {
        return folioRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Folio", id));
    }

    private Folio getFolioByReservation(UUID reservationId) {
        return folioRepository.findByReservationId(reservationId)
                .orElseThrow(() -> NotFoundException.of("Folio for reservation", reservationId));
    }
}

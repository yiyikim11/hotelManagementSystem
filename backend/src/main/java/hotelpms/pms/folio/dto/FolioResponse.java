package hotelpms.pms.folio.dto;

import hotelpms.pms.folio.entity.Folio;
import hotelpms.pms.folio.entity.FolioStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record FolioResponse(
    UUID id,
    UUID reservationId,
    String confirmationNumber,
    UUID guestId,
    String guestName,
    FolioStatus status,
    BigDecimal totalAmount,
    BigDecimal paidAmount,
    Instant settledAt,
    List<FolioItemResponse> items
) {
    public static FolioResponse from(Folio folio) {
        String guestName = null;
        if (folio.getGuest() != null) {
            String first = folio.getGuest().getFirstName();
            String last = folio.getGuest().getLastName();
            guestName = (first != null ? first : "") + " " + (last != null ? last : "");
            guestName = guestName.trim();
        }
        List<FolioItemResponse> items = folio.getItems() != null
                ? folio.getItems().stream().map(FolioItemResponse::from).toList()
                : List.of();
        return new FolioResponse(
                folio.getId(),
                folio.getReservation() != null ? folio.getReservation().getId() : null,
                folio.getReservation() != null ? folio.getReservation().getConfirmationNumber() : null,
                folio.getGuest() != null ? folio.getGuest().getId() : null,
                guestName,
                folio.getStatus(),
                folio.getTotalAmount(),
                folio.getPaidAmount(),
                folio.getSettledAt(),
                items);
    }
}

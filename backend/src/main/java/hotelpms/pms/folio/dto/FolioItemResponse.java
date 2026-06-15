package hotelpms.pms.folio.dto;

import hotelpms.pms.folio.entity.ChargeType;
import hotelpms.pms.folio.entity.FolioItem;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FolioItemResponse(
    UUID id,
    ChargeType chargeType,
    String description,
    BigDecimal amount,
    int quantity,
    BigDecimal unitPrice,
    UUID postedById,
    Instant postedAt,
    UUID voidedById,
    Instant voidedAt
) {
    public static FolioItemResponse from(FolioItem fi) {
        return new FolioItemResponse(
                fi.getId(),
                fi.getChargeType(),
                fi.getDescription(),
                fi.getAmount(),
                fi.getQuantity(),
                fi.getUnitPrice(),
                fi.getPostedBy() != null ? fi.getPostedBy().getId() : null,
                fi.getPostedAt(),
                fi.getVoidedBy() != null ? fi.getVoidedBy().getId() : null,
                fi.getVoidedAt());
    }
}

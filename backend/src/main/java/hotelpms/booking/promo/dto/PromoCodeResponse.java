package hotelpms.booking.promo.dto;

import hotelpms.booking.promo.entity.PromoCode;

import java.time.Instant;
import java.util.UUID;

public record PromoCodeResponse(
    UUID id,
    String code,
    UUID packageId,
    String packageCode,
    Integer usageLimit,
    int usageCount,
    Instant validFrom,
    Instant validTo,
    boolean isActive,
    Instant createdAt
) {
    public static PromoCodeResponse from(PromoCode c) {
        return new PromoCodeResponse(
            c.getId(),
            c.getCode(),
            c.getPromotionalPackage() != null ? c.getPromotionalPackage().getId() : null,
            c.getPromotionalPackage() != null ? c.getPromotionalPackage().getCode() : null,
            c.getUsageLimit(),
            c.getUsageCount(),
            c.getValidFrom(),
            c.getValidTo(),
            c.isActive(),
            c.getCreatedAt()
        );
    }
}

package hotelpms.booking.promo.dto;

import hotelpms.booking.promo.entity.DiscountType;
import hotelpms.booking.promo.entity.PromotionalPackage;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public record PromotionalPackageResponse(
    UUID id,
    String code,
    String name,
    String description,
    DiscountType discountType,
    BigDecimal discountValue,
    LocalDate validFrom,
    LocalDate validTo,
    int minNights,
    Integer maxNights,
    boolean isActive,
    Set<UUID> roomTypeIds,
    Instant createdAt
) {
    public static PromotionalPackageResponse from(PromotionalPackage p) {
        return new PromotionalPackageResponse(
            p.getId(),
            p.getCode(),
            p.getName(),
            p.getDescription(),
            p.getDiscountType(),
            p.getDiscountValue(),
            p.getValidFrom(),
            p.getValidTo(),
            p.getMinNights(),
            p.getMaxNights(),
            p.isActive(),
            p.getApplicableRoomTypes().stream()
                .map(rt -> rt.getId())
                .collect(Collectors.toSet()),
            p.getCreatedAt()
        );
    }
}

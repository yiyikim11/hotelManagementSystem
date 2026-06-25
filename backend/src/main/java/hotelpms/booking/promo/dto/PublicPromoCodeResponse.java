package hotelpms.booking.promo.dto;

import hotelpms.booking.promo.entity.DiscountType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Customer-facing view of an applicable promo code. Exposes the code string and
 * the discount terms from its linked package so the booking site can list codes
 * a guest may apply. Never exposes usage counts or internal IDs.
 */
public record PublicPromoCodeResponse(
    String code,
    String packageName,
    String description,
    DiscountType discountType,
    BigDecimal discountValue,
    int minNights,
    Integer maxNights,
    LocalDate validFrom,
    LocalDate validTo,
    List<UUID> applicableRoomTypeIds
) {}

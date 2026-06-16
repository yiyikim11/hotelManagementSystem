package hotelpms.booking.promo.dto;

import hotelpms.booking.promo.entity.DiscountType;

import java.math.BigDecimal;
import java.util.UUID;

public record PromoValidateResponse(
    UUID promoCodeId,
    UUID packageId,
    String packageCode,
    DiscountType discountType,
    BigDecimal discountValue,
    int minNights
) {}

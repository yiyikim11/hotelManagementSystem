package hotelpms.booking.promo.dto;

import hotelpms.booking.promo.entity.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

public record PromotionalPackageRequest(
    @NotBlank @Size(max = 32) String code,
    @NotBlank @Size(max = 128) String name,
    String description,
    @NotNull DiscountType discountType,
    @NotNull @DecimalMin("0.01") BigDecimal discountValue,
    @NotNull LocalDate validFrom,
    @NotNull LocalDate validTo,
    @Min(1) int minNights,
    Integer maxNights,
    Boolean isActive,
    Set<UUID> roomTypeIds
) {}

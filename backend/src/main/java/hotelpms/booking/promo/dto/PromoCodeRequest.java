package hotelpms.booking.promo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public record PromoCodeRequest(
    @NotBlank @Size(max = 32) String code,
    UUID packageId,
    Integer usageLimit,
    @NotNull Instant validFrom,
    @NotNull Instant validTo,
    Boolean isActive
) {}

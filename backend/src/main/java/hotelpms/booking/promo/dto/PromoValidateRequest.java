package hotelpms.booking.promo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record PromoValidateRequest(
    @NotBlank String code,
    @NotNull LocalDate arrivalDate,
    @NotNull LocalDate departureDate,
    UUID roomTypeId
) {}

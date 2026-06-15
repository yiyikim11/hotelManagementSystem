package hotelpms.pms.folio.dto;

import hotelpms.pms.folio.entity.ChargeType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PostFolioItemRequest(
    @NotNull ChargeType chargeType,
    String description,
    @Min(1) int quantity,
    @NotNull @DecimalMin("0.00") BigDecimal unitPrice
) {}

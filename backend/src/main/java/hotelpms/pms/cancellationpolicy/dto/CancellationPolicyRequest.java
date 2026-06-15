package hotelpms.pms.cancellationpolicy.dto;

import hotelpms.pms.cancellationpolicy.entity.FeeType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CancellationPolicyRequest(
    @NotBlank @Size(max = 20) String code,
    @NotBlank @Size(max = 100) String name,
    String description,
    @Min(0) int hoursBeforeArrival,
    @NotNull FeeType feeType,
    @NotNull @DecimalMin("0.00") BigDecimal feeValue,
    boolean isActive
) {}

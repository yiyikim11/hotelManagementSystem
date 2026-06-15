package hotelpms.pms.rateplan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RatePlanRequest(
    @NotBlank @Size(max = 20) String code,
    @NotBlank @Size(max = 100) String name,
    String description,
    boolean isActive
) {}

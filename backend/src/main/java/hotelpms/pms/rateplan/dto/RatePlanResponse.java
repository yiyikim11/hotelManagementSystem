package hotelpms.pms.rateplan.dto;

import hotelpms.pms.rateplan.entity.RatePlan;

import java.util.UUID;

public record RatePlanResponse(
    UUID id,
    String code,
    String name,
    String description,
    boolean isActive
) {
    public static RatePlanResponse from(RatePlan r) {
        return new RatePlanResponse(r.getId(), r.getCode(), r.getName(), r.getDescription(), r.isActive());
    }
}

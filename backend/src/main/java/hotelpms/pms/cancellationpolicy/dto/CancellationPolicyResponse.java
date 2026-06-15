package hotelpms.pms.cancellationpolicy.dto;

import hotelpms.pms.cancellationpolicy.entity.CancellationPolicy;
import hotelpms.pms.cancellationpolicy.entity.FeeType;

import java.math.BigDecimal;
import java.util.UUID;

public record CancellationPolicyResponse(
    UUID id,
    String code,
    String name,
    String description,
    int hoursBeforeArrival,
    FeeType feeType,
    BigDecimal feeValue,
    boolean isActive
) {
    public static CancellationPolicyResponse from(CancellationPolicy p) {
        return new CancellationPolicyResponse(
                p.getId(), p.getCode(), p.getName(), p.getDescription(),
                p.getHoursBeforeArrival(), p.getFeeType(), p.getFeeValue(), p.isActive());
    }
}

package hotelpms.pms.rateplan.repository;

import hotelpms.pms.rateplan.entity.RatePlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RatePlanRepository extends JpaRepository<RatePlan, UUID> {
    boolean existsByCode(String code);
}

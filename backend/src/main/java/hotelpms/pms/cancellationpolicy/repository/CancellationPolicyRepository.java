package hotelpms.pms.cancellationpolicy.repository;

import hotelpms.pms.cancellationpolicy.entity.CancellationPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CancellationPolicyRepository extends JpaRepository<CancellationPolicy, UUID> {
    boolean existsByCode(String code);
}

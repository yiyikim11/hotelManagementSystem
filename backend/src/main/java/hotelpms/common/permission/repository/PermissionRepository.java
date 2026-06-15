package hotelpms.common.permission.repository;

import hotelpms.common.permission.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    boolean existsByCode(String code);
}

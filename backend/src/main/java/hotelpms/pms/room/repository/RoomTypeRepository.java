package hotelpms.pms.room.repository;

import hotelpms.pms.room.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoomTypeRepository extends JpaRepository<RoomType, UUID> {
    boolean existsByCode(String code);
}

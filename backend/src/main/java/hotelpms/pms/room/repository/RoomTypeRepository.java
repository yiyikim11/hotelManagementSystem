package hotelpms.pms.room.repository;

import hotelpms.pms.room.entity.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoomTypeRepository extends JpaRepository<RoomType, UUID> {
    boolean existsByCode(String code);

    Page<RoomType> findByArchivedFalse(Pageable pageable);

    List<RoomType> findByArchivedFalse();
}

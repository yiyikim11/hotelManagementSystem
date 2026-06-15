package hotelpms.pms.room.repository;

import hotelpms.pms.room.entity.Room;
import hotelpms.pms.room.entity.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
    boolean existsByRoomNumber(String roomNumber);
    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findByRoomTypeId(UUID roomTypeId);
    List<Room> findByStatus(RoomStatus status);
    long countByStatus(RoomStatus status);
    long countByRoomTypeId(UUID roomTypeId);
}

package hotelpms.pms.room.service;

import hotelpms.common.exception.ConflictException;
import hotelpms.common.exception.NotFoundException;
import hotelpms.pms.room.dto.RoomRequest;
import hotelpms.pms.room.dto.RoomResponse;
import hotelpms.pms.room.entity.Room;
import hotelpms.pms.room.entity.RoomStatus;
import hotelpms.pms.room.repository.RoomRepository;
import hotelpms.pms.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    @Transactional(readOnly = true)
    public Page<RoomResponse> list(Pageable pageable) {
        return roomRepository.findAll(pageable).map(RoomResponse::from);
    }

    @Transactional(readOnly = true)
    public RoomResponse findById(UUID id) {
        return RoomResponse.from(getOrThrow(id));
    }

    public RoomResponse create(RoomRequest request) {
        if (roomRepository.existsByRoomNumber(request.roomNumber())) {
            throw new ConflictException("Room number already exists: " + request.roomNumber());
        }
        Room room = new Room();
        applyRequest(room, request);
        return RoomResponse.from(roomRepository.save(room));
    }

    public RoomResponse update(UUID id, RoomRequest request) {
        Room room = getOrThrow(id);
        applyRequest(room, request);
        return RoomResponse.from(roomRepository.save(room));
    }

    public RoomResponse updateStatus(UUID id, RoomStatus status) {
        Room room = getOrThrow(id);
        room.setStatus(status);
        return RoomResponse.from(roomRepository.save(room));
    }

    public void delete(UUID id) {
        roomRepository.delete(getOrThrow(id));
    }

    private void applyRequest(Room room, RoomRequest req) {
        room.setRoomNumber(req.roomNumber());
        room.setRoomType(roomTypeRepository.findById(req.roomTypeId())
                .orElseThrow(() -> NotFoundException.of("RoomType", req.roomTypeId())));
        room.setFloor(req.floor());
        room.setNotes(req.notes());
    }

    private Room getOrThrow(UUID id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Room", id));
    }
}

package hotelpms.pms.room.service;

import hotelpms.common.exception.ConflictException;
import hotelpms.common.exception.NotFoundException;
import hotelpms.pms.reservation.repository.ReservationRoomRepository;
import hotelpms.pms.room.dto.AvailabilityResponse;
import hotelpms.pms.room.dto.RoomTypeRequest;
import hotelpms.pms.room.dto.RoomTypeResponse;
import hotelpms.pms.room.entity.RoomType;
import hotelpms.pms.room.repository.RoomRepository;
import hotelpms.pms.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final ReservationRoomRepository reservationRoomRepository;

    @Transactional(readOnly = true)
    public Page<RoomTypeResponse> list(Pageable pageable) {
        return roomTypeRepository.findAll(pageable).map(RoomTypeResponse::from);
    }

    @Transactional(readOnly = true)
    public RoomTypeResponse findById(UUID id) {
        return RoomTypeResponse.from(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getAvailability(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("'from' date must not be after 'to' date");
        }
        return roomTypeRepository.findAll().stream()
                .map(rt -> {
                    long total = roomRepository.countByRoomTypeId(rt.getId());
                    long occupied = reservationRoomRepository
                            .countOccupiedByTypeAndDateRange(rt.getId(), from, to);
                    long available = Math.max(0, total - occupied);
                    return new AvailabilityResponse(
                            rt.getId(), rt.getCode(), rt.getName(),
                            total, occupied, available, rt.getBaseRate());
                })
                .toList();
    }

    public RoomTypeResponse create(RoomTypeRequest request) {
        if (roomTypeRepository.existsByCode(request.code().toUpperCase())) {
            throw new ConflictException("Room type code already exists: " + request.code());
        }
        RoomType rt = new RoomType();
        applyRequest(rt, request);
        return RoomTypeResponse.from(roomTypeRepository.save(rt));
    }

    public RoomTypeResponse update(UUID id, RoomTypeRequest request) {
        RoomType rt = getOrThrow(id);
        applyRequest(rt, request);
        return RoomTypeResponse.from(roomTypeRepository.save(rt));
    }

    public void delete(UUID id) {
        roomTypeRepository.delete(getOrThrow(id));
    }

    private void applyRequest(RoomType rt, RoomTypeRequest req) {
        rt.setCode(req.code().toUpperCase());
        rt.setName(req.name());
        rt.setDescription(req.description());
        rt.setBaseOccupancy(req.baseOccupancy());
        rt.setMaxOccupancy(req.maxOccupancy());
        rt.setBaseRate(req.baseRate());
        rt.setCurrency(req.currency() != null ? req.currency() : "USD");
    }

    private RoomType getOrThrow(UUID id) {
        return roomTypeRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("RoomType", id));
    }
}

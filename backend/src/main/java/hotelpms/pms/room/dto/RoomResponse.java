package hotelpms.pms.room.dto;

import hotelpms.pms.room.entity.Room;

import java.util.UUID;

public record RoomResponse(
    UUID id,
    String roomNumber,
    UUID roomTypeId,
    String roomTypeName,
    Integer floor,
    String status,
    String notes
) {
    public static RoomResponse from(Room r) {
        return new RoomResponse(
                r.getId(), r.getRoomNumber(),
                r.getRoomType().getId(), r.getRoomType().getName(),
                r.getFloor(), r.getStatus().name(), r.getNotes());
    }
}

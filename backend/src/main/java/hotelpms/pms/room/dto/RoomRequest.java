package hotelpms.pms.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record RoomRequest(
    @NotBlank @Size(max = 20) String roomNumber,
    @NotNull UUID roomTypeId,
    Integer floor,
    String notes
) {}

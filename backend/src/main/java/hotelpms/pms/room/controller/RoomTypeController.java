package hotelpms.pms.room.controller;

import hotelpms.pms.room.dto.AvailabilityResponse;
import hotelpms.pms.room.dto.RoomTypeRequest;
import hotelpms.pms.room.dto.RoomTypeResponse;
import hotelpms.pms.room.service.RoomTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pms/room-types")
@RequiredArgsConstructor
public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    @GetMapping
    public ResponseEntity<Page<RoomTypeResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(roomTypeService.list(pageable));
    }

    @GetMapping("/availability")
    public ResponseEntity<List<AvailabilityResponse>> availability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(roomTypeService.getAvailability(from, to));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomTypeResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(roomTypeService.findById(id));
    }

    @PostMapping
    public ResponseEntity<RoomTypeResponse> create(@Valid @RequestBody RoomTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomTypeService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomTypeResponse> update(@PathVariable UUID id,
                                                   @Valid @RequestBody RoomTypeRequest request) {
        return ResponseEntity.ok(roomTypeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        roomTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

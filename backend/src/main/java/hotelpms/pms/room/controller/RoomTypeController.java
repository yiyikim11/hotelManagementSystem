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
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAuthority('ROOMS_READ')")
    public ResponseEntity<Page<RoomTypeResponse>> list(
            Pageable pageable,
            @RequestParam(name = "includeArchived", defaultValue = "false") boolean includeArchived) {
        return ResponseEntity.ok(roomTypeService.list(pageable, includeArchived));
    }

    @GetMapping("/availability")
    @PreAuthorize("hasAuthority('ROOMS_READ')")
    public ResponseEntity<List<AvailabilityResponse>> availability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(roomTypeService.getAvailability(from, to));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROOMS_READ')")
    public ResponseEntity<RoomTypeResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(roomTypeService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROOMS_WRITE')")
    public ResponseEntity<RoomTypeResponse> create(@Valid @RequestBody RoomTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomTypeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROOMS_WRITE')")
    public ResponseEntity<RoomTypeResponse> update(@PathVariable UUID id,
                                                   @Valid @RequestBody RoomTypeRequest request) {
        return ResponseEntity.ok(roomTypeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROOMS_WRITE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        roomTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasAuthority('ROOMS_WRITE')")
    public ResponseEntity<RoomTypeResponse> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(roomTypeService.restore(id));
    }
}

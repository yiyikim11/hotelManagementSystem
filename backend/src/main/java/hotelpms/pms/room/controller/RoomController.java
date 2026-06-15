package hotelpms.pms.room.controller;

import hotelpms.pms.room.dto.RoomRequest;
import hotelpms.pms.room.dto.RoomResponse;
import hotelpms.pms.room.entity.RoomStatus;
import hotelpms.pms.room.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/pms/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<Page<RoomResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(roomService.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(roomService.findById(id));
    }

    @PostMapping
    public ResponseEntity<RoomResponse> create(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomResponse> update(@PathVariable UUID id,
                                               @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RoomResponse> updateStatus(@PathVariable UUID id,
                                                     @RequestParam RoomStatus status) {
        return ResponseEntity.ok(roomService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

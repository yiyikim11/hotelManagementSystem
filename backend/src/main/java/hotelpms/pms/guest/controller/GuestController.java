package hotelpms.pms.guest.controller;

import hotelpms.pms.guest.dto.GuestRequest;
import hotelpms.pms.guest.dto.GuestResponse;
import hotelpms.pms.guest.service.GuestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/pms/guests")
@RequiredArgsConstructor
public class GuestController {

    private final GuestService guestService;

    @GetMapping
    @PreAuthorize("hasAuthority('GUESTS_READ')")
    public ResponseEntity<Page<GuestResponse>> list(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(guestService.search(q, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('GUESTS_READ')")
    public ResponseEntity<GuestResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(guestService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('GUESTS_WRITE')")
    public ResponseEntity<GuestResponse> create(@Valid @RequestBody GuestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(guestService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GUESTS_WRITE')")
    public ResponseEntity<GuestResponse> update(@PathVariable UUID id,
                                                @Valid @RequestBody GuestRequest request) {
        return ResponseEntity.ok(guestService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('GUESTS_WRITE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        guestService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

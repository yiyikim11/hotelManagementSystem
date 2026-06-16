package hotelpms.booking.websitelisting.controller;

import hotelpms.booking.websitelisting.dto.WebsiteRoomListingRequest;
import hotelpms.booking.websitelisting.dto.WebsiteRoomListingResponse;
import hotelpms.booking.websitelisting.service.WebsiteRoomListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/booking/website-listings")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('BOOKING_MANAGE')")
public class WebsiteRoomListingController {

    private final WebsiteRoomListingService service;

    @GetMapping
    public ResponseEntity<List<WebsiteRoomListingResponse>> list() {
        return ResponseEntity.ok(service.listAll());
    }

    @PutMapping("/{roomTypeId}")
    public ResponseEntity<WebsiteRoomListingResponse> upsert(
            @PathVariable UUID roomTypeId,
            @Valid @RequestBody WebsiteRoomListingRequest request) {
        return ResponseEntity.ok(service.upsert(roomTypeId, request));
    }

    @PostMapping("/{roomTypeId}/toggle")
    public ResponseEntity<WebsiteRoomListingResponse> toggle(@PathVariable UUID roomTypeId) {
        return ResponseEntity.ok(service.togglePublish(roomTypeId));
    }
}

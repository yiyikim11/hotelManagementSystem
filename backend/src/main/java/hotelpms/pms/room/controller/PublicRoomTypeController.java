package hotelpms.pms.room.controller;

import hotelpms.booking.websitelisting.entity.WebsiteRoomListing;
import hotelpms.booking.websitelisting.service.WebsiteRoomListingService;
import hotelpms.pms.room.dto.AvailabilityResponse;
import hotelpms.pms.room.dto.PublicRoomTypeResponse;
import hotelpms.pms.room.entity.RoomType;
import hotelpms.pms.room.repository.RoomTypeRepository;
import hotelpms.pms.room.service.RoomTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/public/room-types")
@RequiredArgsConstructor
public class PublicRoomTypeController {

    private final RoomTypeService roomTypeService;
    private final RoomTypeRepository roomTypeRepository;
    private final WebsiteRoomListingService listingService;

    @GetMapping
    public ResponseEntity<List<PublicRoomTypeResponse>> list() {
        Map<UUID, WebsiteRoomListing> listings = listingService.findAllByRoomTypeId();
        List<PublicRoomTypeResponse> out = roomTypeRepository.findByArchivedFalse().stream()
                .filter(rt -> {
                    WebsiteRoomListing l = listings.get(rt.getId());
                    return l != null && l.isPublished();
                })
                .sorted(Comparator.comparingInt(rt -> listings.get(rt.getId()).getDisplayOrder()))
                .map(rt -> PublicRoomTypeResponse.from(rt, listings.get(rt.getId())))
                .toList();
        return ResponseEntity.ok(out);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicRoomTypeResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(listingService.findPublishedRoomType(id));
    }

    @GetMapping("/availability")
    public ResponseEntity<List<AvailabilityResponse>> availability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        List<UUID> publishedIds = listingService.getPublishedRoomTypeIds();
        List<AvailabilityResponse> all = roomTypeService.getAvailability(from, to);
        return ResponseEntity.ok(all.stream()
                .filter(a -> publishedIds.contains(a.roomTypeId()))
                .toList());
    }
}

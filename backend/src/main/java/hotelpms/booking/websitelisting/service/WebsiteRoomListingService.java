package hotelpms.booking.websitelisting.service;

import hotelpms.booking.websitelisting.dto.WebsiteRoomListingRequest;
import hotelpms.booking.websitelisting.dto.WebsiteRoomListingResponse;
import hotelpms.booking.websitelisting.entity.WebsiteRoomListing;
import hotelpms.booking.websitelisting.repository.WebsiteRoomListingRepository;
import hotelpms.common.exception.NotFoundException;
import hotelpms.pms.room.dto.PublicRoomTypeResponse;
import hotelpms.pms.room.entity.RoomType;
import hotelpms.pms.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class WebsiteRoomListingService {

    private final WebsiteRoomListingRepository repository;
    private final RoomTypeRepository roomTypeRepository;

    /** Admin view: one row per existing RoomType, with default (unpublished) listing if none yet. */
    @Transactional(readOnly = true)
    public List<WebsiteRoomListingResponse> listAll() {
        Map<UUID, WebsiteRoomListing> byType = repository.findAll().stream()
                .collect(Collectors.toMap(l -> l.getRoomType().getId(), l -> l));
        List<WebsiteRoomListingResponse> out = new ArrayList<>();
        for (RoomType rt : roomTypeRepository.findByArchivedFalse()) {
            WebsiteRoomListing l = byType.get(rt.getId());
            if (l == null) {
                l = new WebsiteRoomListing();
                l.setRoomType(rt);
            }
            out.add(WebsiteRoomListingResponse.from(l));
        }
        out.sort(Comparator.comparing(WebsiteRoomListingResponse::displayOrder));
        return out;
    }

    @Transactional(readOnly = true)
    public List<UUID> getPublishedRoomTypeIds() {
        return repository.findByIsPublishedTrueOrderByDisplayOrderAsc().stream()
                .map(l -> l.getRoomType().getId())
                .toList();
    }

    @Transactional(readOnly = true)
    public Map<UUID, WebsiteRoomListing> findAllByRoomTypeId() {
        return repository.findAll().stream()
                .collect(Collectors.toMap(l -> l.getRoomType().getId(), l -> l));
    }

    @Transactional(readOnly = true)
    public PublicRoomTypeResponse findPublishedRoomType(UUID roomTypeId) {
        WebsiteRoomListing listing = repository.findByRoomType_Id(roomTypeId)
                .filter(WebsiteRoomListing::isPublished)
                .filter(l -> !l.getRoomType().isArchived())
                .orElseThrow(() -> new NotFoundException("Published room type not found: " + roomTypeId));
        return PublicRoomTypeResponse.from(listing.getRoomType(), listing);
    }

    @Transactional(readOnly = true)
    public boolean isPubliclyBookable(UUID roomTypeId) {
        return repository.findByRoomType_Id(roomTypeId)
                .filter(WebsiteRoomListing::isPublished)
                .map(l -> !l.getRoomType().isArchived())
                .orElse(false);
    }

    public WebsiteRoomListingResponse upsert(UUID roomTypeId, WebsiteRoomListingRequest req) {
        WebsiteRoomListing listing = repository.findByRoomType_Id(roomTypeId).orElseGet(() -> {
            RoomType rt = roomTypeRepository.findById(roomTypeId)
                    .orElseThrow(() -> new NotFoundException("Room type not found: " + roomTypeId));
            WebsiteRoomListing l = new WebsiteRoomListing();
            l.setRoomType(rt);
            return l;
        });
        if (req.isPublished() != null) listing.setPublished(req.isPublished());
        if (req.websiteDescription() != null) listing.setWebsiteDescription(req.websiteDescription());
        if (req.websitePhotos() != null) listing.setWebsitePhotos(String.join("\n", req.websitePhotos()));
        if (req.displayOrder() != null) listing.setDisplayOrder(req.displayOrder());
        listing.setPromotionalRate(req.promotionalRate());
        listing.setPromotionalRateDescription(req.promotionalRateDescription());
        if (req.featuredAmenities() != null) listing.setFeaturedAmenities(String.join(", ", req.featuredAmenities()));
        return WebsiteRoomListingResponse.from(repository.save(listing));
    }

    public WebsiteRoomListingResponse togglePublish(UUID roomTypeId) {
        WebsiteRoomListing listing = repository.findByRoomType_Id(roomTypeId).orElseGet(() -> {
            RoomType rt = roomTypeRepository.findById(roomTypeId)
                    .orElseThrow(() -> new NotFoundException("Room type not found: " + roomTypeId));
            WebsiteRoomListing l = new WebsiteRoomListing();
            l.setRoomType(rt);
            return l;
        });
        listing.setPublished(!listing.isPublished());
        return WebsiteRoomListingResponse.from(repository.save(listing));
    }
}

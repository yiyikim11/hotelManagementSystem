package hotelpms.booking.websitelisting.dto;

import hotelpms.booking.websitelisting.entity.WebsiteRoomListing;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public record WebsiteRoomListingResponse(
        UUID id,
        UUID roomTypeId,
        boolean isPublished,
        String websiteDescription,
        List<String> websitePhotos,
        Integer displayOrder,
        BigDecimal promotionalRate,
        String promotionalRateDescription,
        List<String> featuredAmenities,
        Instant updatedAt
) {
    public static WebsiteRoomListingResponse from(WebsiteRoomListing e) {
        return new WebsiteRoomListingResponse(
                e.getId(),
                e.getRoomType().getId(),
                e.isPublished(),
                e.getWebsiteDescription(),
                splitLines(e.getWebsitePhotos()),
                e.getDisplayOrder(),
                e.getPromotionalRate(),
                e.getPromotionalRateDescription(),
                splitCsv(e.getFeaturedAmenities()),
                e.getUpdatedAt()
        );
    }

    private static List<String> splitLines(String s) {
        if (s == null || s.isBlank()) return List.of();
        return Arrays.stream(s.split("\\r?\\n")).map(String::trim).filter(t -> !t.isEmpty()).toList();
    }

    private static List<String> splitCsv(String s) {
        if (s == null || s.isBlank()) return List.of();
        return Arrays.stream(s.split(",")).map(String::trim).filter(t -> !t.isEmpty()).toList();
    }
}

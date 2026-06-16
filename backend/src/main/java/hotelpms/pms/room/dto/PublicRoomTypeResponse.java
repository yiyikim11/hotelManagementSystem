package hotelpms.pms.room.dto;

import hotelpms.booking.websitelisting.entity.WebsiteRoomListing;
import hotelpms.pms.room.entity.RoomType;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public record PublicRoomTypeResponse(
        UUID id,
        String code,
        String name,
        String description,
        int baseOccupancy,
        int maxOccupancy,
        BigDecimal baseRate,
        String currency,
        // website listing
        String websiteDescription,
        List<String> websitePhotos,
        Integer displayOrder,
        BigDecimal promotionalRate,
        String promotionalRateDescription,
        List<String> featuredAmenities
) {
    public static PublicRoomTypeResponse from(RoomType rt, WebsiteRoomListing l) {
        return new PublicRoomTypeResponse(
                rt.getId(), rt.getCode(), rt.getName(), rt.getDescription(),
                rt.getBaseOccupancy(), rt.getMaxOccupancy(), rt.getBaseRate(), rt.getCurrency(),
                l == null ? null : l.getWebsiteDescription(),
                l == null ? List.of() : splitLines(l.getWebsitePhotos()),
                l == null ? null : l.getDisplayOrder(),
                l == null ? null : l.getPromotionalRate(),
                l == null ? null : l.getPromotionalRateDescription(),
                l == null ? List.of() : splitCsv(l.getFeaturedAmenities())
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

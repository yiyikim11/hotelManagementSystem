package hotelpms.booking.websitelisting.dto;

import java.math.BigDecimal;
import java.util.List;

public record WebsiteRoomListingRequest(
        Boolean isPublished,
        String websiteDescription,
        List<String> websitePhotos,
        Integer displayOrder,
        BigDecimal promotionalRate,
        String promotionalRateDescription,
        List<String> featuredAmenities
) {}

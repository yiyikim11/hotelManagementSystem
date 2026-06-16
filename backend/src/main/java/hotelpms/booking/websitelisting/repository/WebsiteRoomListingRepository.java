package hotelpms.booking.websitelisting.repository;

import hotelpms.booking.websitelisting.entity.WebsiteRoomListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WebsiteRoomListingRepository extends JpaRepository<WebsiteRoomListing, UUID> {
    Optional<WebsiteRoomListing> findByRoomType_Id(UUID roomTypeId);
    List<WebsiteRoomListing> findByIsPublishedTrueOrderByDisplayOrderAsc();
}

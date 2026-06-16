package hotelpms.booking.websitelisting.entity;

import hotelpms.common.persistence.BaseEntity;
import hotelpms.pms.room.entity.RoomType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "website_room_listings")
@Getter
@Setter
@NoArgsConstructor
public class WebsiteRoomListing extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false, unique = true)
    private RoomType roomType;

    @Column(nullable = false)
    private boolean isPublished = false;

    @Column(columnDefinition = "TEXT")
    private String websiteDescription;

    @Column(columnDefinition = "TEXT")
    private String websitePhotos;

    @Column(nullable = false)
    private Integer displayOrder = 999;

    @Column(precision = 19, scale = 4)
    private BigDecimal promotionalRate;

    @Column(length = 255)
    private String promotionalRateDescription;

    @Column(columnDefinition = "TEXT")
    private String featuredAmenities;
}

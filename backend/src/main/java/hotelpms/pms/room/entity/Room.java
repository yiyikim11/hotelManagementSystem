package hotelpms.pms.room.entity;

import hotelpms.common.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
public class Room extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String roomNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    private Integer floor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @Column(columnDefinition = "TEXT")
    private String notes;
}

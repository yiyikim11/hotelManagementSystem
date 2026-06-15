package hotelpms.pms.guest.entity;

import hotelpms.common.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "guest_preferences")
@Getter
@Setter
@NoArgsConstructor
public class GuestPreference extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", nullable = false)
    private Guest guest;

    @Column(nullable = false, length = 100)
    private String preferenceKey;

    @Column(columnDefinition = "TEXT")
    private String preferenceValue;
}

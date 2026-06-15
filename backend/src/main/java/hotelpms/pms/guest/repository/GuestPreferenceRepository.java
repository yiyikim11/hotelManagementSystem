package hotelpms.pms.guest.repository;

import hotelpms.pms.guest.entity.GuestPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GuestPreferenceRepository extends JpaRepository<GuestPreference, UUID> {
    List<GuestPreference> findByGuestId(UUID guestId);
}

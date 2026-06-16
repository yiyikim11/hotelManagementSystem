package hotelpms.common.mongo.guestprofile;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.UUID;

public interface GuestProfileRepository extends MongoRepository<GuestProfile, String> {
    Optional<GuestProfile> findByGuestId(UUID guestId);
    void deleteByGuestId(UUID guestId);
}

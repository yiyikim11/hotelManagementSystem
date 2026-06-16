package hotelpms.common.mongo.guestprofile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Free-form, schemaless guest profile stored in MongoDB.
 *
 * Postgres `guests` holds structured/transactional fields (name, email, IDs,
 * totals, blacklist). Anything that varies per guest or per business unit —
 * preferences, allergies, anniversaries, concierge notes, tag clouds — goes
 * here, keyed by the Postgres `guests.id`.
 */
@Document("guest_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestProfile {

    @Id
    private String id;

    /** Foreign key to Postgres `guests.id`. One profile per guest. */
    @Indexed(unique = true)
    private UUID guestId;

    /** e.g. ["vegetarian", "gluten-free", "no-shellfish"] */
    private List<String> dietary;

    /** e.g. ["penicillin", "nuts"] */
    private List<String> allergies;

    /** e.g. {"floor":"high", "bed":"king", "pillow":"firm"} */
    private Map<String, String> roomPreferences;

    /** Concierge / front-desk notes, latest first. */
    private List<Note> notes;

    /** Free-form key/value tags for marketing segmentation. */
    private Map<String, String> tags;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Version
    private Long version;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Note {
        private Instant at;
        private UUID authorId;
        private String text;
    }
}

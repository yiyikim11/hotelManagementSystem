package hotelpms.pms.guest.entity;

import hotelpms.common.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "guests")
@Getter
@Setter
@NoArgsConstructor
public class Guest extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 30)
    private String phone;

    private LocalDate dateOfBirth;

    @Column(length = 20)
    private String gender;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 50)
    private String nationality;

    @Column(length = 50)
    private String idType;

    @Column(length = 100)
    private String idNumber;

    @Column(length = 50)
    private String issuingCountry;

    @Column(columnDefinition = "TEXT")
    private String idDocumentImage;

    @Column(columnDefinition = "TEXT")
    private String preferences;

    @Column(nullable = false)
    private int totalStays = 0;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean vipStatus = false;

    @Column(nullable = false)
    private boolean blacklisted = false;

    private Instant deletedAt;

    /** FK to users.id — set when a guest registers a portal account. */
    @Column(name = "user_id")
    private UUID userId;
}

package hotelpms.pms.guest.dto;

import hotelpms.pms.guest.entity.Guest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record GuestResponse(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String phone,
    LocalDate dateOfBirth,
    String gender,
    String address,
    String nationality,
    String idType,
    String idNumber,
    String issuingCountry,
    String preferences,
    int totalStays,
    BigDecimal totalSpent,
    boolean vipStatus,
    boolean blacklisted
) {
    public static GuestResponse from(Guest g) {
        return new GuestResponse(
                g.getId(), g.getFirstName(), g.getLastName(), g.getEmail(), g.getPhone(),
                g.getDateOfBirth(), g.getGender(), g.getAddress(), g.getNationality(),
                g.getIdType(), g.getIdNumber(), g.getIssuingCountry(), g.getPreferences(),
                g.getTotalStays(), g.getTotalSpent(), g.isVipStatus(), g.isBlacklisted());
    }
}

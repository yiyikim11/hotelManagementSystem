package hotelpms.pms.guest.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record GuestRequest(
    @NotBlank @Size(max = 50) String firstName,
    @NotBlank @Size(max = 50) String lastName,
    @NotBlank @Email @Size(max = 100) String email,
    @NotBlank @Size(max = 30) String phone,
    LocalDate dateOfBirth,
    String gender,
    String address,
    String nationality,
    String idType,
    String idNumber,
    String issuingCountry,
    String idDocumentImage,
    String preferences,
    boolean vipStatus,
    boolean blacklisted
) {}

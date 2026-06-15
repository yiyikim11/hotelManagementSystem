package hotelpms.common.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateUserRequest(
    @NotBlank @Size(min = 3, max = 50) String username,
    @NotBlank @Size(max = 100) String fullName,
    @NotBlank @Email @Size(max = 100) String email,
    @NotBlank @Size(min = 8) String password,
    UUID roleId,
    String department
) {}

package hotelpms.common.user.dto;

import hotelpms.common.user.entity.User;

import java.util.UUID;

public record UserResponse(
    UUID id,
    String username,
    String fullName,
    String email,
    boolean isActive,
    String role,
    String department
) {
    public static UserResponse from(User u) {
        return new UserResponse(
                u.getId(), u.getUsername(), u.getFullName(), u.getEmail(),
                u.isActive(),
                u.getRole() != null ? u.getRole().getName() : null,
                u.getDepartment());
    }
}

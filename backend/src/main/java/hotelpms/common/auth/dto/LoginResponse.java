package hotelpms.common.auth.dto;

import java.util.UUID;

public record LoginResponse(
    String accessToken,
    UUID userId,
    String email,
    String fullName,
    String role
) {}

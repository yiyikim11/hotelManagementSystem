package hotelpms.common.auth.dto;

import java.util.List;
import java.util.UUID;

public record MeResponse(
    UUID id,
    String email,
    String fullName,
    String username,
    String role,
    List<String> permissions
) {}

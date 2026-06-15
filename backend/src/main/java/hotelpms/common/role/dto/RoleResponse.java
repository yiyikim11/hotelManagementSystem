package hotelpms.common.role.dto;

import hotelpms.common.role.entity.Role;

import java.util.List;
import java.util.UUID;

public record RoleResponse(UUID id, String name, String description, List<String> permissions) {
    public static RoleResponse from(Role r) {
        List<String> perms = r.getPermissions().stream().map(p -> p.getCode()).sorted().toList();
        return new RoleResponse(r.getId(), r.getName(), r.getDescription(), perms);
    }
}

package hotelpms.common.permission.controller;

import hotelpms.common.permission.dto.PermissionResponse;
import hotelpms.common.permission.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/permissions")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('USERS_MANAGE')")
public class PermissionController {

    private final PermissionRepository permissionRepository;

    @GetMapping
    public ResponseEntity<List<PermissionResponse>> list() {
        return ResponseEntity.ok(
                permissionRepository.findAll().stream().map(PermissionResponse::from).toList());
    }
}

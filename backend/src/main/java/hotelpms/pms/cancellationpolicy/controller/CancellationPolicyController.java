package hotelpms.pms.cancellationpolicy.controller;

import hotelpms.pms.cancellationpolicy.dto.CancellationPolicyRequest;
import hotelpms.pms.cancellationpolicy.dto.CancellationPolicyResponse;
import hotelpms.pms.cancellationpolicy.service.CancellationPolicyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/pms/cancellation-policies")
@RequiredArgsConstructor
public class CancellationPolicyController {

    private final CancellationPolicyService service;

    @GetMapping
    @PreAuthorize("hasAuthority('RESERVATIONS_READ')")
    public ResponseEntity<Page<CancellationPolicyResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(service.list(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('RESERVATIONS_READ')")
    public ResponseEntity<CancellationPolicyResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('POLICIES_MANAGE')")
    public ResponseEntity<CancellationPolicyResponse> create(
            @Valid @RequestBody CancellationPolicyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('POLICIES_MANAGE')")
    public ResponseEntity<CancellationPolicyResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody CancellationPolicyRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('POLICIES_MANAGE')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

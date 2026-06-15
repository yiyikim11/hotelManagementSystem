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
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/pms/cancellation-policies")
@RequiredArgsConstructor
public class CancellationPolicyController {

    private final CancellationPolicyService service;

    @GetMapping
    public ResponseEntity<Page<CancellationPolicyResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(service.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CancellationPolicyResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<CancellationPolicyResponse> create(
            @Valid @RequestBody CancellationPolicyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CancellationPolicyResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody CancellationPolicyRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

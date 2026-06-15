package hotelpms.pms.folio.controller;

import hotelpms.pms.folio.dto.FolioResponse;
import hotelpms.pms.folio.dto.PostFolioItemRequest;
import hotelpms.pms.folio.service.FolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/pms/folios")
@RequiredArgsConstructor
public class FolioController {

    private final FolioService folioService;

    @GetMapping("/{id}")
    public ResponseEntity<FolioResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(folioService.findById(id));
    }

    @GetMapping("/by-reservation/{reservationId}")
    public ResponseEntity<FolioResponse> getByReservation(@PathVariable UUID reservationId) {
        return ResponseEntity.ok(folioService.findByReservation(reservationId));
    }

    @PostMapping("/by-reservation/{reservationId}/open")
    public ResponseEntity<FolioResponse> open(@PathVariable UUID reservationId) {
        return ResponseEntity.ok(folioService.openForReservation(reservationId));
    }

    @PostMapping("/{id}/charges")
    public ResponseEntity<FolioResponse> postCharge(
            @PathVariable UUID id,
            @Valid @RequestBody PostFolioItemRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = requireAuthenticated(userDetails);
        return ResponseEntity.ok(folioService.postCharge(id, request, email));
    }

    @DeleteMapping("/{id}/charges/{itemId}")
    public ResponseEntity<FolioResponse> voidItem(
            @PathVariable UUID id,
            @PathVariable UUID itemId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = requireAuthenticated(userDetails);
        return ResponseEntity.ok(folioService.voidItem(id, itemId, email));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<FolioResponse> close(@PathVariable UUID id) {
        return ResponseEntity.ok(folioService.close(id));
    }

    private String requireAuthenticated(UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("Authentication required");
        }
        return userDetails.getUsername();
    }
}

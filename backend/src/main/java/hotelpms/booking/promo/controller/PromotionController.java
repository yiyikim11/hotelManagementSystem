package hotelpms.booking.promo.controller;

import hotelpms.booking.promo.dto.*;
import hotelpms.booking.promo.service.PromotionService;
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
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    // ── Packages ─────────────────────────────────────────────────────────────

    @GetMapping("/promo/packages")
    @PreAuthorize("hasAuthority('MARKETING_MANAGE')")
    public ResponseEntity<Page<PromotionalPackageResponse>> listPackages(Pageable pageable) {
        return ResponseEntity.ok(promotionService.listPackages(pageable));
    }

    @GetMapping("/promo/packages/{id}")
    @PreAuthorize("hasAuthority('MARKETING_MANAGE')")
    public ResponseEntity<PromotionalPackageResponse> getPackage(@PathVariable UUID id) {
        return ResponseEntity.ok(promotionService.findPackageById(id));
    }

    @PostMapping("/promo/packages")
    @PreAuthorize("hasAuthority('MARKETING_MANAGE')")
    public ResponseEntity<PromotionalPackageResponse> createPackage(
            @Valid @RequestBody PromotionalPackageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionService.createPackage(request));
    }

    @PutMapping("/promo/packages/{id}")
    @PreAuthorize("hasAuthority('MARKETING_MANAGE')")
    public ResponseEntity<PromotionalPackageResponse> updatePackage(
            @PathVariable UUID id,
            @Valid @RequestBody PromotionalPackageRequest request) {
        return ResponseEntity.ok(promotionService.updatePackage(id, request));
    }

    @DeleteMapping("/promo/packages/{id}")
    @PreAuthorize("hasAuthority('MARKETING_MANAGE')")
    public ResponseEntity<Void> deletePackage(@PathVariable UUID id) {
        promotionService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }

    // ── Promo Codes ──────────────────────────────────────────────────────────

    @GetMapping("/promo/codes")
    @PreAuthorize("hasAuthority('MARKETING_MANAGE')")
    public ResponseEntity<Page<PromoCodeResponse>> listCodes(Pageable pageable) {
        return ResponseEntity.ok(promotionService.listCodes(pageable));
    }

    @GetMapping("/promo/codes/{id}")
    @PreAuthorize("hasAuthority('MARKETING_MANAGE')")
    public ResponseEntity<PromoCodeResponse> getCode(@PathVariable UUID id) {
        return ResponseEntity.ok(promotionService.findCodeById(id));
    }

    @PostMapping("/promo/codes")
    @PreAuthorize("hasAuthority('MARKETING_MANAGE')")
    public ResponseEntity<PromoCodeResponse> createCode(
            @Valid @RequestBody PromoCodeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionService.createCode(request));
    }

    @PutMapping("/promo/codes/{id}")
    @PreAuthorize("hasAuthority('MARKETING_MANAGE')")
    public ResponseEntity<PromoCodeResponse> updateCode(
            @PathVariable UUID id,
            @Valid @RequestBody PromoCodeRequest request) {
        return ResponseEntity.ok(promotionService.updateCode(id, request));
    }

    @DeleteMapping("/promo/codes/{id}")
    @PreAuthorize("hasAuthority('MARKETING_MANAGE')")
    public ResponseEntity<Void> deleteCode(@PathVariable UUID id) {
        promotionService.deleteCode(id);
        return ResponseEntity.noContent().build();
    }
}

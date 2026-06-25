package hotelpms.booking.promo.service;

import hotelpms.booking.promo.dto.*;
import hotelpms.booking.promo.entity.DiscountType;
import hotelpms.booking.promo.entity.PromoCode;
import hotelpms.booking.promo.entity.PromotionalPackage;
import hotelpms.booking.promo.repository.PromoCodeRepository;
import hotelpms.booking.promo.repository.PromotionalPackageRepository;
import hotelpms.common.exception.ConflictException;
import hotelpms.common.exception.NotFoundException;
import hotelpms.pms.room.entity.RoomType;
import hotelpms.pms.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PromotionService {

    private final PromotionalPackageRepository packageRepository;
    private final PromoCodeRepository promoCodeRepository;
    private final RoomTypeRepository roomTypeRepository;

    // ── Admin: Packages ──────────────────────────────────────────────────────

    public Page<PromotionalPackageResponse> listPackages(Pageable pageable) {
        return packageRepository.findAll(pageable).map(PromotionalPackageResponse::from);
    }

    public PromotionalPackageResponse findPackageById(UUID id) {
        return PromotionalPackageResponse.from(getPackage(id));
    }

    @Transactional
    public PromotionalPackageResponse createPackage(PromotionalPackageRequest req) {
        if (packageRepository.existsByCode(req.code())) {
            throw new ConflictException("Package code already exists: " + req.code());
        }
        PromotionalPackage pkg = new PromotionalPackage();
        applyPackageRequest(pkg, req);
        return PromotionalPackageResponse.from(packageRepository.save(pkg));
    }

    @Transactional
    public PromotionalPackageResponse updatePackage(UUID id, PromotionalPackageRequest req) {
        PromotionalPackage pkg = getPackage(id);
        if (!pkg.getCode().equals(req.code()) && packageRepository.existsByCode(req.code())) {
            throw new ConflictException("Package code already exists: " + req.code());
        }
        applyPackageRequest(pkg, req);
        return PromotionalPackageResponse.from(packageRepository.save(pkg));
    }

    @Transactional
    public void deletePackage(UUID id) {
        packageRepository.delete(getPackage(id));
    }

    // ── Admin: Promo Codes ───────────────────────────────────────────────────

    public Page<PromoCodeResponse> listCodes(Pageable pageable) {
        return promoCodeRepository.findAll(pageable).map(PromoCodeResponse::from);
    }

    public PromoCodeResponse findCodeById(UUID id) {
        return PromoCodeResponse.from(getCode(id));
    }

    @Transactional
    public PromoCodeResponse createCode(PromoCodeRequest req) {
        if (promoCodeRepository.existsByCode(req.code())) {
            throw new ConflictException("Promo code already exists: " + req.code());
        }
        PromoCode code = new PromoCode();
        applyCodeRequest(code, req);
        return PromoCodeResponse.from(promoCodeRepository.save(code));
    }

    @Transactional
    public PromoCodeResponse updateCode(UUID id, PromoCodeRequest req) {
        PromoCode code = getCode(id);
        if (!code.getCode().equals(req.code()) && promoCodeRepository.existsByCode(req.code())) {
            throw new ConflictException("Promo code already exists: " + req.code());
        }
        applyCodeRequest(code, req);
        return PromoCodeResponse.from(promoCodeRepository.save(code));
    }

    @Transactional
    public void deleteCode(UUID id) {
        promoCodeRepository.delete(getCode(id));
    }

    // ── Public: Offers ───────────────────────────────────────────────────────

    public List<PromotionalPackageResponse> listActiveOffers(LocalDate from, LocalDate to, UUID roomTypeId) {
        return packageRepository.findActiveOffers(from, to, roomTypeId)
            .stream().map(PromotionalPackageResponse::from).toList();
    }

    /** Customer-facing list of currently-applicable promo codes with their discount terms. */
    public List<PublicPromoCodeResponse> listPublicPromoCodes() {
        return promoCodeRepository.findActivePublic(Instant.now()).stream()
            .map(c -> {
                PromotionalPackage pkg = c.getPromotionalPackage();
                return new PublicPromoCodeResponse(
                    c.getCode(),
                    pkg.getName(),
                    pkg.getDescription(),
                    pkg.getDiscountType(),
                    pkg.getDiscountValue(),
                    pkg.getMinNights(),
                    pkg.getMaxNights(),
                    pkg.getValidFrom(),
                    pkg.getValidTo(),
                    pkg.getApplicableRoomTypes().stream().map(RoomType::getId).toList()
                );
            })
            .toList();
    }

    // ── Public: Validate Promo ───────────────────────────────────────────────

    public PromoValidateResponse validatePromo(
            String codeStr, LocalDate arrival, LocalDate departure, UUID roomTypeId) {

        if (!arrival.isBefore(departure)) {
            throw new IllegalArgumentException("Departure must be after arrival");
        }

        PromoCode promoCode = promoCodeRepository
            .findActiveByCode(codeStr, Instant.now())
            .orElseThrow(() -> new NotFoundException("Promo code not found or expired: " + codeStr));

        if (promoCode.getUsageLimit() != null
                && promoCode.getUsageCount() >= promoCode.getUsageLimit()) {
            throw new ConflictException("Promo code has reached its usage limit: " + codeStr);
        }

        PromotionalPackage pkg = promoCode.getPromotionalPackage();
        if (pkg == null || !pkg.isActive()) {
            throw new ConflictException("Promo code is not linked to an active package: " + codeStr);
        }

        // Package date window must cover the stay
        if (pkg.getValidFrom().isAfter(arrival) || pkg.getValidTo().isBefore(departure)) {
            throw new ConflictException(
                "Promo package is not valid for the selected dates");
        }

        // Min/max nights check
        long nights = arrival.until(departure).getDays();
        if (nights < pkg.getMinNights()) {
            throw new ConflictException(
                "Stay of " + nights + " night(s) is below the minimum of " + pkg.getMinNights());
        }
        if (pkg.getMaxNights() != null && nights > pkg.getMaxNights()) {
            throw new ConflictException(
                "Stay of " + nights + " night(s) exceeds the maximum of " + pkg.getMaxNights());
        }

        // Room type restriction
        if (roomTypeId != null && !pkg.getApplicableRoomTypes().isEmpty()) {
            boolean applicable = pkg.getApplicableRoomTypes().stream()
                .anyMatch(rt -> rt.getId().equals(roomTypeId));
            if (!applicable) {
                throw new ConflictException(
                    "Promo package does not apply to the selected room type");
            }
        }

        return new PromoValidateResponse(
            promoCode.getId(),
            pkg.getId(),
            pkg.getCode(),
            pkg.getDiscountType(),
            pkg.getDiscountValue(),
            pkg.getMinNights()
        );
    }

    /**
     * Atomically increment usage_count. Must be called inside an existing transaction.
     * Uses a pessimistic write lock to prevent concurrent over-claim.
     */
    @Transactional
    public void claimUsage(UUID promoCodeId) {
        PromoCode code = promoCodeRepository.findByIdForUpdate(promoCodeId)
            .orElseThrow(() -> NotFoundException.of("PromoCode", promoCodeId));

        if (code.getUsageLimit() != null && code.getUsageCount() >= code.getUsageLimit()) {
            throw new ConflictException("Promo code has reached its usage limit");
        }
        code.setUsageCount(code.getUsageCount() + 1);
        promoCodeRepository.save(code);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private PromotionalPackage getPackage(UUID id) {
        return packageRepository.findById(id)
            .orElseThrow(() -> NotFoundException.of("PromotionalPackage", id));
    }

    private PromoCode getCode(UUID id) {
        return promoCodeRepository.findById(id)
            .orElseThrow(() -> NotFoundException.of("PromoCode", id));
    }

    private void applyPackageRequest(PromotionalPackage pkg, PromotionalPackageRequest req) {
        pkg.setCode(req.code().toUpperCase());
        pkg.setName(req.name());
        pkg.setDescription(req.description());
        pkg.setDiscountType(req.discountType());
        pkg.setDiscountValue(req.discountValue());
        pkg.setValidFrom(req.validFrom());
        pkg.setValidTo(req.validTo());
        pkg.setMinNights(req.minNights());
        pkg.setMaxNights(req.maxNights());
        pkg.setActive(req.isActive() == null || req.isActive());

        Set<RoomType> roomTypes = req.roomTypeIds() == null ? Set.of()
            : req.roomTypeIds().stream()
                .map(id -> roomTypeRepository.findById(id)
                    .orElseThrow(() -> NotFoundException.of("RoomType", id)))
                .collect(Collectors.toSet());
        pkg.getApplicableRoomTypes().clear();
        pkg.getApplicableRoomTypes().addAll(roomTypes);
    }

    private void applyCodeRequest(PromoCode code, PromoCodeRequest req) {
        code.setCode(req.code().toUpperCase());
        code.setUsageLimit(req.usageLimit());
        code.setValidFrom(req.validFrom());
        code.setValidTo(req.validTo());
        code.setActive(req.isActive() == null || req.isActive());

        PromotionalPackage pkg = null;
        if (req.packageId() != null) {
            pkg = packageRepository.findById(req.packageId())
                .orElseThrow(() -> NotFoundException.of("PromotionalPackage", req.packageId()));
        }
        code.setPromotionalPackage(pkg);
    }
}

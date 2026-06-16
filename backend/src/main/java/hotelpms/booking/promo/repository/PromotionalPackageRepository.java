package hotelpms.booking.promo.repository;

import hotelpms.booking.promo.entity.PromotionalPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PromotionalPackageRepository extends JpaRepository<PromotionalPackage, UUID> {

    boolean existsByCode(String code);

    /**
     * Returns active packages whose validity window overlaps [queryFrom, queryTo].
     * If roomTypeId is null, all active packages are returned.
     * If roomTypeId is provided, packages with no room-type restrictions (applies to all)
     * OR packages that explicitly include that room type are returned.
     */
    @Query("""
        SELECT DISTINCT p FROM PromotionalPackage p
        LEFT JOIN p.applicableRoomTypes rt
        WHERE p.isActive = true
          AND p.validFrom <= :queryTo
          AND p.validTo   >= :queryFrom
          AND (:roomTypeId IS NULL
               OR SIZE(p.applicableRoomTypes) = 0
               OR rt.id = :roomTypeId)
        ORDER BY p.validFrom
        """)
    List<PromotionalPackage> findActiveOffers(
        @Param("queryFrom") LocalDate queryFrom,
        @Param("queryTo")   LocalDate queryTo,
        @Param("roomTypeId") UUID roomTypeId);
}

package hotelpms.booking.promo.repository;

import hotelpms.booking.promo.entity.PromoCode;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface PromoCodeRepository extends JpaRepository<PromoCode, UUID> {

    boolean existsByCode(String code);

    /** Find an active, in-window promo code by its code string. */
    @Query("""
        SELECT c FROM PromoCode c
        WHERE c.code = :code
          AND c.isActive = true
          AND c.validFrom <= :now
          AND c.validTo   >= :now
        """)
    Optional<PromoCode> findActiveByCode(@Param("code") String code, @Param("now") Instant now);

    /** Acquire a pessimistic write lock for atomic usage_count increment. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM PromoCode c WHERE c.id = :id")
    Optional<PromoCode> findByIdForUpdate(@Param("id") UUID id);
}

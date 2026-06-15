package hotelpms.pms.folio.repository;

import hotelpms.pms.folio.entity.FolioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface FolioItemRepository extends JpaRepository<FolioItem, UUID> {

    List<FolioItem> findByFolioId(UUID folioId);

    @Query("SELECT COALESCE(SUM(fi.amount), 0) FROM FolioItem fi WHERE fi.folio.id = :folioId AND fi.voidedAt IS NULL")
    BigDecimal sumActiveCharges(@Param("folioId") UUID folioId);

    @Query("""
        SELECT COALESCE(SUM(fi.amount), 0) FROM FolioItem fi
        WHERE fi.voidedAt IS NULL
          AND CAST(fi.postedAt AS date) = :date
        """)
    BigDecimal sumChargesByDate(@Param("date") LocalDate date);

    @Query("""
        SELECT COALESCE(SUM(fi.amount), 0) FROM FolioItem fi
        WHERE fi.voidedAt IS NULL
          AND CAST(fi.postedAt AS date) BETWEEN :from AND :to
        """)
    BigDecimal sumChargesByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("""
        SELECT COALESCE(SUM(fi.amount), 0) FROM FolioItem fi
        WHERE fi.voidedAt IS NULL
          AND fi.chargeType = :chargeType
          AND CAST(fi.postedAt AS date) BETWEEN :from AND :to
        """)
    BigDecimal sumChargesByTypeAndDateRange(
            @Param("chargeType") String chargeType,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}

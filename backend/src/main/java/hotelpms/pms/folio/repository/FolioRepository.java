package hotelpms.pms.folio.repository;

import hotelpms.pms.folio.entity.Folio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface FolioRepository extends JpaRepository<Folio, UUID> {

    Optional<Folio> findByReservationId(UUID reservationId);

    @Query("""
        SELECT COUNT(f) FROM Folio f
        WHERE CAST(f.createdAt AS date) BETWEEN :from AND :to
        """)
    long countByDateRange(@Param("from") LocalDate from, @Param("to") LocalDate to);
}

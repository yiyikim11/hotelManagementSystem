package hotelpms.pms.guest.repository;

import hotelpms.pms.guest.entity.Guest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface GuestRepository extends JpaRepository<Guest, UUID> {

    boolean existsByEmail(String email);

    Optional<Guest> findByEmailAndDeletedAtIsNull(String email);

    @Query("""
        SELECT g FROM Guest g
        WHERE g.deletedAt IS NULL
        AND (LOWER(g.firstName) LIKE LOWER(CONCAT('%',:q,'%'))
          OR LOWER(g.lastName)  LIKE LOWER(CONCAT('%',:q,'%'))
          OR LOWER(g.email)     LIKE LOWER(CONCAT('%',:q,'%'))
          OR g.phone LIKE CONCAT('%',:q,'%'))
        """)
    Page<Guest> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT g FROM Guest g WHERE g.deletedAt IS NULL")
    Page<Guest> findAllActive(Pageable pageable);
}

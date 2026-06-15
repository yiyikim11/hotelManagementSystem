package hotelpms.common.user.repository;

import hotelpms.common.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    /** Loads user with role and its permissions in a single JOIN FETCH query. */
    @Query("""
        SELECT u FROM User u
        LEFT JOIN FETCH u.role r
        LEFT JOIN FETCH r.permissions
        WHERE u.email = :email
        """)
    Optional<User> findByEmailWithRoleAndPermissions(@Param("email") String email);
}

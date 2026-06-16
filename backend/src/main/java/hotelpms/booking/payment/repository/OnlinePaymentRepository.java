package hotelpms.booking.payment.repository;

import hotelpms.booking.payment.entity.OnlinePaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface OnlinePaymentRepository extends JpaRepository<OnlinePaymentTransaction, UUID> {
}

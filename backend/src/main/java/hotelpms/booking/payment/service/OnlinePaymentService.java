package hotelpms.booking.payment.service;

import hotelpms.booking.payment.entity.OnlinePaymentTransaction;
import hotelpms.booking.payment.entity.PaymentStatus;
import hotelpms.booking.payment.repository.OnlinePaymentRepository;
import hotelpms.booking.onlinebooking.dto.PayOnlineBookingRequest;
import hotelpms.pms.reservation.entity.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class OnlinePaymentService {

    private final OnlinePaymentRepository paymentRepository;

    /**
     * Records a mock payment transaction as SUCCEEDED.
     * Must be called inside an existing @Transactional context.
     */
    @Transactional
    public OnlinePaymentTransaction record(Reservation reservation, PayOnlineBookingRequest req) {
        OnlinePaymentTransaction tx = new OnlinePaymentTransaction();
        tx.setReservation(reservation);
        tx.setGateway(req.gateway());
        tx.setGatewayTransactionId(req.gatewayTransactionId());
        tx.setAmount(req.amount());
        tx.setCurrency(req.currency() != null ? req.currency() : "USD");
        tx.setStatus(PaymentStatus.SUCCEEDED);
        tx.setPaymentMethod(req.paymentMethod());
        tx.setCardBrand(req.cardBrand());
        tx.setCardLast4(req.cardLast4());
        tx.setCompletedAt(Instant.now());
        return paymentRepository.save(tx);
    }
}
